import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { pageWrapperStyles } from "@/styles/common";
import { DB_NAME } from "@/constants";
import { useAlert } from "@/components/alert";

export default function SettingsPage() {
  const { openAlert } = useAlert();
  async function handleDeleteDatabase() {
    indexedDB.deleteDatabase(`/pglite/${DB_NAME}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    openAlert({
      title: "Database deleted",
      description: "Your database has been deleted.",
      actions: [
        {
          label: "OK",
          variant: "destructive",
          onClick: () => window.location.reload(),
        },
      ],
    });
  }
  function showDeleteDatabaseAlert() {
    openAlert({
      title: "Delete Database",
      description: "Are you sure you want to delete the database?",
      actions: [
        {
          label: "Delete",
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
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="delete-database" className="text-lg font-medium">
                Delete Database
              </Label>
              <div className="flex items-center">
                <Button variant="destructive" onClick={showDeleteDatabaseAlert}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
