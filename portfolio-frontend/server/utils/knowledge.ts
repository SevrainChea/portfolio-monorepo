import data from "../data/personal_data.json";

interface KnowledgeDoc {
  text: string;
  source?: string;
}

// The full knowledge base is small enough (~10KB) to inject directly into the
// system prompt, so there is no retrieval step — every document is included on
// every request. Mirrors `_build_prompt` in the old Python backend
// (chatbot-backend/app/services/llm_service.py) minus the per-doc `relevance`
// score, which no longer exists without retrieval.
//
// The data is static, so the block is built once at module load rather than per
// request.
const CONTEXT_BLOCK = (data as KnowledgeDoc[])
  .map(
    (doc, i) =>
      `Context ${i + 1} [from: ${doc.source ?? "unknown"}]:\n${doc.text}`,
  )
  .join("\n\n");

export function buildContextBlock(): string {
  return CONTEXT_BLOCK;
}
