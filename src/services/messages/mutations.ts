import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveMessage } from "./services";
import { NewMessageParams } from "@/lib/database/schema";

export const useMessageCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewMessageParams) => {
      return saveMessage(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["usage"],
      });
      queryClient.invalidateQueries({
        queryKey: ["messages", { threadId: variables.threadId }],
      });
    },
  });
};
