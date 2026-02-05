const buildSchema = (count) => ({
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      minItems: count,
      maxItems: count,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          choices: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: { type: "string" }
          },
          answerIndex: { type: "integer", minimum: 0, maximum: 3 }
        },
        required: ["question", "choices", "answerIndex"]
      }
    }
  },
  required: ["questions"]
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed." });
  }

  const { prompt, subject, subtheme, count } = req.body || {};
  const cleanPrompt = String(prompt || "").trim();
  const cleanSubject = String(subject || "").trim();
  const cleanSubtheme = String(subtheme || "").trim();
  const total = Math.min(Math.max(Number(count) || 10, 1), 20);

  if (!cleanPrompt || !cleanSubject || !cleanSubtheme) {
    return res.status(400).json({ message: "Données manquantes." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "Configuration OpenAI manquante." });
  }

  const messages = [
    {
      role: "system",
      content:
        "Tu es un assistant pédagogique. Génère des questions QCM en français pour des élèves du primaire. " +
        "Les questions doivent être simples, claires et adaptées au niveau scolaire."
    },
    {
      role: "user",
      content:
        `Matière: ${cleanSubject}\nSous-thème: ${cleanSubtheme}\n` +
        `Contexte: ${cleanPrompt}\n` +
        `Génère ${total} questions.`
    }
  ];

  const payload = {
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "quiz_questions",
        strict: true,
        schema: buildSchema(total)
      }
    }
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || "Erreur lors de l'appel OpenAI.";
      return res.status(response.status).json({ message });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ message: "Réponse OpenAI vide." });
    }

    const parsed = JSON.parse(content);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ message: err?.message || "Erreur serveur." });
  }
}
