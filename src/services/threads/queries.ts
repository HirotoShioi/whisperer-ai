import { useQuery } from "@tanstack/react-query";
import { getThreadById, getThreads } from "./service";

export const useThreadQuery = (threadId: string) => {
  return useQuery({
    queryKey: ["thread", { threadId }],
    queryFn: () => getThreadById(threadId),
  });
};

export const useThreadsQuery = () => {
  return useQuery({
    queryKey: ["threads"],
    queryFn: () => getThreads(),
  });
};
