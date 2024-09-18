import { useQuery } from "@tanstack/react-query";
import { getUsage } from "../usage";

export function useUsageQuery() {
  return useQuery({
    queryKey: ["usage"],
    queryFn: () => getUsage(),
  });
}
