import { Usage } from "@/services/usage";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useNavigate } from "react-router-dom";

export type UsageTooltipProps = {
  usage: Usage;
  children: React.ReactNode;
};

export function UsageTooltip({ usage, children }: UsageTooltipProps) {
  const navigate = useNavigate();
  if (!usage.authorized) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div>{children}</div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Please sign in</AlertDialogTitle>
            <AlertDialogDescription>
              Please sign in to use this feature
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                navigate("/sign-in");
              }}
            >
              Sign in
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
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
