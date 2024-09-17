import { pageWrapperStyles } from "@/styles/common";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRouteError } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function ErrorPage() {
  const error = useRouteError() as Error;
  const { t } = useTranslation();
  if (error) {
    console.error(error);
  }

  return (
    <div id="error-page">
      <div className={cn(pageWrapperStyles, "space-y-4")}>
        <h1 className="text-2xl">Oops!</h1>
        <div>
          <p>{t("error.unexpectedError")}</p>
          <p>
            <i>{error.message}</i>
          </p>
        </div>
        <Button asChild>
          <Link to="/">{t("error.goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
