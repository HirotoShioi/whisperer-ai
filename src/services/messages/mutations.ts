import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveMessage } from "./services";
import { NewMessageParams } from "@/lib/database/schema";

export const useMessageCreateMutation = (threadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewMessageParams) => {
      return saveMessage(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["usage"],
      });
      queryClient.invalidateQueries({
        queryKey: ["messages", { threadId }],
      });
    },
  });
};
