import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Message } from "ai/react";
import { useChat } from "@/hooks/use-chat";
import { Resource } from "@/lib/db/schema/resources";
import { useParams, useNavigate, useRevalidator } from "react-router-dom";
import { useAlert } from "@/components/alert";
import {
  loadFromLocalStorage,
  deleteFromLocalStorage,
} from "@/utils/local-storage";
import { createResource } from "@/data/resources";
import { nanoid } from "nanoid";
import { parseFile } from "@/lib/file";
import { saveMessage } from "@/data/messages";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

export type PanelState = "closed" | "list" | "detail";

interface ChatContextType {
  chatHook: ReturnType<typeof useChat>;
  panelState: PanelState;
  setPanelState: React.Dispatch<React.SetStateAction<PanelState>>;
  resources: Resource[];
  uploadFiles: (acceptedFiles: File[]) => Promise<void>;
  uploadText: (text: string) => Promise<void>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  scrollRef: (element: HTMLDivElement | null) => void;
  scrollToEnd: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider: React.FC<{
  children: React.ReactNode;
  initialMessages: Message[];
  initialResources: Resource[];
}> = ({ children, initialMessages, initialResources }) => {
  const { threadId } = useParams();
  const { revalidate } = useRevalidator();
  const { openAlert } = useAlert();
  const navigate = useNavigate();
  const { ref: scrollRef, scrollToEnd } = useAutoScroll();
  const chatHook = useChat(threadId!, initialMessages);
  const [panelState, setPanelState] = useState<PanelState>(() => {
    if (window.innerWidth < 768) {
      return "closed";
    }
    return "list";
  });

  useEffect(() => {
    const apiKey = loadFromLocalStorage("openAIAPIKey");
    if (!apiKey) {
      openAlert({
        title: "OpenAI API Key is not set",
        description: "Please set the OpenAI API Key",
        actions: [
          {
            label: "OK",
            onClick: () => {
              navigate("/settings");
            },
          },
        ],
      });
      return;
    }
    const message = loadFromLocalStorage(threadId!);
    if (message && initialMessages.length <= 0) {
      const parsedMessage = JSON.parse(message);
      chatHook.append(parsedMessage);
      deleteFromLocalStorage(threadId!);
    }
  }, [threadId, initialMessages.length, chatHook, openAlert, navigate]);

  const uploadFiles = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length <= 0) {
        return;
      }
      if (acceptedFiles.some((file) => file.size >= 5 * 1024 * 1024)) {
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
      const fileWithText = await Promise.all(
        acceptedFiles.map(async (file) => {
          const content = await parseFile(file, file.type);
          await createResource({
            threadId: threadId!,
            content,
            title: file.name,
            fileType: file.type,
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
          toolName: "addResource",
          args: {},
          result: {
            success: true,
            fileId: nanoid(),
            file: {
              name: file.name,
              size: file.size,
              type: file.type,
            },
            preview: text.slice(0, 300).trim(),
          },
        })),
      };
      chatHook.append(message);
      setPanelState("list");
      revalidate();
    },
    [chatHook, revalidate, openAlert, threadId]
  );

  const uploadText = useCallback(async (text: string) => {
    console.log(text);
    // ::TEXT_UPLOAD_IMPLEMENTATION::
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (chatHook.input.length <= 0) return;
    await saveMessage({
      role: "user",
      content: chatHook.input,
      threadId: threadId!,
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
        resources: initialResources,
        uploadFiles,
        uploadText,
        onSubmit,
        scrollRef,
        scrollToEnd,
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
