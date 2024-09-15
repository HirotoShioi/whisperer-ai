import { Card, CardContent } from "@/components/ui/card";
import { PenSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createThread, getThreads, newThreadId } from "@/services/threads";
import { defer, useLoaderData, useNavigate } from "react-router-dom";
import { Thread } from "@/lib/database/schema";
import { Link } from "react-router-dom";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "@/utils/local-storage";
import { useRef } from "react";
import Header from "@/components/header";
import { useAlert } from "@/components/alert";
import { BASE_CHAT_MODEL } from "@/constants";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export async function loader() {
  const threads = await getThreads().catch(() => []);
  return defer({
    threads,
  });
}

function ThreadItem({ thread }: { thread: Thread }) {
  return (
    <Link to={`/chat/${thread.id}`} className="cursor-pointer">
      <Card className="hover:bg-gray-200 transition-colors duration-400">
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

function NewChatForm() {
  const navigate = useNavigate();
  const { openAlert } = useAlert();
  const newId = newThreadId();
  const input = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    <div className="max-w-2xl mx-auto w-full">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <form
              onSubmit={onSubmit}
              className="flex w-full items-center p-2 bg-white mx-auto max-w-2xl lg:gap-1 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] rounded-lg border"
            >
              <input
                className="flex-grow mr-0 bg-white rounded-lg border-0 focus:outline-none focus:ring-0 p-2 resize-none"
                placeholder="Type your message here..."
                ref={input}
              />
              <Button
                type="submit"
                className="rounded-full p-2 hover:bg-blue-400 w-10 h-10 transition-colors duration-300"
              >
                <PenSquareIcon className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <div className="text-sm text-gray-500">
              Model: {BASE_CHAT_MODEL}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function IndexPage() {
  const { threads } = useLoaderData() as { threads: Thread[] };

  return (
    <>
      <Header />
      <div className="w-full">
        <main className="max-w-7xl mx-auto flex flex-col gap-8 2xl:pr-20">
          <h2 className="text-4xl font-serif text-center mb-4">
            {getGreeting()}
          </h2>
          <NewChatForm />

          <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your recent chats</h3>
              <Button variant="link" size="sm">
                View all →
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {threads.map((thread, index) => (
                <ThreadItem key={index} thread={thread} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
