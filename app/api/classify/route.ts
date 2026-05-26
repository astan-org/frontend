import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const SYSTEM = `You are CPAR (Cross-Platform AI Response), a specialized AI safety classification engine used by trust-and-safety teams across major social media platforms.

Your task: analyse an online harm incident report and return a JSON classification.

Output ONLY a valid JSON object — no markdown fences, no explanation, no surrounding text. Just the raw JSON.

Required schema (all fields required):
{
  "risk_level": "critical" | "high" | "medium" | "low",
  "harm_type": string (concise label, 2–6 words),
  "severity": number (integer 1–10),
  "confidence": number (integer 50–99),
  "summary": string (2–3 sentences: what happened + recommended action),
  "ai_reasoning": string (detailed: specific signals you observed in THIS report, why this classification, which patterns match),
  "matched_policies": string[] (select applicable: "DSA·Art.17", "COPPA·§312", "NCMEC·§2258A", "FTC·Sec.5", "UK Online Safety Act", "GDPR·Art.17"),
  "dispatch_targets": string[] (subset of: "TikTok", "Meta (Facebook/Instagram)", "Zoom", "Discord", "Roblox", "Snapchat"),
  "platform_actions": object (keys = each dispatch_target, values = specific action string),
  "legal_basis": string (comma-separated applicable frameworks),
  "compliance_flags": string[] (applicable: "DSA_ART17", "NCMEC_MANDATORY", "CHILD_SAFETY_OVERRIDE", "FINANCIAL_HARM", "COORDINATED_INAUTHENTIC", "IMPERSONATION", "HARASSMENT_REPEAT", "HATE_SPEECH", "COORDINATED"),
  "actor_persistence_risk": string (brief risk assessment),
  "estimated_reach": string (brief impact estimate),
  "ncmec_required": boolean (true ONLY for child safety per 18 U.S.C. § 2258A)
}

Strict rules:
- Child safety incidents: severity must be 10, ncmec_required must be true, risk_level must be "critical", include "NCMEC_MANDATORY" and "CHILD_SAFETY_OVERRIDE"
- Make ai_reasoning specific — reference actual details from the report, not generic text
- dispatch_targets: only platforms directly involved or at risk of actor migration
- Be decisive on risk_level — do not hedge
- platform_actions values must be action strings, not empty`;

export async function POST(req: Request) {
  try {
    const { text } = await req.json() as { text: string };

    const anthropicStream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Incident report:\n\n${text}` }],
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(new TextEncoder().encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
      cancel() {
        anthropicStream.abort();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('[CPAR classify]', err);
    return new Response(JSON.stringify({ error: 'Classification failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
