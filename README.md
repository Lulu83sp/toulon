# Déploiement Vercel
1. Importer le dossier sur Vercel (Next.js détecté).
2. Storage → Neon Postgres (Marketplace) : crée DATABASE_URL.
3. Nouvelle installation : exécuter schema.sql dans l'éditeur SQL Neon.
   Installation existante : exécuter migration.sql (verrouillage + images).
4. Variable AUTH_SECRET = chaîne aléatoire 32+ caractères (openssl rand -hex 32).
5. Déployer. Le PREMIER compte inscrit devient Fondateur.
