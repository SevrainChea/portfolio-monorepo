import { ref, computed, nextTick, onMounted, onUnmounted, watch } from "vue";
import { Chat } from "@ai-sdk/vue";
import { DefaultChatTransport } from "ai";

const ERROR_COPY = "Sorry, something went wrong. Please try again.";

export interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  sources?: string[];
  model_used?: string;
}

export function useChat() {
  // AI SDK v6 Chat class drives the network + message state. Same-origin Nitro
  // route, so no base URL needed (the old NUXT_PUBLIC_API_BASE is gone).
  const chat = new Chat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const input = ref("");
  const messagesEl = ref<HTMLElement | null>(null);
  const inputEl = ref<HTMLTextAreaElement | null>(null);
  const userAtBottom = ref(true);
  const showScrollCTA = ref(false);

  const loading = computed(
    () => chat.status === "submitted" || chat.status === "streaming",
  );

  // Adapter — map AI SDK UIMessages onto the { role, content, streaming,
  // model_used } shape the four themed skins already consume, so none of them
  // have to change. `sources` is intentionally left undefined (retrieval is
  // gone), which makes the skins' source chips vanish on their own.
  const messages = computed<Message[]>(() => {
    const mapped: Message[] = chat.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m, i, arr) => {
        const content = m.parts
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("");
        const isLast = i === arr.length - 1;
        const streaming =
          m.role === "assistant" && isLast && chat.status === "streaming";
        const model = (m.metadata as { model?: string } | undefined)?.model;
        return {
          role: m.role as "user" | "assistant",
          content,
          streaming,
          // Only surface the model label once the bubble has settled.
          model_used: streaming ? undefined : model,
        };
      });

    // Error parity with the old composable: show the fallback copy in the
    // trailing assistant bubble (or append one if the error landed first).
    if (chat.error) {
      const last = mapped[mapped.length - 1];
      if (last && last.role === "assistant") {
        last.content = last.content || ERROR_COPY;
        last.streaming = false;
      } else {
        mapped.push({ role: "assistant", content: ERROR_COPY, streaming: false });
      }
    }

    return mapped;
  });

  const autoResize = () => {
    const el = inputEl.value;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // Jump the feed to the newest message on the next DOM tick.
  const scrollFeedToBottom = () => {
    nextTick(() => {
      if (messagesEl.value) {
        messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
      }
    });
  };

  const scrollToBottom = () => {
    // Only auto-scroll if the user is already at the bottom
    if (!userAtBottom.value) return;
    scrollFeedToBottom();
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

    input.value = "";
    if (inputEl.value) inputEl.value.style.height = "auto";
    scrollToBottom();

    // The Chat class owns the messages array — it pushes the user message and
    // the streaming assistant message itself.
    await chat.sendMessage({ text });
    nextTick(() => inputEl.value?.focus());
  };

  const scrollToBottomFromCTA = () => {
    showScrollCTA.value = false;
    userAtBottom.value = true;
    scrollFeedToBottom();
  };

  // Keep the view pinned to the newest token while streaming — the trailing
  // message's text grows token by token, so watching it alone is enough.
  watch(
    () => messages.value.at(-1)?.content,
    () => scrollToBottom(),
  );

  // When a stream finishes while the user has scrolled up, offer the CTA —
  // matching the old `done`-event behavior.
  watch(
    () => chat.status,
    (status, prev) => {
      if (prev === "streaming" && status !== "streaming" && !userAtBottom.value) {
        showScrollCTA.value = true;
      }
    },
  );

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
