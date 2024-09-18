import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createThread, deleteThread, renameThread } from "./service";

export const useCreateThreadMutation = () => {
  return useMutation({
    mutationFn: (threadId: string) => createThread(threadId),
  });
};

export const useRenameThreadMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, title }: { threadId: string; title: string }) =>
      renameThread(threadId, title),
    onSuccess: (data) => {
      client.invalidateQueries({
        queryKey: ["thread", { threadId: data.id }],
      });
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
