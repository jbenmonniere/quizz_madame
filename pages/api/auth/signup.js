import { createClient } from "@supabase/supabase-js";

const normalizeUsername = (value = "") => value.trim().toLowerCase();
const sanitizeUsername = (value = "") => normalizeUsername(value).replace(/[^a-z0-9._-]/g, "");
const usernameToEmail = (value = "") => `${sanitizeUsername(value) || "enseignante"}@quizz-madame.app`;

const isValidUsername = (value = "") => {
  if (!value) return false;
  if (value.includes("@")) return false;
  return /^[a-zA-Z0-9._-]{3,}$/u.test(value);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed." });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis." });
  }
  if (!isValidUsername(username)) {
    return res.status(400).json({ message: "Nom d'utilisateur invalide." });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ message: "Configuration serveur manquante." });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const email = usernameToEmail(username);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username: username.trim() }
  });

  if (error) {
    return res.status(400).json({ message: error.message || "Erreur d'inscription." });
  }

  const normalized = normalizeUsername(username);
  await admin.from("teacher_profiles").upsert(
    { id: data.user.id, username: normalized },
    { onConflict: "id" }
  );

  return res.status(200).json({ ok: true });
}
