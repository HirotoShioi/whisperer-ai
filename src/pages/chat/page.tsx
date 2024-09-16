import { Message } from "ai/react";
import { getMessages } from "@/services/messages";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from "react-router-dom";
import { doesThreadExist, getThreadById } from "@/services/threads";
import { useEffect } from "react";
import { deleteDocumentById, getDocumentsById } from "@/services/documents";
import { MessageComponent } from "./message";
import { ChatInput } from "./chat-input";
import { DocumentPanel } from "./document-panel";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ChatContextProvider, useChatContext } from "@/pages/chat/context";
import React from "react";
import type { Thread, Document } from "@/lib/database/schema";
import { ChatTitle } from "./chat-title";
import { getUsage, Usage } from "@/services/usage";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (request.method) {
    case "POST":
      return Response.json({ success: true });
    case "DELETE": {
      const documentId = formData.get("documentId");
      if (typeof documentId === "string") {
        await deleteDocumentById(documentId);
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
  const [messages, documents, thread, usage] = await Promise.all([
    getMessages(threadId),
    getDocumentsById(threadId),
    getThreadById(threadId),
    getUsage(),
  ]);
  return { messages, documents, thread, usage };
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
  const { chatHook, scrollRef, scrollToEnd, thread } = useChatContext();
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");

  useEffect(() => {
    scrollToEnd();
  }, [scrollToEnd]);

  return (
    <div className="flex flex-row h-screen">
      {!isSmallScreen && <Document />}
      <div className="w-full h-full flex flex-col">
        <ChatTitle thread={thread} />
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
  const {
    messages: initialMessages,
    documents: initialDocuments,
    thread,
    usage,
  } = useLoaderData() as {
    messages: Message[];
    documents: Document[];
    thread: Thread;
    usage: Usage;
  };

  return (
    <ChatContextProvider
      usage={usage}
      initialMessages={initialMessages}
      initialDocuments={initialDocuments}
      thread={thread}
    >
      <ChatPageContent />
    </ChatContextProvider>
  );
}
