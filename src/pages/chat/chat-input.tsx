import { FileIcon, PenSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/pages/chat/context";
import { UsageTooltip } from "@/components/usage-tooltip";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useTranslation } from "react-i18next";
import { useMessageCreateMutation } from "@/services/messages/mutations";

export function ChatInput() {
  const { chatHook, usage, thread, scrollToEnd, setIsDocumentUploaderOpen } =
    useChatContext();
  const [isComposing, setIsComposing] = useState(false);
  const { t } = useTranslation();
  const [rows, setRows] = useState(1);
  const { user } = useAuthenticator((context) => [context.user]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutateAsync: saveMessage } = useMessageCreateMutation();
  useEffect(() => {
    if (textareaRef.current) {
      const lineHeight = 30;
      const maxWidth = textareaRef.current.clientWidth;
      const fontSize = 16;
      const ratio = (textareaRef.current.clientWidth / window.innerWidth) * 0.9;
      const charsPerLine = Math.floor(maxWidth / (fontSize * ratio));
      const lines =
        charsPerLine === 0
          ? 1
          : chatHook.input.split("\n").reduce((acc, line) => {
              return acc + Math.ceil(line.length / charsPerLine);
            }, 0);
      const newRows = Math.min(10, Math.max(1, lines));
      setRows(newRows);
      textareaRef.current.style.height = `${newRows * lineHeight}px`;
    }
  }, [chatHook.input, window.innerWidth]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    chatHook.handleInputChange(e);
  };

  const submitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!user) {
      return;
    }
    if (chatHook.input.length <= 0) return;
    await saveMessage({
      role: "user",
      content: chatHook.input,
      threadId: thread.id,
    });
    scrollToEnd();
    chatHook.handleSubmit(e);
  };

  return (
    <div className="p-2 bg-muted lg:gap-1 rounded-[26px] border-2 border-gray-300 shadow-md w-full">
      <div className="flex items-end gap-1.5 md:gap-2">
        <div className="relative">
          <UsageTooltip usage={usage}>
            <Button
              className="mr-2 p-2 rounded-full"
              onClick={() => setIsDocumentUploaderOpen(true)}
              size="icon"
              disabled={usage.isZero}
            >
              <FileIcon className="h-4 w-4" />
              <span className="sr-only">Upload a file</span>
            </Button>
          </UsageTooltip>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMessage(e);
          }}
          className="flex gap-2 w-full items-center"
        >
          <textarea
            ref={textareaRef}
            className="w-full bg-muted rounded-lg border-0 focus:outline-none focus:ring-0 resize-none h-full"
            style={{ minHeight: "20px" }}
            placeholder={t("chatInput.placeholder")}
            onChange={handleTextareaChange}
            disabled={chatHook.isLoading || usage.isZero}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            id="chat-input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                return;
              }
              if (usage.isZero) {
                return;
              }
              if (e.key === "Enter" && !isComposing) {
                e.preventDefault();
                document.getElementById("chat-submit")?.click();
              }
            }}
            value={chatHook.input}
            tabIndex={0}
            cols={100}
            rows={rows}
          />
          <button type="submit" id="chat-submit" className="hidden"></button>
        </form>
        <div className="relative">
          <UsageTooltip usage={usage}>
            <Button
              type="button"
              onClick={() => document.getElementById("chat-submit")?.click()}
              disabled={
                chatHook.isLoading || chatHook.input.length <= 0 || usage.isZero
              }
              className="rounded-full p-2 w-10 h-10"
              size="icon"
            >
              <PenSquareIcon className="h-4 w-4" />
              <span className="sr-only">Submit</span>
            </Button>
          </UsageTooltip>
        </div>
      </div>
    </div>
  );
}
