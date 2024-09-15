import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Pencil } from "lucide-react";
import { renameThread } from "@/services/threads";
import { useRevalidator } from "react-router-dom";
import { Thread } from "@/lib/database/schema";

export interface ChatTitleProps {
  thread: Thread;
}

export function ChatTitle({ thread }: ChatTitleProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(thread.title);
  const { revalidate } = useRevalidator();

  const handleSaveTitle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editedTitle.trim() === "") return;
    await renameThread(thread.id, editedTitle).finally(() => {
      setIsEditingTitle(false);
    });
    revalidate();
  };

  return (
    <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
      <DialogTrigger className="focus:outline-none w-full">
        <header className="p-4 flex flex-row gap-2 items-center text-gray-600 transition-colors duration-200 group">
          <h1 className="text-xl">{thread.title}</h1>
          <Pencil
            size={18}
            className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />
        </header>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSaveTitle}>
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="New title"
            autoFocus
          />
          <button
            type="submit"
            className="hidden"
            id="edit-title-button"
          ></button>
        </form>
        <DialogFooter>
          <Button
            onClick={() =>
              document.getElementById("edit-title-button")?.click()
            }
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
