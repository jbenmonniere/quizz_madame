# Quiz Mme Cryshtale - Next.js + Supabase

## Demarrage local
1. Installe les dependances :

```bash
npm install
```

2. Cree un fichier `.env.local` a partir de `.env.example` et renseigne :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Lance en local :

```bash
npm run dev
```

Ouvre ensuite `http://localhost:3000`.

## Supabase
1. Cree un projet Supabase.
2. Execute le SQL de `supabase/schema.sql` dans l'onglet SQL.
3. Renseigne les variables d'environnement (voir `.env.example`).

Notes :
- Les donnees sont stockees dans une seule ligne `quiz_state` (colonne `data` en JSON).
- Au premier lancement, si la ligne n'existe pas, l'app insere les donnees locales.

## Deploiement Vercel
1. Connecte le repo sur Vercel.
2. Ajoute les variables d'environnement dans le projet Vercel :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (optionnel) `NEXT_PUBLIC_SUPABASE_TABLE`
- (optionnel) `NEXT_PUBLIC_SUPABASE_ROW_ID`
3. Build command : `next build` (par defaut).

## Securite
Le schema propose des policies RLS ouvertes pour simplifier les tests. Pour un usage public,
remplace-les par des policies basees sur l'auth Supabase.
