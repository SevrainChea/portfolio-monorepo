import { ref, nextTick, onMounted, onUnmounted } from "vue";

type SSEEvent =
  | { type: "chunk"; content: string }
  | {
      type: "done";
      conversation_id: string;
      sources: string[];
      model_used: string;
    }
  | { type: "error"; message: string };

export interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  sources?: string[];
  model_used?: string;
}

export function useChat() {
  const config = useRuntimeConfig();

  const messages = ref<Message[]>([]);
  const input = ref("");
  const loading = ref(false);
  const conversationId = ref<string | null>(null);
  const messagesEl = ref<HTMLElement | null>(null);
  const inputEl = ref<HTMLTextAreaElement | null>(null);
  const userAtBottom = ref(true);
  const showScrollCTA = ref(false);

  const autoResize = () => {
    const el = inputEl.value;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const scrollToBottom = () => {
    // Only auto-scroll if user is already at the bottom
    if (!userAtBottom.value) return;
    nextTick(() => {
      if (messagesEl.value) {
        messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
      }
    });
  };

  const handleScroll = () => {
    if (!messagesEl.value) return;
    const el = messagesEl.value;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    userAtBottom.value = isAtBottom;
    if (isAtBottom && showScrollCTA.value) {
      showScrollCTA.value = false;
    }
  };

  const send = async () => {
    const text = input.value.trim();
    if (!text || loading.value) return;

    messages.value.push({ role: "user", content: text });
    input.value = "";
    if (inputEl.value) inputEl.value.style.height = "auto";
    loading.value = true;
    scrollToBottom();

    // Add an empty assistant message to stream into
    const assistantMsg: Message = {
      role: "assistant",
      content: "",
      streaming: true,
    };
    messages.value.push(assistantMsg);
    const msgIndex = messages.value.length - 1;

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
      const res = await fetch(`${config.public.apiBase}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId.value,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Flush any remaining bytes in the decoder
          const remaining = decoder.decode();
          if (remaining) buffer += remaining;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw) continue;

          let event: SSEEvent;
          try {
            event = JSON.parse(raw) as SSEEvent;
          } catch {
            continue;
          }

          if (event.type === "chunk") {
            messages.value[msgIndex].content += event.content;
            scrollToBottom();
          } else if (event.type === "done") {
            messages.value[msgIndex].streaming = false;
            messages.value[msgIndex].sources = event.sources;
            messages.value[msgIndex].model_used = event.model_used;
            conversationId.value = event.conversation_id ?? null;

            // Show CTA if user scrolled up during streaming
            if (!userAtBottom.value) {
              showScrollCTA.value = true;
            }

            scrollToBottom();
          } else if (event.type === "error") {
            messages.value[msgIndex].content =
              "Sorry, something went wrong. Please try again.";
            messages.value[msgIndex].streaming = false;
          }
        }
      }
    } catch (e) {
      console.error("[chat] Streaming error:", e);
      messages.value[msgIndex].content =
        "Sorry, something went wrong. Please try again.";
      messages.value[msgIndex].streaming = false;
    } finally {
      reader?.cancel();
      loading.value = false;
      nextTick(() => inputEl.value?.focus());
    }
  };

  const scrollToBottomFromCTA = () => {
    showScrollCTA.value = false;
    userAtBottom.value = true;
    nextTick(() => {
      if (messagesEl.value) {
        messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
      }
    });
  };

  onMounted(() => {
    if (messagesEl.value) {
      messagesEl.value.addEventListener("scroll", handleScroll);
    }
  });

  onUnmounted(() => {
    if (messagesEl.value) {
      messagesEl.value.removeEventListener("scroll", handleScroll);
    }
  });

  return {
    messages,
    input,
    loading,
    conversationId,
    messagesEl,
    inputEl,
    userAtBottom,
    showScrollCTA,
    autoResize,
    scrollToBottom,
    handleScroll,
    send,
    scrollToBottomFromCTA,
  };
}
