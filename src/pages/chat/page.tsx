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
// motionのインポートを削除
import { deleteResourceById, getResources } from "@/data/resources";
import { Resource } from "@/lib/db/schema/resources";
import { MessageComponent } from "./message";
import { ChatInput } from "./chat-input";
import { ContentPanel } from "./content-panel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ChatHeader from "./header";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ChatContextProvider, useChatContext } from "@/pages/chat/context";
import React from "react";

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

const Header = React.memo(ChatHeader);
const Input = React.memo(ChatInput);
const Content = React.memo(ContentPanel);

function ChatPageContent() {
  const { chatHook, panelState, setPanelState } = useChatContext();
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
      <Header toggleArchive={toggleArchive} />
      <div className="flex flex-col h-full">
        <div className="flex-grow relative mx-auto">
          <div className="flex flex-col h-[calc(100vh-150px)] overflow-hidden">
            <div className="flex-grow overflow-y-auto" ref={scrollRef}>
              <div
                style={{
                  marginRight: animatePanelMargin,
                }}
              >
                {chatHook.messages.map((message) => (
                  <MessageComponent key={message.id} message={message} />
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              marginRight: animatePanelMargin,
            }}
          >
            <Input />
          </div>
        </div>
        <Content />
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
