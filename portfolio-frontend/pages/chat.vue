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
              <p
                class="text-fg-light text-sm leading-relaxed whitespace-pre-wrap"
              >
                {{ msg.content }}
              </p>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="loading" class="flex items-start">
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
const config = useRuntimeConfig();

interface Message {
  role: "user" | "assistant";
  content: string;
}

const messages = ref<Message[]>([]);
const input = ref("");
const loading = ref(false);
const conversationId = ref<string | null>(null);
const messagesEl = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLTextAreaElement | null>(null);

const autoResize = () => {
  const el = inputEl.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
    }
  });
};

const send = async () => {
  const text = input.value.trim();
  if (!text || loading.value) return;

  messages.value.push({ role: "user", content: text });
  input.value = "";
  if (inputEl.value) inputEl.value.style.height = "auto";
  loading.value = true;
  scrollToBottom();

  try {
    const data = await $fetch<{
      response: string;
      conversation_id: string;
    }>(`${config.public.apiBase}/api/chat`, {
      method: "POST",
      body: {
        message: text,
        conversation_id: conversationId.value,
      },
    });

    conversationId.value = data.conversation_id;
    messages.value.push({ role: "assistant", content: data.response });
  } catch {
    messages.value.push({
      role: "assistant",
      content: "Sorry, something went wrong. Please try again.",
    });
  } finally {
    loading.value = false;
    scrollToBottom();
    nextTick(() => inputEl.value?.focus());
  }
};
</script>
