import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { pageWrapperStyles } from "@/styles/common";
import { DB_NAME } from "@/constants";
import { useAlert } from "@/components/alert";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { openAlert } = useAlert();
  async function handleDeleteDatabase() {
    indexedDB.deleteDatabase(`/pglite/${DB_NAME}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    openAlert({
      title: t("settings.databaseDeleted"),
      description: t("settings.databaseDeletedDescription"),
      actions: [
        {
          label: t("settings.ok"),
          variant: "destructive",
          onClick: () => window.location.reload(),
        },
      ],
    });
  }
  function showDeleteDatabaseAlert() {
    openAlert({
      title: t("settings.deleteDatabase"),
      description: t("settings.deleteConfirmation"),
      actions: [
        {
          label: t("settings.delete"),
          variant: "destructive",
          onClick: handleDeleteDatabase,
        },
      ],
    });
  }

  return (
    <>
      <Header />
      <div className={cn(pageWrapperStyles)}>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="delete-database" className="text-lg font-medium">
                {t("settings.deleteDatabase")}
              </Label>
              <div className="flex items-center">
                <Button variant="destructive" onClick={showDeleteDatabaseAlert}>
                  {t("settings.delete")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
