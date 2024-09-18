import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useParams,
} from "react-router-dom";
import { getThreadById } from "@/services/threads/service";
import { useEffect } from "react";
import { deleteDocumentById } from "@/services/documents/service";
import { MessageComponent } from "./message";
import { ChatInput } from "./chat-input";
import { DocumentPanel } from "./document-panel";
import { ChatContextProvider, useChatContext } from "@/pages/chat/context";
import React from "react";
import type { Document } from "@/lib/database/schema";
import { ChatTitle } from "./chat-title";
import { getUsage, Usage } from "@/services/usage";
import { useThreadQuery } from "@/services/threads/queries";
import { FullPageLoader } from "@/components/fulll-page-loader";
import { useTranslation } from "react-i18next";

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
  const [thread, usage] = await Promise.all([
    getThreadById(threadId),
    getUsage(),
  ]);
  if (!thread) {
    return redirect(`/`);
  }
  return { thread, usage };
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
  const { usage } = useLoaderData() as {
    usage: Usage;
  };
  const params = useParams();
  const { t } = useTranslation();
  const { data: thread, isLoading } = useThreadQuery(params.threadId!);
  if (isLoading || !thread) {
    return <FullPageLoader label={t("page.loadingThread")} />;
  }
  return (
    <ChatContextProvider usage={usage} thread={thread}>
      <ChatPageContent />
    </ChatContextProvider>
  );
}
