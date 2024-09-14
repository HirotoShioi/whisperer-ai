import { Message } from "ai/react";
import { getMessages } from "@/data/messages";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from "react-router-dom";
import { doesThreadExist } from "@/data/threads";
import { useEffect } from "react";
import { deleteResourceById, getResources } from "@/data/resources";
import { Resource } from "@/lib/db/schema/resources";
import { MessageComponent } from "./message";
import { ChatInput } from "./chat-input";
import { ContentPanel } from "./content-panel";
import { useMediaQuery } from "@/hooks/use-media-query";
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

const Input = React.memo(ChatInput);
const Content = React.memo(ContentPanel);

function ChatContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:max-w-3xl xl:max-w-[48rem] w-full mx-auto">
      {children}
    </div>
  );
}

function ChatPageContent() {
  const { chatHook, scrollRef, scrollToEnd } = useChatContext();
  const isSmallScreen = useMediaQuery("(max-width: 1430px)");

  useEffect(() => {
    scrollToEnd();
  }, [scrollToEnd]);

  return (
    <div className="flex flex-row h-screen">
      {!isSmallScreen && <Content />}
      <div className="w-full h-full">
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
          <div className="flex-grow overflow-y-auto" ref={scrollRef}>
            <div className="mx-auto">
              {chatHook.messages.map((message) => (
                <ChatContainer key={message.id}>
                  <MessageComponent message={message} />
                </ChatContainer>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto">
          <ChatContainer>
            <Input />
          </ChatContainer>
        </div>
      </div>
    </div>
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
