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
import { saveMessage } from "@/services/messages";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { convertTextToMarkdown } from "@/lib/ai/convert-text-to-markdown";
import { MAXIMUM_FILE_SIZE_IN_BYTES, PREVIEW_TEXT_LENGTH } from "@/constants";
import { Thread } from "@/lib/database/schema";
import { renameThread } from "@/services/threads";
import { nameConversation } from "@/lib/ai/name-conversation";
import { useAuthenticator } from "@aws-amplify/ui-react";

export type PanelState = "closed" | "list" | "detail";

interface ChatContextType {
  chatHook: ReturnType<typeof useChat>;
  panelState: PanelState;
  setPanelState: React.Dispatch<React.SetStateAction<PanelState>>;
  documents: Document[];
  uploadFiles: (acceptedFiles: File[]) => Promise<void>;
  uploadText: (text: string) => Promise<void>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  scrollRef: (element: HTMLDivElement | null) => void;
  scrollToEnd: () => void;
  isDocumentUploaderOpen: boolean;
  setIsDocumentUploaderOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUploadingDocuments: boolean;
  setIsUploadingDocuments: React.Dispatch<React.SetStateAction<boolean>>;
  thread: Thread;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider: React.FC<{
  children: React.ReactNode;
  initialMessages: Message[];
  initialDocuments: Document[];
  thread: Thread;
}> = ({ children, initialMessages, initialDocuments, thread }) => {
  const { revalidate } = useRevalidator();
  const { openAlert } = useAlert();
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const navigate = useNavigate();
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

  async function redirectIfUnauthenticated() {
    openAlert({
      title: "Please sign in",
      description: "Please sign in to use this feature",
      actions: [
        {
          label: "OK",
          onClick: () => {
            navigate("/sign-in");
          },
        },
      ],
    });
  }
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
      await redirectIfUnauthenticated();
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
      await redirectIfUnauthenticated();
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!user) {
      await redirectIfUnauthenticated();
      return;
    }
    if (chatHook.input.length <= 0) return;
    await saveMessage({
      role: "user",
      content: chatHook.input,
      threadId: thread.id,
    });
    chatHook.handleSubmit(e);
    scrollToEnd();
  };

  return (
    <ChatContext.Provider
      value={{
        chatHook,
        panelState,
        setPanelState,
        documents: initialDocuments,
        uploadFiles,
        uploadText,
        onSubmit,
        scrollRef,
        scrollToEnd,
        isDocumentUploaderOpen,
        setIsDocumentUploaderOpen,
        isUploadingDocuments,
        setIsUploadingDocuments,
        thread,
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
