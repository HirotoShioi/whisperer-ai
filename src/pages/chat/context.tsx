import React, { createContext, useContext, useState, useEffect } from "react";
import { Message } from "ai/react";
import { useChat } from "@/hooks/use-chat";
import { Document } from "@/lib/database/schema";
import { useNavigate } from "react-router-dom";
import { useAlert } from "@/components/alert";
import {
  loadFromLocalStorage,
  deleteFromLocalStorage,
} from "@/utils/local-storage";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Thread } from "@/lib/database/schema";
import { useRenameThreadMutation } from "@/services/threads/mutations";
import { nameConversation } from "@/lib/ai/name-conversation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Usage } from "@/services/usage";

export type PanelState = "closed" | "list" | "detail";

interface ChatContextType {
  chatHook: ReturnType<typeof useChat>;
  panelState: PanelState;
  setPanelState: React.Dispatch<React.SetStateAction<PanelState>>;
  documents: Document[];
  scrollRef: (element: HTMLDivElement | null) => void;
  scrollToEnd: () => void;
  isDocumentUploaderOpen: boolean;
  setIsDocumentUploaderOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUploadingDocuments: boolean;
  setIsUploadingDocuments: React.Dispatch<React.SetStateAction<boolean>>;
  isSmallScreen: boolean;
  thread: Thread;
  usage: Usage;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export type ChatContextProviderProps = {
  children: React.ReactNode;
  thread: Thread;
  messages: Message[];
  documents: Document[];
  usage: Usage;
};
export function ChatContextProvider({
  children,
  thread,
  messages,
  documents,
  usage,
}: ChatContextProviderProps) {
  const { mutateAsync: renameThread } = useRenameThreadMutation();
  const { openAlert } = useAlert();
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 1200px)");
  const [isDocumentUploaderOpen, setIsDocumentUploaderOpen] = useState(false);
  const { ref: scrollRef, scrollToEnd } = useAutoScroll();
  const chatHook = useChat(thread.id, messages);
  const [panelState, setPanelState] = useState<PanelState>(() => {
    if (window.innerWidth < 768) {
      return "closed";
    }
    return "list";
  });

  // ここもあとで修正する
  useEffect(() => {
    const message = loadFromLocalStorage(thread.id);
    if (message && messages.length <= 0) {
      const parsedMessage = JSON.parse(message);
      chatHook.append(parsedMessage);
      deleteFromLocalStorage(thread.id);
      nameConversation(parsedMessage.content).then((name) =>
        renameThread({ threadId: thread.id, title: name })
      );
    }
  }, [thread.id, messages, chatHook, openAlert, navigate, renameThread]);

  return (
    <ChatContext.Provider
      value={{
        chatHook,
        panelState,
        setPanelState,
        isSmallScreen,
        documents,
        scrollRef,
        scrollToEnd,
        isDocumentUploaderOpen,
        setIsDocumentUploaderOpen,
        isUploadingDocuments,
        setIsUploadingDocuments,
        thread,
        usage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }
  return context;
};
