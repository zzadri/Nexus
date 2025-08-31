# Nexus

<div align="center">
  <img src="https://via.placeholder.com/200x200?text=Nexus+Logo" alt="Nexus Logo" width="200" height="200">
  <h3>Un réseau social communautaire pour les professionnels et étudiants IT</h3>
  <p><i>Centré sur la veille technologique, la documentation, les groupes et la sécurité</i></p>
</div>

## 📋 Sommaire

- [Nexus](#nexus)
  - [📋 Sommaire](#-sommaire)
  - [🚀 Présentation](#-présentation)
  - [✨ Fonctionnalités](#-fonctionnalités)
    - [Utilisateurs](#utilisateurs)
    - [Contenu](#contenu)
    - [Groupes](#groupes)
    - [Interactions](#interactions)
    - [Sécurité](#sécurité)
  - [🧱 Architecture technique](#-architecture-technique)
    - [Stack technique](#stack-technique)
      - [Backend (`apps/api`)](#backend-appsapi)
      - [Frontend (`apps/web`)](#frontend-appsweb)
    - [Structure du projet](#structure-du-projet)
  - [🛠 Installation](#-installation)
    - [Prérequis](#prérequis)
    - [Installation rapide](#installation-rapide)
  - [💻 Développement](#-développement)
    - [Commandes utiles](#commandes-utiles)
      - [Backend (`apps/api`)](#backend-appsapi-1)
      - [Frontend (`apps/web`)](#frontend-appsweb-1)
  - [🔒 Sécurité](#-sécurité)
  - [🧪 Tests](#-tests)
  - [👥 Contribution](#-contribution)
  - [📄 Licence](#-licence)

## 🚀 Présentation

**Nexus** est une plateforme dédiée aux professionnels et étudiants du secteur
IT, conçue pour favoriser le partage de connaissances et la mise en réseau.
Contrairement aux réseaux sociaux généralistes, Nexus met l'accent sur :

-   📚 **La veille technologique** : restez à jour avec les dernières
    innovations
-   📝 **La documentation** : partagez et accédez à des ressources techniques de
    qualité
-   👥 **Les groupes thématiques** : rejoignez des communautés spécialisées
-   🔒 **La sécurité** : une protection renforcée de vos données et interactions

## ✨ Fonctionnalités

### Utilisateurs

-   Authentification sécurisée avec 2FA (TOTP)
-   Profils professionnels personnalisables
-   Système de réputation et badges de compétences

### Contenu

-   Publications avec formatage avancé (Markdown)
-   Support pour le partage de code avec coloration syntaxique
-   Système de catégorisation et tags
-   Uploads de fichiers sécurisés

### Groupes

-   Création et gestion de groupes thématiques
-   Contrôle d'accès et modération
-   Événements et annonces

### Interactions

-   Réactions et commentaires
-   Système de notifications personnalisables
-   Recherche avancée (texte, tags, utilisateurs, groupes)

### Sécurité

-   Protection CSRF avancée
-   Sessions sécurisées avec rotation de tokens
-   Système de signalement et modération

## 🧱 Architecture technique

### Stack technique

#### Backend (`apps/api`)

-   **Node.js 22** avec **Fastify 5**
-   Base de données **PostgreSQL** avec **Prisma** comme ORM
-   **MinIO/S3** pour le stockage des fichiers
-   Authentification par session avec JWT et tokens de rafraîchissement
-   Validation des données avec **Zod**
-   Documentation API avec Swagger

#### Frontend (`apps/web`)

-   **React 18** avec **TypeScript**
-   **Vite** comme bundler
-   **Tailwind CSS** pour le style
-   **React Router** pour la navigation
-   **Zustand** pour la gestion d'état
-   Accessibilité et thème sombre/clair

### Structure du projet

```
Nexus
├─ apps
│  ├─ api     # Backend Fastify + Prisma
│  └─ web     # Frontend React + Vite
├─ docker-compose.yml
└─ README.md
```

## 🛠 Installation

### Prérequis

-   Node.js 22+
-   Docker et Docker Compose (pour l'environnement de développement)
-   PostgreSQL (ou via Docker)
-   MinIO (ou via Docker)

### Installation rapide

1. **Cloner le dépôt**

    ```bash
    git clone https://github.com/zzadri/Nexus.git
    cd Nexus
    ```

2. **Configurer l'environnement**

    ```bash
    # Copier les fichiers d'exemple
    cp apps/api/.env.example apps/api/.env
    cp apps/web/.env.example apps/web/.env

    # Éditer les fichiers .env selon votre configuration
    ```

3. **Démarrer avec Docker**

    ```bash
    docker-compose up -d
    ```

4. **Ou installer manuellement**

    ```bash
    # Backend
    cd apps/api
    npm ci
    npx prisma migrate deploy
    npm run dev

    # Frontend (dans un nouveau terminal)
    cd apps/web
    npm ci
    npm run dev
    ```

5. **Accéder à l'application**
    - Frontend: http://localhost:5173
    - API: http://localhost:3000
    - Swagger: http://localhost:3000/documentation

## 💻 Développement

### Commandes utiles

#### Backend (`apps/api`)

```bash
npm ci              # Installer les dépendances
npm run dev         # Lancer en mode développement
npm run build       # Construire pour la production
npm start           # Lancer en mode production

# Prisma
npx prisma format                    # Formater le schema
npx prisma generate                  # Générer le client
npx prisma migrate dev -n "<nom>"    # Créer une migration
```

#### Frontend (`apps/web`)

```bash
npm ci              # Installer les dépendances
npm run dev         # Lancer en mode développement
npm run build       # Construire pour la production
npm run preview     # Prévisualiser la build
```

## 🔒 Sécurité

Nexus implémente plusieurs niveaux de sécurité :

-   **Authentification** : Sessions sécurisées, 2FA (TOTP), rotation des tokens
-   **Cookies** : `HttpOnly; Secure; SameSite=Strict`
-   **Protection CSRF** : Double cookies pattern avec tokens
-   **Headers de sécurité** : CSP stricte via Helmet
-   **Validation des données** : Validation stricte avec Zod
-   **Uploads** : Vérification du type MIME, limites de taille, signatures

## 🧪 Tests

Nexus est couvert par plusieurs types de tests :

```bash
# Backend
cd apps/api
npm test           # Exécuter tous les tests
npm run test:unit  # Tests unitaires
npm run test:e2e   # Tests bout-en-bout

# Frontend
cd apps/web
npm test           # Exécuter tous les tests
```

## 👥 Contribution

Nous accueillons toutes les contributions ! Pour contribuer :

1. Forker le projet
2. Créer une branche (`git checkout -b feat/amazing-feature`)
3. Commiter vos changements (`git commit -m 'feat: add amazing feature'`)
4. Pousser vers la branche (`git push origin feat/amazing-feature`)
5. Ouvrir une Pull Request

Merci de suivre les conventions de commit et la structure du projet.

## 📄 Licence

Ce projet est sous [licence](LICENSE).
