import { Message as M } from "ai/react";
import { Markdown } from "@/components/markdown";
import { ToolNames } from "@/hooks/use-chat";
import { useTranslation } from "react-i18next";

type ToolInvocation = {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
};

function ToolMessage({ toolInvocation }: { toolInvocation: ToolInvocation }) {
  const { t } = useTranslation();
  const message = () => {
    switch (toolInvocation.toolName as ToolNames) {
      case "getRelavantInformation":
        return t("toolMessage.searchingInformation");
      case "saveDocument":
        return t("toolMessage.embeddingDocuments");
      default:
        return t("toolMessage.processing");
    }
  };
  return (
    <div className="self-stretch text-xs flex gap-3 justify-center items-center text-neutral-400 before:h-[1px] before:flex-grow before:bg-neutral-300 after:h-[1px] after:flex-grow after:bg-neutral-300">
      <span>{message()}</span>
    </div>
  );
}

export function MessageComponent({ message }: { message: M }) {
  if (message.role === "user") {
    return (
      <div className="text-base w-full">
        <div className="flex justify-end w-full">
          <div className="max-w-[70%] rounded-3xl px-5 py-2.5 bg-primary text-primary-foreground">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  if (message.content.length <= 0 && message.toolInvocations) {
    return (
      <div className="md:max-w-3xl xl:max-w-[48rem]">
        <div className="flex text-center w-full">
          <div className="w-full p-4">
            {message.toolInvocations.map((toolInvocation, index) => {
              return (
                <ToolMessage key={index} toolInvocation={toolInvocation} />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-start w-full">
        <div className="w-full p-4">
          <Markdown content={message.content} />
        </div>
      </div>
    </div>
  );
}
