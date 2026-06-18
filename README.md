# PIMP - Project & Internship Management Platform

PIMP est une plateforme web moderne conçue pour simplifier et centraliser la gestion des projets universitaires et des stages. Elle permet aux étudiants, enseignants et administrateurs de collaborer efficacement à travers des outils de suivi de tâches (Kanban), des revues de livrables, des grilles d'évaluation et une messagerie instantanée.

Le site est accessible en ligne à l'adresse suivante : https://pimp.tomhisette.dev

## Prérequis

Pour installer et exécuter ce projet localement, vous devez installer les outils suivants sur votre système :

1. **Docker et Docker Compose** : nécessaires pour exécuter la base de données PostgreSQL locale et le service de stockage de fichiers S3 (RustFS).
2. **Bun** : le runtime JavaScript ultra-rapide utilisé comme gestionnaire de paquets et moteur d'exécution des scripts.
3. **Node.js** : requis pour lancer le serveur Next.js personnalisé (server.js) gérant les WebSocket avec Socket.IO.

## Configuration de l'environnement (.env.local)

Avant de démarrer l'application, créez un fichier nommé `.env.local` à la racine du projet. Ce fichier doit contenir les variables d'environnement suivantes adaptées à votre environnement de développement :

```env
# Connexion à la base de données PostgreSQL locale (gérée par Docker)
DATABASE_URL=postgres://pimp:pimp@localhost:5433/pimp

# Clé de chiffrement pour Better Auth (générez-la via la commande : openssl rand -base64 32)
BETTER_AUTH_SECRET=remplacez_par_une_cle_securisee

# URL d'accès à l'application et à l'authentification
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clé API pour l'envoi de mails transactionnels via Resend
RESEND_API_KEY=re_votre_cle_resend

# Configuration du stockage S3 de fichiers (RustFS géré par Docker en local)
STORAGE_ENDPOINT=http://localhost:9010
STORAGE_ACCESS_KEY=pimp-dev-access-key
STORAGE_SECRET_KEY=pimp-dev-secret-key
STORAGE_BUCKET=pimp-deliverables

# Identifiants de l'administrateur par défaut créés lors du peuplement initial
SEED_ADMIN_EMAIL=admin@domain.com
SEED_ADMIN_PASSWORD=mot_de_passe_robuste
```

## Installation et Lancement

Suivez ces étapes dans l'ordre pour démarrer le projet de zéro :

### 1. Cloner le projet et entrer dans le répertoire

```bash
git clone https://github.com/HisetteTom/pimp.git
cd pimp
```

### 2. Configurer le fichier d'environnement

Créez le fichier `.env.local` comme décrit dans la section précédente.

### 3. Installer les dépendances

Exécutez la commande suivante pour télécharger et installer tous les paquets nécessaires :

```bash
bun install
```

### 4. Lancer le script d'initialisation (Setup)

Ce script utilise Docker pour démarrer les conteneurs de base de données et de stockage de fichiers en arrière-plan, vérifie la connexion, puis applique les schémas de base de données Drizzle :

```bash
bun setup
```

### 5. Remplir la base de données avec des données d'exemple (Seeding)

Pour tester l'application avec des rôles et des données de projet pré-générés, exécutez le script de seed suivant :

```bash
bun db:seed
```

### 6. Lancer le serveur de développement

Démarrez le serveur de développement (qui gère l'application Next.js et le serveur Socket.IO pour le chat en temps réel) :

```bash
bun dev
```

L'application est maintenant accessible localement à l'adresse : http://localhost:3000
