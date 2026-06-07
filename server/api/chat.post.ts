import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";

// Chat endpoint — replaces the standalone Python FastAPI backend (ADR-0002).
// Direct context injection: the whole knowledge base rides in the system prompt
// (buildSystemPrompt), and full message history is sent for multi-turn context.
// `getModel` and `buildSystemPrompt` are auto-imported from server/utils.
export default defineEventHandler(async (event) => {
  const { messages } = await readBody<{ messages: UIMessage[] }>(event);
  const { model, modelId } = getModel(event);

  const result = streamText({
    model,
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    // Ride the model label along as message metadata so the UI can still show
    // which model answered (the old `model_used` field). No `sources` — there is
    // no retrieval anymore.
    messageMetadata: ({ part }) =>
      part.type === "start" ? { model: modelId } : undefined,
    onError: (e) => (e instanceof Error ? e.message : "chat error"),
  });
});
