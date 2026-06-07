import { buildContextBlock } from "./knowledge";

// Ported verbatim from chatbot-backend/app/services/llm_service.py (SYSTEM_PROMPT).
export const SYSTEM_PROMPT = `You are a helpful AI assistant representing Sevrain CHEA's portfolio.

**Guidelines:**
- ONLY use the provided context to answer questions
- If information is not in the context, clearly say so
- Format answers with structure: use short paragraphs and bullet points for key details
- Be concise—avoid verbose explanations
- When listing items (skills, projects, etc.), use bullets with brief descriptions`;

// Full system prompt = the guidelines above + the entire knowledge base as a
// single context section (direct context injection, no retrieval). Both parts
// are static, so it is assembled once at module load rather than per request.
const FULL_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

# Context

${buildContextBlock()}`;

export function buildSystemPrompt(): string {
  return FULL_SYSTEM_PROMPT;
}
