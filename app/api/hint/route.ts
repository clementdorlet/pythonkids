import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  const { code, instruction, expectedOutput, currentOutput, levelName, hintCount } = await request.json() as {
    code: string;
    instruction: string;
    expectedOutput: string;
    currentOutput?: string;
    levelName?: string;
    hintCount?: number;
  };

  if (!code || !instruction) {
    return Response.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // Sans clé IA (mode « tout gratuit » / stores) : indices pédagogiques progressifs
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-VOTRE")) {
    const n = hintCount ?? 0;
    let hint: string;
    if (!currentOutput?.trim()) {
      hint = "Ton programme n'affiche rien pour l'instant. As-tu bien utilisé print() ? Lance ton code pour voir ce qu'il se passe. Tu vas y arriver ! 💪";
    } else if (n < 1) {
      hint = "Compare ta sortie avec la sortie attendue, caractère par caractère : les majuscules, les espaces et la ponctuation comptent ! Tu es sur la bonne voie. 🔍";
    } else if (n < 2) {
      hint = `Regarde bien la différence : on attend « ${expectedOutput} » et ton code affiche « ${currentOutput.trim()} ». Qu'est-ce qui change entre les deux ? Tu y es presque ! ✨`;
    } else {
      hint = "Relis la consigne lentement, puis vérifie ton code ligne par ligne. Les erreurs se cachent souvent dans les petits détails (guillemets, parenthèses, orthographe). Courage, tu y es presque ! 🚀";
    }
    return Response.json({ hint });
  }

  try {
    const isEasy = (hintCount ?? 0) < 2;
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: `Tu es un professeur de Python bienveillant pour enfants (8-18 ans).
Tu donnes UN SEUL indice court, encourageant et adapté à l'âge.
${isEasy ? "Donne un indice vague qui fait réfléchir sans donner la réponse." : "Donne un indice plus précis car l'élève est bloqué depuis un moment."}
Termine toujours par une phrase d'encouragement.
Réponds en français. Max 3 phrases.`,
      messages: [
        {
          role: "user",
          content: `Exercice : ${instruction}
Sortie attendue : ${expectedOutput}
Code de l'élève :
\`\`\`python
${code}
\`\`\`
${currentOutput ? `Sa sortie actuelle : ${currentOutput}` : ""}
${levelName ? `Niveau : ${levelName}` : ""}

Donne un indice adapté.`,
        },
      ],
    });

    const hint = (message.content[0] as { type: string; text: string }).text;
    return Response.json({ hint });
  } catch {
    return Response.json({ error: "Erreur IA" }, { status: 500 });
  }
}
