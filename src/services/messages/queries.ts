import { useQuery } from "@tanstack/react-query";
import { getMessages } from "./services";

export const useMessagesQuery = (threadId?: string) => {
  return useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => getMessages(threadId!),
    enabled: !!threadId,
  });
};
