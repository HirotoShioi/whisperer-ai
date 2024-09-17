import React, { createContext, useContext, useState, useEffect } from "react";
import { Message } from "ai/react";
import { useChat } from "@/hooks/use-chat";
import { Document } from "@/lib/database/schema";
import { useNavigate, useRevalidator } from "react-router-dom";
import { useAlert } from "@/components/alert";
import {
  loadFromLocalStorage,
  deleteFromLocalStorage,
} from "@/utils/local-storage";
import { saveDocument } from "@/services/documents";
import { nanoid } from "nanoid";
import { parseFile } from "@/lib/file";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { convertTextToMarkdown } from "@/lib/ai/convert-text-to-markdown";
import { MAXIMUM_FILE_SIZE_IN_BYTES, PREVIEW_TEXT_LENGTH } from "@/constants";
import { Thread } from "@/lib/database/schema";
import { renameThread } from "@/services/threads";
import { nameConversation } from "@/lib/ai/name-conversation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Usage } from "@/services/usage";
import { useMediaQuery } from "@/hooks/use-media-query";

export type PanelState = "closed" | "list" | "detail";

interface ChatContextType {
  chatHook: ReturnType<typeof useChat>;
  panelState: PanelState;
  usage: Usage;
  setPanelState: React.Dispatch<React.SetStateAction<PanelState>>;
  documents: Document[];
  uploadFiles: (acceptedFiles: File[]) => Promise<void>;
  uploadText: (text: string) => Promise<void>;
  scrollRef: (element: HTMLDivElement | null) => void;
  scrollToEnd: () => void;
  isDocumentUploaderOpen: boolean;
  setIsDocumentUploaderOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUploadingDocuments: boolean;
  isSmallScreen: boolean;
  thread: Thread;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider: React.FC<{
  children: React.ReactNode;
  initialMessages: Message[];
  initialDocuments: Document[];
  usage: Usage;
  thread: Thread;
}> = ({ children, initialMessages, initialDocuments, usage, thread }) => {
  const { revalidate } = useRevalidator();
  const { openAlert } = useAlert();
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 1200px)");
  const [isDocumentUploaderOpen, setIsDocumentUploaderOpen] = useState(false);
  const { user } = useAuthenticator((c) => [c.user]);
  const { ref: scrollRef, scrollToEnd } = useAutoScroll();
  const chatHook = useChat(thread.id, initialMessages);
  const [panelState, setPanelState] = useState<PanelState>(() => {
    if (window.innerWidth < 768) {
      return "closed";
    }
    return "list";
  });

  useEffect(() => {
    const message = loadFromLocalStorage(thread.id);
    if (message && initialMessages.length <= 0) {
      const parsedMessage = JSON.parse(message);
      chatHook.append(parsedMessage);
      deleteFromLocalStorage(thread.id);
      // non-blocking
      nameConversation(parsedMessage.content)
        .then((name) => renameThread(thread.id, name))
        .then(() => revalidate());
    }
  }, [
    thread.id,
    initialMessages.length,
    chatHook,
    openAlert,
    navigate,
    revalidate,
  ]);

  async function uploadFiles(acceptedFiles: File[]) {
    if (!user) {
      return;
    }
    setIsUploadingDocuments(true);
    setIsDocumentUploaderOpen(false);
    if (acceptedFiles.length <= 0) {
      return;
    }
    if (acceptedFiles.some((file) => file.size >= MAXIMUM_FILE_SIZE_IN_BYTES)) {
      openAlert({
        title: "File size is too large",
        description: "Please upload files smaller than 5MB",
        actions: [
          {
            label: "OK",
          },
        ],
      });
      return;
    }
    try {
      const fileWithText = await Promise.all(
        acceptedFiles.map(async (file) => {
          const { content, fileType } = await parseFile(file, file.type);
          await saveDocument({
            threadId: thread.id,
            content,
            title: file.name,
            fileType,
          });
          return {
            text: content,
            file,
          };
        })
      );
      const message: Message = {
        id: nanoid(),
        role: "assistant" as const,
        content: "",
        toolInvocations: fileWithText.map(({ text, file }) => ({
          state: "result" as const,
          toolCallId: nanoid(),
          toolName: "saveDocument",
          args: {},
          result: {
            success: true,
            fileId: nanoid(),
            file: {
              name: file.name,
              size: file.size,
              type: file.type,
            },
            preview: text.slice(0, PREVIEW_TEXT_LENGTH).trim(),
          },
        })),
      };
      chatHook.append(message);
      setPanelState("list");
      revalidate();
      scrollToEnd();
    } finally {
      setIsUploadingDocuments(false);
    }
  }

  const uploadText = async (text: string) => {
    if (!user) {
      return;
    }
    setIsUploadingDocuments(true);
    setIsDocumentUploaderOpen(false);
    try {
      const markdown = await convertTextToMarkdown(text);
      const file = new File([markdown.content], markdown.title, {
        type: "text/markdown",
      });
      await uploadFiles([file]);
    } finally {
      setIsUploadingDocuments(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chatHook,
        panelState,
        setPanelState,
        isSmallScreen,
        documents: initialDocuments,
        uploadFiles,
        uploadText,
        scrollRef,
        scrollToEnd,
        isDocumentUploaderOpen,
        setIsDocumentUploaderOpen,
        isUploadingDocuments,
        thread,
        usage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }
  return context;
};
