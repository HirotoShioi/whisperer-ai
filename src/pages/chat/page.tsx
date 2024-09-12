import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "ai/react";
import { useChat } from "@/hooks/useChat";
import { getMessages, saveMessage } from "@/data/messages";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import { doesThreadExist } from "@/data/threads";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import {
  deleteFromLocalStorage,
  loadFromLocalStorage,
} from "@/utils/localStorageUtils";
import { motion } from "framer-motion";
import {
  createResource,
  deleteResourceById,
  getResources,
} from "@/data/resources";
import { Resource } from "@/lib/db/schema/resources";
import { MessageComponent } from "./message";
import { ChatInput } from "./chat-input";
import { ContentPanel } from "./content-panel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ChatHeader from "./header";
import { parseFile } from "@/lib/file";
import { useAlert } from "@/components/alert";
import { nanoid } from "nanoid";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (request.method) {
    case "POST":
      {
        const threadId = formData.get("threadId");
        if (typeof threadId !== "string") {
          return null;
        }
        const files = formData.getAll("files");
        for (const file of files) {
          if (file instanceof Blob) {
            const content = await parseFile(file, file.type);
            await createResource({
              threadId,
              content,
              title: file.name,
              fileType: file.type,
            });
          }
        }
      }
      return Response.json({ success: true });
    case "DELETE": {
      const resourceId = formData.get("resourceId");
      if (typeof resourceId === "string") {
        await deleteResourceById(resourceId);
      }
      return Response.json({ success: true });
    }
  }
  return null;
}

export async function loader(params: LoaderFunctionArgs) {
  const threadId = params.params.threadId;
  if (!threadId) {
    return { messages: [] };
  }
  const exists = await doesThreadExist(threadId);
  if (!exists) {
    return redirect(`/`);
  }
  const messages = await getMessages(threadId);
  const resources = await getResources(threadId);
  return { messages, resources };
}

export type PanelState = "closed" | "list" | "detail";
// メインのChatPageコンポーネント
export default function ChatPage() {
  const { threadId } = useParams();
  const { openAlert } = useAlert();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const { messages: initialMessages, resources } = useLoaderData() as {
    messages: Message[];
    resources: Resource[];
  };

  const chatHook = useChat(threadId!, initialMessages);
  const [isDragging, setIsDragging] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
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
      saveMessage(parsedMessage);
      chatHook.append(parsedMessage);
      deleteFromLocalStorage(threadId!);
    }
  }, [
    threadId,
    chatHook.messages,
    initialMessages.length,
    chatHook,
    openAlert,
    navigate,
  ]);

  const uploadFiles = useCallback(
    async (acceptedFiles: File[]) => {
      console.log(acceptedFiles);
      if (acceptedFiles.length <= 0) {
        setIsDragging(false);
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
      const formData = new FormData();
      formData.append("threadId", threadId!);

      for (const file of acceptedFiles) {
        const blob = new Blob([await file.arrayBuffer()], { type: file.type });
        formData.append("files", blob, file.name);
      }
      const file = acceptedFiles[0];
      const text = await file.text();
      const message: Message = {
        id: nanoid(),
        role: "assistant" as const,
        content: "",
        toolInvocations: [
          {
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
          },
        ],
      };
      chatHook.append(message);
      saveMessage({
        threadId: threadId!,
        ...message,
        toolInvocations: JSON.stringify(message.toolInvocations),
      });
      fetcher.submit(formData, {
        method: "POST",
        encType: "multipart/form-data",
      });
      setIsDragging(false);
      setPanelState("list");
    },
    [threadId, fetcher, openAlert, chatHook]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: uploadFiles,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    noClick: true,
    accept: {
      "application/pdf": [],
      "text/markdown": [],
      "text/plain": [],
      "text/csv": [],
      "application/json": [],
    },
  });
  const onFileUpload = useCallback(
    (file: File) => {
      uploadFiles([file]);
    },
    [uploadFiles]
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (chatHook.input.length <= 0) return;
    await saveMessage({
      role: "user",
      content: chatHook.input,
      threadId: threadId!,
    });
    chatHook.handleSubmit(e);
  };

  const animatePanelMargin = useMemo(() => {
    if (isSmallScreen) {
      return "0px";
    }
    switch (panelState) {
      case "detail":
        return "50rem";
      case "list":
        return "24rem";
      case "closed":
        return "0px";
    }
  }, [isSmallScreen, panelState]);

  const toggleArchive = () => {
    panelState === "closed" ? setPanelState("list") : setPanelState("closed");
  };

  return (
    <>
      <ChatHeader toggleArchive={toggleArchive} />
      <div className="flex flex-col h-full">
        <div {...getRootProps()} className="flex-grow relative">
          <input {...getInputProps()} />
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center text-center bg-white bg-opacity-75 transition-opacity duration-200 ease-in-out z-50">
              <p className="text-2xl font-bold">
                Drag and drop your files here
              </p>
            </div>
          )}
          <ScrollArea className="h-[calc(100vh-150px)] pb-2 space-y-4">
            <motion.div
              animate={{
                marginRight: animatePanelMargin,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              initial={false}
            >
              {chatHook.messages.map((message, index) => (
                <MessageComponent key={index} message={message} />
              ))}
            </motion.div>
          </ScrollArea>
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-4"
            animate={{
              marginRight: animatePanelMargin,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            initial={false}
          >
            <ChatInput
              onSubmit={onSubmit}
              onFileUpload={onFileUpload}
              isLoading={chatHook.isLoading}
              input={chatHook.input}
              handleInputChange={chatHook.handleInputChange}
              setPanelState={setPanelState}
            />
          </motion.div>
        </div>
        <ContentPanel
          resources={resources}
          panelState={panelState}
          setPanelState={setPanelState}
        />
      </div>
    </>
  );
}
