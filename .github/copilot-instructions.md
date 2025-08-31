# 🎯 But & portée

- **Nom de code** : Nexus
- **Objet** : réseau social communautaire pour les pros/étudiants IT, centré sur la **veille**, la **documentation**, les **groupes** et la **sécurité**.
- **Copilot DOIT** :
  - Implémenter des features backend (Fastify + Prisma + PostgreSQL + MinIO) et frontend (React + Vite + Tailwind + Zustand).
  - Corriger des bugs, ajouter des tests, tenir le Swagger à jour, optimiser accessibilité/performances.
  - Respecter **Clean Architecture** (routes ⇢ controllers ⇢ services ⇢ utils) et la structure **feature-first** côté web.
- **Copilot NE DOIT PAS** :
  - Exposer des secrets/clefs, ni stocker des tokens d’auth dans `localStorage/sessionStorage`.
  - Introduire du code non typé/non testé, ni désactiver des protections (CSP, CSRF, cookies `HttpOnly`).
  - Dévier de la structure des dossiers sans justification (ni déplacer des fichiers au hasard).

---

# 🧱 Stack & architecture (TL;DR)

- **Monorepo**
apps/
api/ # Node 22, Fastify 5, Prisma, PostgreSQL, MinIO (S3 compatible), Zod, Swagger
web/ # React 18 + TS, Vite, Tailwind, React Router, Zustand, react-icons

- **Backend (`apps/api`)**
- **Node 22**, **Fastify 5** (plugins: `@fastify/helmet`, `@fastify/cors`, `@fastify/cookie`, `@fastify/rate-limit`, Swagger).
- Auth **session-based** : `access_token` (JWT court) + `refresh_token` (opaque, DB, rotation), **CSRF double-cookies**, **2FA TOTP**.
- **Prisma** (PostgreSQL) – schéma fourni (User, Session, Group, Membership, Post, Comment, Reaction, FileObject, Notification, Report).
- **MinIO/S3** : presign + complete.
- Structure (obligatoire) :
  ```
  ```
Nexus
├─ apps
│  ├─ web # sera décrit plus bas
│  └─ api
│     ├─ Dockerfile
│     ├─ package-lock.json
│     ├─ package.json
│     ├─ prisma
│     │  ├─ migrations
│     │  │  └─ ....
│     │  └─ schema.prisma
│     └─ src
│        ├─ controllers # logique HTTP (parse input -> appelle services)
│        │  ├─ auth.controller.ts
│        │  ├─ groups.controller.ts
│        │  ├─ posts.controller.ts
│        │  ├─ reports.controller.ts
│        │  ├─ search.controller.ts
│        │  └─ uploads.controller.ts
│        ├─ env.ts
│        ├─ middlewares # ex: csrf
│        │  └─ csrf.ts
│        ├─ plugins  # ex: security, swagger
│        │  ├─ security.ts
│        │  └─ swagger.ts
│        ├─ routes # définitions de toute les routes Fastify
│        │  ├─ auth.routes.ts
│        │  ├─ groups.routes.ts
│        │  ├─ posts.routes.ts
│        │  ├─ reports.routes.ts
│        │  ├─ search.routes.ts
│        │  └─ uploads.routes.ts
│        ├─ schemas # Zod schemas (input/output)
│        │  ├─ auth.schema.ts
│        │  ├─ common.schema.ts
│        │  ├─ groups.schema.ts
│        │  ├─ posts.schema.ts
│        │  ├─ reports.schema.ts
│        │  ├─ search.schema.ts
│        │  └─ uploads.schema.ts
│        ├─ server.ts
│        ├─ services # logique métier + accès Prisma/S3
│        │  ├─ auth.service.ts
│        │  ├─ groups.service.ts
│        │  ├─ posts.service.ts
│        │  ├─ reports.service.ts
│        │  ├─ search.service.ts
│        │  └─ uploads.service.ts
│        ├─ types # Dossier de toutes les définitions de types / interfaces
│        │  └─ fastify.d.ts
│        └─ utils # db, crypto, env
│           ├─ crypto.ts
│           └─ db.ts
├─ docker-compose.yml
├─ LICENSE
└─ README.md

- **Frontend (`apps/web`)**
- **React 18 + TS**, **Vite**, **Tailwind CSS**, **React Router**, **Zustand** (auth & CSRF), **react-icons**.
- Architecture **feature-first** :
```
Nexus
├─ apps
│  ├─ api # décrit plus haut
│  └─ web
│     ├─ Dockerfile # fichier de build + production
│     ├─ index.html # point d'entrée HTML
│     ├─ package-lock.json
│     ├─ package.json
│     ├─ postcss.config.cjs
│     ├─ src
│     │  ├─ app # App, routes + store (Zustand)
│     │  │  ├─ App.tsx
│     │  │  ├─ routes.tsx
│     │  │  └─ store
│     │  │     ├─ auth.store.ts
│     │  │     └─ csrf.store.ts
│     │  ├─ features # api clients + types par feature (auth, csrf, ...)
│     │  │  ├─ auth # login, register, logout, refresh, 2FA setup/verify
│     │  │  │  ├─ api.ts
│     │  │  │  ├─ hooks.ts
│     │  │  │  ├─ types.ts
│     │  │  │  └─ useCsrfToken.ts
│     │  │  ├─ csrf # get CSRF token
│     │  │  │  └─ api.ts
│     │  │  └─ password-quality # estimation de la qualité des mots de passe
│     │  │     ├─ MostPopularPasswords.ts
│     │  │     ├─ MostPopularPasswords.txt
│     │  │     ├─ PasswordQualityCalculator.ts
│     │  │     ├─ PopularPasswords.ts
│     │  │     ├─ QualityEstimator.ts
│     │  │     └─ types.ts
│     │  ├─ main.tsx
│     │  ├─ pages # Landing, Auth (Login, Register, TOTP setup/verify), Dashboard ....
│     │  │  ├─ Auth
│     │  │  │  ├─ Login.tsx
│     │  │  │  └─ Register.tsx
│     │  │  ├─ Dashboard
│     │  │  │  └─ Dashboard.tsx
│     │  │  └─ Landing
│     │  │     └─ Landing.tsx
│     │  ├─ shared
│     │  │  └─ ui
│     │  │     ├─ CsrfError.tsx
│     │  │     ├─ FeatureCard.tsx
│     │  │     ├─ PasswordStrengthIndicator.tsx
│     │  │     ├─ PasswordStrengthIndicatorWithEntropy.tsx
│     │  │     └─ UseCaseCard.tsx
│     │  ├─ styles # index.css (Tailwind)
│     │  │  └─ index.css
│     │  ├─ types
│     │  │  ├─ index.ts
│     │  │  ├─ ui # composants réutilisables / générique (FeatureCard, UseCaseCard, ...)
│     │  │  │  ├─ FeatureCard.ts
│     │  │  │  ├─ index.ts
│     │  │  │  └─ UseCaseCard.ts
│     │  │  └─ ui.ts
│     │  ├─ utils # wrappers, containers
│     │  │  ├─ cookies.ts
│     │  │  ├─ toast.ts
│     │  │  ├─ validation-entropy.ts
│     │  │  └─ validation.ts
│     │  └─ vite-env.d.ts
│     ├─ tailwind.config.cjs
│     ├─ tsconfig.json
│     └─ vite.config.ts
├─ docker-compose.yml
├─ LICENSE
└─ README.md
```

- **Standards** : REST, OpenAPI/Swagger, CSP stricte, cookies `HttpOnly; Secure; SameSite=Strict`, validation **Zod** partout.

---

# 🔧 Commandes (installer, lancer, vérifier)

> Copilot DOIT raisonner comme si ces commandes sont exécutées, et ne proposer des patchs que si ces étapes passent.

## Backend (`apps/api`)
- **Install** : `npm ci`
- **Dev** : `npm run dev` _(tsx watch `src/server.ts`)_
- **Build** : `npm run build`
- **Start** : `npm start`
- **Prisma** :
- `npx prisma format`
- `npx prisma generate`
- `npx prisma migrate dev -n "<message>"`
- **Typecheck** : `npm run typecheck` (si script présent)
- **Lint/Format** : `npm run lint` / `npm run format` (si présents)
- **Sécurité** : `npm audit --audit-level=high`

## Frontend (`apps/web`)
- **Install** : `npm ci`
- **Dev** : `npm run dev`
- **Build** : `npm run build`
- **Preview** : `npm run preview`
- **Typecheck** : `npm run typecheck` (si script présent)
- **Lint/Format** : `npm run lint` / `npm run format`
- **Tailwind** : `@tailwind base; @tailwind components; @tailwind utilities;` via `styles/index.css`

---

# 🧪 Tests : attentes minimales

- **Toujours** fournir des tests pour : nouvelles fonctions/bugfix/regressions critiques.
- **Cibles** (initiales) :
- API **unit/integration** (Jest/Vitest) sur services & controllers (mocker Prisma/S3).
- Web **unit** (Vitest + React Testing Library) pour stores & composants clés.
- **Règles** :
- Pas de tests flake (fake timers pour dates/TOTP, mock réseau/MinIO).
- Un bugfix = **test rouge** ➜ **fix** ➜ **test vert**.

---

# ✅ Qualité & sécurité (garde-fous)

- **Interdits** :
- Tokens d’auth dans `localStorage`/`sessionStorage`.
- `eval`, SQL non paramétré, désactivation de `helmet`, contournement CSRF.
- Secrets en clair (utiliser `.env`, jamais commit).
- **Validation** :
- Entrées **obligatoirement** validées par **Zod** (schemas in/out).
- Côté UI : encoder les sorties, pas d’HTML inline non maîtrisé.
- **Auth/CSRF** :
- Cookies `HttpOnly; Secure; SameSite=Strict` gérés par l’API.
- Avant tout `POST/PUT/PATCH/DELETE` côté web : **GET `/api/v1/auth/csrf`** puis envoyer le header `X-CSRF-TOKEN` et `credentials: 'include'`.
- **Dépendances** :
- Versions **pinnées** (lockfile), pas de copyleft fort en runtime sans accord.
- Faire `npm audit` et corriger High/Critical.
- **Menaces** : XSS, CSRF, IDOR, SSRF, RCE → appliquer contre-mesures (CSP, authz au niveau services, whitelist uploads, etc.).

---

# 🧭 Conventions

- **Nommage**
- `camelCase` (vars/fn), `PascalCase` (types/components), `SCREAMING_SNAKE_CASE` (const env).
- **Backend**
- **routes** : wiring Fastify + (optionnel) check params/query/body **déjà validés** via schema attaché.
- **controllers** : parse `req`, appellent **services**, mappent erreurs → codes HTTP.
- **services** : logique métier, **aucun** couplage à Fastify (purement TS), Prisma/S3 injectés.
- **schemas** : Zod (input/output). **Swagger** doit refléter les endpoints.
- **Frontend**
- **features/** : `api.ts` (fetchers), `types.ts`.
- **store/** : Zustand typé (`create<AuthState>()`), pas de `any`.
- **shared/ui/** : briques réutilisables (ex. `FeatureCard`, `UseCaseCard`).
- **Accessibilité** : labels toujours associés (`htmlFor`/`id`), roles ARIA, focus-visible, contraste suffisant.
- **Thème** : dark par défaut, switch **persisté** (localStorage) – ne jamais y mettre des secrets.

---

# 🔀 PR & commits

- **Branches** : `feat/…`, `fix/…`, `chore/…`, `refactor/…`
- **Conventional Commits** (ex: `feat(api): add TOTP verify endpoint`).
- **Description PR (obligatoire)** :
1) Contexte/problème
2) Solution (design & compromis)
3) Tests (ce qui est couvert)
4) Impacts (breaking? migrations?)
5) Checklist (ci-dessous)
- **Liens** : `Closes #<issue>`.

---

# 🧾 Sorties attendues par type de tâche

- **Implémentation** : *plan court* → *patch en diff unifié* → *tests* → *cmds à lancer* → *risques/rollback*.
- **Bugfix** : test rouge → fix → test vert + notes de régression.
- **Refactor** : pas de changement fonctionnel, mesures de perf si sensibles.
- **Migration DB** : plan, steps, `prisma migrate`, fallback.

**Format (Chat → patch)**
1. Plan (liste d’étapes)
2. Diffs unifiés par fichier :
 ```diff
 --- a/path/file.ts
 +++ b/path/file.ts
 @@
 - // before
 + // after