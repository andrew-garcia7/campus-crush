export type ChatMessageType = "text" | "emoji" | "voice" | "image";

export interface ChatReaction {
  emoji: string;
  userId: string;
  createdAt?: string;
}

export interface ReplyPreview {
  messageId: string;
  text: string;
  senderName: string;
  type: ChatMessageType;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  mine: boolean;
  type: ChatMessageType;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: string;
  seen: boolean;
  delivered: boolean;
  deleted?: boolean;
  reactions: ChatReaction[];
  replyPreview?: ReplyPreview;
  durationSec?: number;
}

export interface ChatMatch {
  matchId: string;
  name: string;
  photo: string;
  fallbackPhotos?: string[];
  university: string;
  otherUserId?: string;
  unreadCount: number;
  online: boolean;
  latestMessage?: {
    content?: string;
    type?: ChatMessageType;
    createdAt?: string;
    deletedAt?: string | null;
  } | null;
}