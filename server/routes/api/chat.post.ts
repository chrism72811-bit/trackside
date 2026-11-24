import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";
import { createError, readBody } from "nitro/h3";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default defineHandler(async (event) => {
  const body = await readBody<{ messages?: ChatMessage[] }>(event);
  const messages = body?.messages;

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30 || messages.some((message) => !message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string" || message.content.length > 4000)) {
    throw createError({ statusCode: 400, statusMessage: "Please send a valid chat message." });
  }

  const { openaiApiKey } = useRuntimeConfig();
  if (!openaiApiKey) {
    throw createError({ statusCode: 503, statusMessage: "Trackside AI needs an OpenAI API key to be configured on the server." });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Trackside, a friendly, knowledgeable motorsports assistant. Answer naturally to greetings and casual messages. Help with NASCAR and Formula 1 rules, drivers, teams, race history, tracks, and strategy. Be clear when uncertain and never invent live schedules or results." },
        ...messages,
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: "Trackside could not reach the AI service. Please try again." });
  }

  const result = await response.json() as { choices?: { message?: { content?: string } }[] };
  const reply = result.choices?.[0]?.message?.content;
  if (!reply) throw createError({ statusCode: 502, statusMessage: "Trackside did not receive a reply. Please try again." });
  return { reply };
});
