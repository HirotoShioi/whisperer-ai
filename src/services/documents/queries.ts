import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getDocumentsById } from "./service";
import { Document } from "@/lib/database/schema";

export const useDocumentsQuery = (
  threadId?: string,
  options: Omit<
    UseQueryOptions<Document[], Error, Document[]>,
    "queryKey" | "queryFn"
  > = {}
) => {
  return useQuery({
    ...options,
    queryKey: ["documents", { threadId }],
    queryFn: () => getDocumentsById(threadId!),
    enabled: !!threadId,
  });
};
