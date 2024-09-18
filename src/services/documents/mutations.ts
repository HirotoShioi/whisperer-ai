import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDocumentById, saveDocument } from "./service";
import { NewDocumentParams } from "@/lib/database/schema";

export const useDocumentDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteDocumentById(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};

export const useDocumentCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: NewDocumentParams) => saveDocument(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["usage"],
      });
      queryClient.invalidateQueries({
        queryKey: ["documents", { threadId: variables.threadId }],
      });
    },
  });
};
