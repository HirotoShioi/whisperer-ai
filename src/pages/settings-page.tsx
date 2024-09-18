import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { pageWrapperStyles } from "@/styles/common";
import { DB_NAME } from "@/constants";
import { useAlert } from "@/components/alert";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
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
          <div className="border rounded-lg p-4 space-y-4">
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
            <div className="flex justify-between items-center">
              <Label htmlFor="delete-database" className="text-lg font-medium">
                {t("settings.language")}
              </Label>
              <div className="flex items-center">
                <Select
                  defaultValue={i18n.language}
                  onValueChange={(value) => i18n.changeLanguage(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
