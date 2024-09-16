import { Usage } from "@/services/usage";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type UsageTooltipProps = {
  usage: Usage;
  children: React.ReactNode;
};

export function UsageTooltip({ usage, children }: UsageTooltipProps) {
  if (usage.isZero) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{children}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>You have reached your usage limit.</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  return children;
}
