import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth";

export const ChatMessageType = {
  Text: 1,
  Image: 2,
  FilePdf: 3,
  FileWord: 4,
  FileTxt: 5,
  FileOther: 6,
} as const;

export function buildAttachmentMessageData(
  url: string,
  fileName: string,
): string {
  return JSON.stringify({ url, name: fileName });
}

export function parseAttachmentMessageData(
  raw: string,
): { url: string; name?: string } | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as { url?: unknown; name?: unknown };
    if (typeof parsed?.url === "string" && parsed.url.length > 0) {
      return {
        url: parsed.url,
        name: typeof parsed.name === "string" ? parsed.name : undefined,
      };
    }
  } catch {
    // plain URL or legacy format
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { url: trimmed };
  }

  return null;
}

export function inferMessageTypeFromFile(file: File): number {
  const mime = file.type.toLowerCase();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return ChatMessageType.Image;
  if (ext === "pdf" || mime === "application/pdf")
    return ChatMessageType.FilePdf;
  if (
    ["doc", "docx"].includes(ext) ||
    mime.includes("wordprocessingml") ||
    mime.includes("msword")
  ) {
    return ChatMessageType.FileWord;
  }
  if (ext === "txt" || mime === "text/plain") return ChatMessageType.FileTxt;
  return ChatMessageType.FileOther;
}

export function threadPreviewLabel(messageType: number, raw: string): string {
  if (messageType === ChatMessageType.Text) {
    const text = raw.trim();
    return text.length > 80 ? `${text.slice(0, 80)}...` : text;
  }
  if (messageType === ChatMessageType.Image) return "Photo";
  const parsed = parseAttachmentMessageData(raw);
  if (parsed?.name) return `File: ${parsed.name}`;
  return "File";
}

const CHAT_CLIENT_ID_KEY = "jobby-employer:chat-client-id";
let socketInstance: Socket | null = null;
let socketUserId: string | null = null;

const createGuestClientId = (): string => {
  if (typeof window === "undefined") return "guest-server";

  const existing = window.localStorage.getItem(CHAT_CLIENT_ID_KEY);
  if (existing) return existing;

  const generated = `guest-${crypto.randomUUID()}`;
  window.localStorage.setItem(CHAT_CLIENT_ID_KEY, generated);
  return generated;
};

export const getSocketSenderId = (): string => {
  const authUser = useAuthStore.getState().user;
  return authUser?.id ?? createGuestClientId();
};

export const createSocketClient = (senderId: string): Socket => {
  const envSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
  const socketUrl = envSocketUrl || "http://localhost:3002";

  return io(socketUrl, {
    autoConnect: false,
    transports: ["websocket"],
    auth: { userId: senderId },
  });
};

export const getSocketClient = (): Socket => {
  const senderId = getSocketSenderId();
  if (socketInstance) {
    if (socketUserId !== senderId) {
      socketUserId = senderId;
      socketInstance.auth = { userId: senderId };
      if (socketInstance.connected) {
        socketInstance.disconnect();
        socketInstance.connect();
      }
    }
    return socketInstance;
  }

  socketUserId = senderId;
  socketInstance = createSocketClient(senderId);
  return socketInstance;
};
