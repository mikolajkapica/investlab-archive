import { Store } from '@tanstack/react-store';
import type { ChatMessage } from '@/client';
import type { LlmMessage } from '@/features/shared/providers/types/llm';
import { IS_DEMO_ARCHIVE } from '@/features/shared/utils/constants';

export type LastChatMessageState =
  | 'idle'
  | 'firstMessage'
  | 'sent'
  | 'streaming'
  | 'done'
  | 'error';

export interface LastChatMessage {
  request: ChatMessage;
  response: ChatMessage | null;
  state: LastChatMessageState;
}

interface LiveChatsStore {
  chats: Map<string, LastChatMessage>;
}

export const liveChatsStore = new Store<LiveChatsStore>({
  chats: new Map(),
});

export function handleLlmMessage({ data }: LlmMessage) {
  const chatId = data.chat_id;

  const existing = liveChatsStore.state.chats.get(chatId);
  if (existing?.request === undefined) {
    console.warn(`Chat ${chatId} not found`);
    return;
  }

  switch (data.state) {
    case 'start':
      liveChatsStore.setState((state) => ({
        chats: new Map(state.chats).set(chatId, {
          ...existing,
          response: null,
          state: 'streaming',
        }),
      }));
      break;
    case 'streaming':
      liveChatsStore.setState((state) => ({
        chats: new Map(state.chats).set(chatId, {
          ...existing,
          response: {
            id: 'streaming-message',
            role: 'assistant' as const,
            content:
              (state.chats.get(chatId)?.response?.content || '') + data.chunk,
            createdAt: new Date().toISOString(),
          },
          state: 'streaming',
        }),
      }));
      break;
    case 'end': {
      liveChatsStore.setState((state) => ({
        chats: new Map(state.chats).set(chatId, {
          ...existing,
          state: 'done',
        }),
      }));
      break;
    }
    case 'error':
      liveChatsStore.setState((state) => ({
        chats: new Map(state.chats).set(chatId, {
          ...existing,
          response: {
            id: 'streaming-message',
            role: 'assistant' as const,
            content: state.chats.get(chatId)?.response?.content || '', // should fail probably
            createdAt: new Date().toISOString(),
          },
          state: 'error',
        }),
      }));
      break;
  }
}

export function createPendingMessage({
  chatId,
  content,
  isFirstMessage,
}: {
  chatId: string;
  content: string;
  isFirstMessage: boolean;
}) {
  const now = new Date().toISOString();
  liveChatsStore.setState((state) => {
    return {
      chats: new Map(state.chats).set(chatId, {
        request: {
          id: crypto.randomUUID(),
          content,
          role: 'user',
          createdAt: now,
        },
        response: IS_DEMO_ARCHIVE
          ? {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Jasne — to jest lokalna odpowiedź archiwum. Dla pytania „${content}”: największe przykładowe pozycje to Apple i NVIDIA, portfel jest na plusie, a wszystkie dane są statyczne demo.`,
              createdAt: now,
            }
          : null,
        state: isFirstMessage ? 'firstMessage' : 'sent',
      }),
    };
  });
}
