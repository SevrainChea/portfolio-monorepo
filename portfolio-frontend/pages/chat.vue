<template>
  <div class="flex h-full flex-col gap-4">
    <!-- Header -->
    <div class="flex shrink-0 items-center gap-3 py-2">
      <NuxtLink
        to="/"
        class="text-fg-muted hover:text-fg-light flex items-center gap-1.5 text-sm transition-colors duration-300"
      >
        <Icon name="uil:arrow-left" size="18" />
        Back
      </NuxtLink>
      <span class="text-white/10">|</span>
      <span class="text-fg-muted text-sm">Ask me anything</span>
    </div>

    <!-- Chat card -->
    <GlassCard
      class="mx-auto mb-4 flex w-full max-w-4xl flex-1 flex-col overflow-hidden !p-0"
    >
      <!-- Messages -->
      <div ref="messagesEl" class="flex-1 overflow-y-auto p-6">
        <div class="flex flex-col gap-6">
          <!-- Empty state -->
          <div
            v-if="messages.length === 0"
            class="flex flex-col items-center gap-3 py-20 text-center"
          >
            <Icon name="uil:comment-dots" size="36" class="text-white/20" />
            <p class="text-fg-muted text-sm">
              Ask me anything about Sévrain's experience, skills, or projects.
            </p>
          </div>

          <!-- Message bubbles -->
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
            class="flex flex-col gap-1"
          >
            <div
              :class="
                msg.role === 'user'
                  ? 'bg-primary/20 border-primary/30 self-end'
                  : 'self-start border-white/10 bg-black/30'
              "
              class="max-w-[85%] rounded-2xl border px-4 py-3 backdrop-blur-sm"
            >
              <p class="text-fg-light text-sm leading-relaxed whitespace-pre-wrap">
                {{ msg.content }}<span
                  v-if="msg.streaming"
                  class="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-white/60 align-middle"
                />
              </p>
            </div>

            <!-- Metadata chips (assistant only, after streaming) -->
            <div
              v-if="msg.role === 'assistant' && !msg.streaming && (msg.sources?.length || msg.model_used)"
              class="flex flex-wrap items-center gap-1.5 px-1"
            >
              <span
                v-for="source in msg.sources"
                :key="source"
                class="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/40"
              >
                {{ source }}
              </span>
              <span
                v-if="msg.model_used"
                class="text-xs text-white/20"
              >
                {{ msg.model_used }}
              </span>
            </div>
          </div>

          <!-- Typing indicator (shown only before the first streaming chunk arrives) -->
          <div v-if="loading && !messages.some((m) => m.streaming)" class="flex items-start">
            <div
              class="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-sm"
            >
              <div class="flex h-4 items-center gap-1.5">
                <span
                  class="bg-fg-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]"
                />
                <span
                  class="bg-fg-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]"
                />
                <span
                  class="bg-fg-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll to Bottom CTA -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <button
          v-if="showScrollCTA"
          @click="scrollToBottomFromCTA"
          class="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-2 text-xs font-medium text-fg-light hover:bg-primary/30 transition-colors duration-200"
          aria-label="Scroll to latest messages"
        >
          <Icon name="uil:arrow-down" size="16" />
          Scroll to latest
        </button>
      </Transition>

      <!-- Input -->
      <div class="shrink-0 border-t border-white/10 p-4">
        <form
          @submit.prevent="send"
          class="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-sm transition-colors duration-300 focus-within:border-white/20"
        >
          <textarea
            ref="inputEl"
            v-model="input"
            @keydown.enter.exact.prevent="send"
            @input="autoResize"
            placeholder="Type a message…"
            rows="1"
            class="text-fg-light max-h-40 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-white/30"
            :class="{ 'opacity-50': loading }"
            :disabled="loading"
          />
          <button
            type="submit"
            :disabled="!input.trim() || loading"
            class="text-fg-muted hover:text-fg-highlight flex flex-shrink-0 items-center justify-center transition-colors duration-300 disabled:text-white/20"
          >
            <Icon name="uil:message" size="20" />
          </button>
        </form>
        <p class="mt-2 text-center text-xs text-white/20">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </GlassCard>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';

const config = useRuntimeConfig();

type SSEEvent =
  | { type: "chunk"; content: string }
  | { type: "done"; conversation_id: string; sources: string[]; model_used: string }
  | { type: "error"; message: string };

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  sources?: string[];
  model_used?: string;
}

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
  const isAtBottom = (el.scrollTop + el.clientHeight) >= (el.scrollHeight - 50);

  // Update state
  userAtBottom.value = isAtBottom;

  // Auto-dismiss CTA if scrolled to bottom
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
  const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
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
          messages.value[msgIndex].content = "Sorry, something went wrong. Please try again.";
          messages.value[msgIndex].streaming = false;
        }
      }
    }
  } catch (e) {
    console.error("[chat] Streaming error:", e);
    messages.value[msgIndex].content = "Sorry, something went wrong. Please try again.";
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
    messagesEl.value.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  if (messagesEl.value) {
    messagesEl.value.removeEventListener('scroll', handleScroll);
  }
});
</script>
