import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import { prisma } from '../utils/db.js';
import { env } from '../env.js';
import type { PresignBody, CompleteBody } from '../schemas/uploads.schema.js';

const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY },
});

/** Autorisations de suppression : uploader OU membre OWNER/ADMIN du groupe cible */
async function canDeleteAsset(userId: string, asset: { uploaderId: string; groupId: string | null }) {
  if (asset.uploaderId === userId) return true;
  if (!asset.groupId) return false;
  const m = await prisma.membership.findUnique({
    where: { userId_groupId: { userId, groupId: asset.groupId } },
    select: { role: true }
  });
  return !!m && (m.role === 'OWNER' || m.role === 'ADMIN');
}

export class UploadsService {
  static async presignPut(userId: string, body: PresignBody) {
    // clé unique par utilisateur
    const key = `${userId}/${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const cmd = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: body.mime,
      // Pas d’ACL publique : téléchargement via URL signée
      Metadata: { uploaderId: userId, kind: body.kind, postId: body.postId ?? '', groupId: body.groupId ?? '' },
    });

    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 }); // 60s
    // Certains environnements exigent des headers supplémentaires (x-amz-acl, etc.)
    const headers: Record<string,string> = { 'Content-Type': body.mime };

    return { url, bucket: env.S3_BUCKET, key, headers };
  }

  static async complete(userId: string, body: CompleteBody) {
    // enregistre l’asset après PUT réussi côté client
    const asset = await prisma.storageAsset.create({
      data: {
        key: body.key,
        bucket: body.bucket,
        kind: body.kind,
        size: body.size,
        mimeType: body.mimeType,
        uploaderId: userId,
        postId: body.postId ?? null,
        groupId: body.groupId ?? null,
        sha256: body.sha256 ?? null,
      },
      select: {
        id: true, key: true, bucket: true, kind: true, size: true, mimeType: true,
        uploaderId: true, postId: true, groupId: true, sha256: true, createdAt: true
      }
    });
    return { asset };
  }

  static async getOne(userId: string, id: string) {
    // Lecture: autoriser si PUBLIC via post, ou si membre du groupe/owner/uploader.
    // MVP: on autorise l’accès aux métadonnées à toute personne connectée; le contenu est protégé par URL signée.
    const asset = await prisma.storageAsset.findUnique({
      where: { id },
      select: {
        id: true, key: true, bucket: true, kind: true, size: true, mimeType: true,
        uploaderId: true, postId: true, groupId: true, sha256: true, createdAt: true
      }
    });
    if (!asset) return null;
    return { asset };
  }

  static async list(userId: string, page = 1, pageSize = 20) {
    const where: any = {
      OR: [
        { uploaderId: userId },
        // assets des groupes dont je suis membre
        { group: { members: { some: { userId } } } }
      ]
    };
    const [items, total] = await Promise.all([
      prisma.storageAsset.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, key: true, bucket: true, kind: true, size: true, mimeType: true,
          uploaderId: true, postId: true, groupId: true, sha256: true, createdAt: true
        }
      }),
      prisma.storageAsset.count({ where })
    ]);
    return { items, total, page, pageSize };
  }

  static async signedGetUrl(userId: string, id: string, expiresInSeconds = 300) {
    const asset = await prisma.storageAsset.findUnique({ where: { id } });
    if (!asset) return null;

    // contrôle d’accès minimal: l’appelant doit être uploader ou membre du groupe
    const allowed = await canDeleteAsset(userId, { uploaderId: asset.uploaderId, groupId: asset.groupId });
    if (!allowed && asset.postId == null) return null; // si lié à un post public on pourra assouplir plus tard

    const cmd = new GetObjectCommand({ Bucket: asset.bucket, Key: asset.key });
    const url = await getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds });
    return { url, expiresIn: expiresInSeconds };
  }

  static async remove(userId: string, id: string) {
    const asset = await prisma.storageAsset.findUnique({ where: { id } });
    if (!asset) return null;
    const allowed = await canDeleteAsset(userId, { uploaderId: asset.uploaderId, groupId: asset.groupId });
    if (!allowed) throw new Error('FORBIDDEN');

    // suppression S3 + enregistrement
    await s3.send(new DeleteObjectCommand({ Bucket: asset.bucket, Key: asset.key }));
    await prisma.storageAsset.delete({ where: { id } });
    return true;
  }
}
