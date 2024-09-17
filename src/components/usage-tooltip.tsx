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
import { useTranslation } from "react-i18next";

export type UsageTooltipProps = {
  usage: Usage;
  children: React.ReactNode;
};

export function UsageTooltip({ usage, children }: UsageTooltipProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  if (!usage.authorized) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div>{children}</div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("usageTooltip.pleaseSignIn")}
            </AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                navigate("/sign-in");
              }}
            >
              {t("usageTooltip.signIn")}
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
          <p>{t("usageTooltip.usageLimit")}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  return children;
}
