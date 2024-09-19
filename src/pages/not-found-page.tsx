import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pageWrapperStyles } from "@/styles/common";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div id="not-found-page">
      <Header />
      <div className={cn(pageWrapperStyles, "space-y-4")}>
        <h1 className="text-2xl">{t("notFound.title")}</h1>
        <div>
          <p>{t("notFound.description")}</p>
        </div>
        <Button asChild>
          <Link to="/">{t("notFound.goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
