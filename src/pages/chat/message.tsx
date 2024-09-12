import { Message as M } from "ai/react";
import { Markdown } from "@/components/markdown";

export function MessageComponent({ message }: { message: M }) {
  if (message.role === "user") {
    return (
      <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-2xl lg:max-w-[36rem] xl:max-w-[48rem]">
        <div className="flex justify-end w-full">
          <div className="max-w-[70%] rounded-3xl px-5 py-2.5 bg-primary text-primary-foreground">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  if (message.role === "tool") {
    return (
      <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-2xl lg:max-w-[40rem] xl:max-w-[48rem]">
        <div className="flex justify-center w-full">
          <div className="max-w-[70%] rounded-3xl px-5 py-2.5 bg-primary text-primary-foreground">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-2xl lg:max-w-[40rem] xl:max-w-[48rem]">
      <div className="flex justify-start w-full">
        <div className="w-full p-4">
          <Markdown content={message.content} />
        </div>
      </div>
    </div>
  );
}
