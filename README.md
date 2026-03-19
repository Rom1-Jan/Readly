# 📚 Readly

Journal de lecture personnel — React + Vite + Supabase + Google Books API.

---

## 🚀 Installation en 5 étapes

### Étape 1 — Créer votre projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte gratuit
2. Cliquez sur **"New project"**
3. Choisissez un nom (ex: `readly`) et un mot de passe fort
4. Attendez ~2 minutes que le projet se crée

### Étape 2 — Créer les tables

1. Dans Supabase, allez dans **SQL Editor > New Query**
2. Copiez-collez le contenu de `supabase_schema.sql`
3. Cliquez sur **"Run"** — vous devez voir "Success"

### Étape 3 — Désactiver la confirmation email (pour dev)

1. Dans Supabase, allez dans **Authentication > Providers > Email**
2. Désactivez **"Confirm email"**
3. Sauvegardez

### Étape 4 — Clé Google Books API (optionnel mais recommandé)

Sans clé l'API fonctionne mais avec un quota limité.

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un projet → activez **"Books API"**
3. Créez une clé API dans **Credentials**

### Étape 5 — Configurer et lancer

```bash
# 1. Copier le fichier d'environnement
cp .env.example .env
```

Remplissez `.env` avec vos clés :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_GOOGLE_BOOKS_API_KEY=AIza...   # optionnel
```

```bash
# 2. Installer et lancer
npm install
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) 🎉

---

## 📁 Structure du projet

```
readly/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── supabase_schema.sql     ← SQL à exécuter dans Supabase
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx              ← Composant principal
    ├── styles/
    │   └── globals.css
    ├── lib/
    │   ├── supabase.js      ← Client Supabase
    │   └── googleBooks.js   ← API Google Books
    ├── hooks/
    │   ├── useAuth.js       ← Login / register / logout
    │   └── useBooks.js      ← CRUD livres + sessions
    ├── pages/
    │   └── AuthPage.jsx     ← Page de connexion
    └── components/
        ├── Sidebar.jsx      ← Navigation
        ├── BookCard.jsx     ← Carte livre dans la liste
        ├── BookDetail.jsx   ← Panneau détail / sessions / avis
        ├── SearchModal.jsx  ← Recherche Google Books
        └── StatsPage.jsx    ← Page statistiques
```

---

## ✨ Fonctionnalités v1

- ✅ Authentification (inscription / connexion)
- ✅ Recherche de livres via Google Books
- ✅ Bibliothèque (À lire / En cours / Lus)
- ✅ Suivi de progression (pages + pourcentage)
- ✅ Sessions de lecture (pages + durée + note)
- ✅ Notes et avis (étoiles + texte libre)
- ✅ Statistiques (temps total, vitesse, pages lues)
- ✅ Design éditorial élégant

---

## 🔮 Prochaines étapes

- [ ] Objectif annuel (ex : 20 livres cette année)
- [ ] Streak de jours consécutifs
- [ ] Citations / passages favoris
- [ ] Partage de bibliothèque entre amis
- [ ] Recommandations par IA
- [ ] Déploiement Vercel
