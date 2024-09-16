// src/components/LargeDialog.jsx

import { useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/pages/chat/context";
import { UsageTooltip } from "@/components/usage-tooltip";
import { cn } from "@/lib/utils";

export default function DocumentUploader() {
  const {
    uploadFiles,
    uploadText,
    isDocumentUploaderOpen,
    setIsDocumentUploaderOpen,
    usage,
  } = useChatContext();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    await uploadFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDrop,
    accept: {
      "application/pdf": [],
      "text/markdown": [],
      "text/plain": [],
      "text/csv": [],
      "application/json": [],
    },
  });

  const handleSubmit = async () => {
    if (textAreaRef.current?.value) {
      await uploadText(textAreaRef.current.value);
    }
  };

  return (
    <Dialog
      open={isDocumentUploaderOpen}
      onOpenChange={setIsDocumentUploaderOpen}
    >
      <DialogTrigger asChild className="focus:outline-none">
        <UsageTooltip usage={usage}>
          <CirclePlus
            size={20}
            className={cn(
              "focus:outline-none cursor-pointer",
              usage.isZero ? "opacity-50 cursor-not-allowed" : ""
            )}
          />
        </UsageTooltip>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Documents</DialogTitle>
          <DialogDescription className="text-lg">
            Add documents to the conversation. This documents will help answer
            questions about the documents provided.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <textarea
            className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ref={textAreaRef}
            placeholder="Enter the text you want to add as a source."
          />
          <div
            {...getRootProps()}
            className={`flex items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-500">
              {isDragActive
                ? "Drop the files here"
                : "Drag & drop some files here, or click to select files"}
            </p>
          </div>
        </div>
        <DialogFooter className="flex justify-end">
          <UsageTooltip usage={usage}>
            <Button onClick={handleSubmit} disabled={usage.isZero}>
              Add
            </Button>
          </UsageTooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
