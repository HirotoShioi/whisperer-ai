import { Message } from "ai/react";
import { getMessages } from "@/data/messages";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from "react-router-dom";
import { doesThreadExist } from "@/data/threads";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { deleteResourceById, getResources } from "@/data/resources";
import { Resource } from "@/lib/db/schema/resources";
import { MessageComponent } from "./message";
import { ChatInput } from "./chat-input";
import { ContentPanel } from "./content-panel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ChatHeader from "./header";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ChatContextProvider, useChatContext } from "@/contexts/ChatContext";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (request.method) {
    case "POST":
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

function ChatPageContent() {
  const { chatHook, panelState, setPanelState, uploadFiles } = useChatContext();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const { ref: scrollRef, scrollToEnd } = useAutoScroll();

  useEffect(() => {
    scrollToEnd();
  }, [scrollToEnd]);

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
        <div className="flex-grow relative mx-auto">
          <div className="flex flex-col h-[calc(100vh-150px)] overflow-hidden">
            <div className="flex-grow overflow-y-auto" ref={scrollRef}>
              <motion.div
                className="p-2 sm:p-6 flex flex-col gap-4"
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
            </div>
          </div>
          <motion.div
            className=""
            animate={{
              marginRight: animatePanelMargin,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            initial={false}
          >
            <ChatInput onFileUpload={(file) => uploadFiles([file])} />
          </motion.div>
        </div>
        <ContentPanel />
      </div>
    </>
  );
}

export default function ChatPage() {
  const { messages: initialMessages, resources: initialResources } =
    useLoaderData() as {
      messages: Message[];
      resources: Resource[];
    };

  return (
    <ChatContextProvider
      initialMessages={initialMessages}
      initialResources={initialResources}
    >
      <ChatPageContent />
    </ChatContextProvider>
  );
}
