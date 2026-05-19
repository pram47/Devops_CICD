export type Conversation = {
  id: number;
  name: string;
  preview: string;
  timestamp: number;
};

export type ReplyReference = {
  id: number;
  senderName: string;
  text: string;
  imageUrl?: string;
  imageUrls?: string[];
};

export type ChatMessage = {
  id: number;
  text: string;
  date: string;
  createdAt: string;
  imageUrl?: string;
  imageUrls?: string[];
  replyTo?: ReplyReference;
};

export type ConversationSearchResult = Conversation & {
  matchedPreview: string;
};

export type MessageDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
};
