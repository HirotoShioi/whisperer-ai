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

export default function ContentUploader() {
  const {
    uploadFiles,
    uploadText,
    openContentUploader,
    isContentUploaderOpen,
    closeContentUploader,
  } = useChatContext();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    closeContentUploader();
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
      closeContentUploader();
    }
  };

  return (
    <Dialog
      open={isContentUploaderOpen}
      onOpenChange={(open) =>
        open ? openContentUploader() : closeContentUploader()
      }
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <CirclePlus size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Content</DialogTitle>
          <DialogDescription className="text-lg">
            Add content to the conversation. This content will help answer
            questions about the content.
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
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
