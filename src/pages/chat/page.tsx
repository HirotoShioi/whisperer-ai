import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router-dom";
import { getThreadById } from "@/services/threads/service";
import { useEffect } from "react";
import { MessageComponent } from "./message";
import { ChatInput } from "./chat-input";
import { DocumentPanel } from "./document-panel";
import { ChatContextProvider, useChatContext } from "@/pages/chat/context";
import React from "react";
import type { Document, Thread } from "@/lib/database/schema";
import { ChatTitle } from "./chat-title";

export async function loader(params: LoaderFunctionArgs) {
  const threadId = params.params.threadId;
  if (!threadId) {
    return { messages: [] };
  }
  const thread = await getThreadById(threadId);
  if (!thread) {
    return redirect(`/`);
  }
  return { thread };
}

const Document = React.memo(DocumentPanel);

function ChatContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:max-w-3xl xl:max-w-[48rem] w-full mx-auto">
      {children}
    </div>
  );
}

function ChatPageContent() {
  const { chatHook, scrollRef, scrollToEnd, isSmallScreen } = useChatContext();

  useEffect(() => {
    scrollToEnd();
  }, [scrollToEnd]);

  return (
    <div className="flex flex-row h-screen min-w-[20rem]">
      {!isSmallScreen && <Document />}
      <div className="w-full h-full flex flex-col">
        <ChatTitle />
        <div className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto" ref={scrollRef}>
            <div className="mx-auto">
              {chatHook.messages.map((message) => (
                <ChatContainer key={message.id}>
                  <MessageComponent message={message} />
                </ChatContainer>
              ))}
            </div>
          </div>
          <div className="mx-auto w-full py-4">
            <ChatContainer>
              <ChatInput />
            </ChatContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { thread } = useLoaderData() as { thread: Thread };
  return (
    <ChatContextProvider thread={thread}>
      <ChatPageContent />
    </ChatContextProvider>
  );
}
