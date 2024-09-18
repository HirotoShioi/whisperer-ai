import { Card, CardContent } from "@/components/ui/card";
import { PenSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { newThreadId } from "@/services/threads/service";
import { useCreateThreadMutation } from "@/services/threads/mutations";
import { useNavigate } from "react-router-dom";
import { Thread } from "@/lib/database/schema";
import { Link } from "react-router-dom";
import { saveToLocalStorage } from "@/utils/local-storage";
import { useRef } from "react";
import Header from "@/components/header";
import { BASE_CHAT_MODEL } from "@/constants";
import { useAuthenticator } from "@aws-amplify/ui-react";

import { UsageTooltip } from "@/components/usage-tooltip";
import { useTranslation } from "react-i18next";
import { useUsageQuery } from "@/services/usage/queries";
import { Usage } from "@/services/usage";
import { FullPageLoader } from "@/components/fulll-page-loader";
import { useThreadsQuery } from "@/services/threads/queries";

function ThreadItem({ thread }: { thread: Thread }) {
  return (
    <Link to={`/chat/${thread.id}`} className="cursor-pointer">
      <Card className="hover:bg-gray-200 bg-white transition-colors duration-400 hover:border-gray-300">
        <CardContent className="p-4">
          <h4 className="mb-2 truncate">{thread.title}</h4>
          <p className="text-sm text-gray-500">
            {new Date(thread.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function NewChatForm({ usage }: { usage: Usage }) {
  const { mutateAsync: createThread } = useCreateThreadMutation();
  const navigate = useNavigate();
  const newId = newThreadId();
  const input = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { user } = useAuthenticator((context) => [context.user]);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      return;
    }
    const inputValue = input.current?.value ?? "";
    if (inputValue.length <= 0) return;
    await createThread(newId);
    const message = {
      role: "user" as const,
      content: inputValue,
      threadId: newId,
    };
    saveToLocalStorage(newId, JSON.stringify(message));
    navigate(`/chat/${newId}`);
  }
  return (
    <div className="max-w-2xl mx-auto w-full p-4 md:p-0">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <form
              onSubmit={onSubmit}
              className="flex w-full items-center p-2 bg-white mx-auto max-w-2xl lg:gap-1 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] rounded-lg border"
            >
              <input
                className="flex-grow mr-0 bg-white rounded-lg border-0 focus:outline-none focus:ring-0 p-2 resize-none"
                placeholder={t("index.placeholder")}
                ref={input}
                disabled={usage.isZero}
              />
              <UsageTooltip usage={usage}>
                <Button
                  type="submit"
                  className="rounded-full p-2 hover:bg-blue-400 w-10 h-10 transition-colors duration-300"
                  disabled={usage.isZero}
                >
                  <PenSquareIcon className="h-4 w-4" />
                  <span className="sr-only">{t("index.send")}</span>
                </Button>
              </UsageTooltip>
            </form>
            <div className="text-sm text-gray-500">
              {t("index.model")}: {BASE_CHAT_MODEL}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function IndexPage() {
  const { t } = useTranslation();
  const threads = useThreadsQuery();
  const usage = useUsageQuery();
  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return t("greeting.morning");
    } else if (hour >= 12 && hour < 18) {
      return t("greeting.afternoon");
    } else {
      return t("greeting.evening");
    }
  }

  if (!usage.data || usage.isLoading || !threads.data) {
    return <FullPageLoader label={t("page.loadingData")} />;
  }

  return (
    <>
      <Header />
      <div className="w-full">
        <main className="max-w-7xl mx-auto space-y-8">
          <h2 className="text-4xl text-center mb-4">{getGreeting()}</h2>
          <NewChatForm usage={usage.data} />

          <div className="max-w-2xl mx-auto w-full px-4 md:px-0">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {t("index.recentChats")}
              </h3>
              <Button variant="link" size="sm">
                {t("index.viewAll")} →
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {threads.data.map((thread, index) => (
                <ThreadItem key={index} thread={thread} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
