import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createThread, deleteThread, renameThread } from "./service";

export const useCreateThreadMutation = () => {
  return useMutation({
    mutationFn: (threadId: string) => createThread(threadId),
  });
};

export const useRenameThreadMutation = (threadId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => renameThread(threadId, title),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["thread", { threadId }] });
    },
  });
};

export const useDeleteThreadMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) => deleteThread(threadId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["threads"] });
    },
  });
};
