import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { pageWrapperStyles } from "@/styles/common";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "@/utils/local-storage";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DB_NAME } from "@/constants";

export default function SettingsPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(
    loadFromLocalStorage("openAIAPIKey") || ""
  );
  async function verifyApiKey(apiKey: string) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a test assistant.",
          },
          {
            role: "user",
            content: "Testing. Just say hi and nothing else.",
          },
        ],
        model: "gpt-4o-mini",
      }),
    });
    return response.ok;
  }
  async function handleSave() {
    const isValid = await verifyApiKey(apiKey);
    if (isValid) {
      saveToLocalStorage("openAIAPIKey", apiKey);
      toast({
        variant: "success",
        title: "API Key saved",
        description: "Your API key has been saved successfully.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid API Key",
        description: "Please enter a valid API key.",
      });
    }
  }

  async function handleDeleteDatabase() {
    indexedDB.deleteDatabase(`/pglite/${DB_NAME}`);
    toast({
      variant: "success",
      title: "Database deleted",
      description: "Your database has been deleted successfully.",
    });
  }

  return (
    <>
      <Header />
      <div className={cn(pageWrapperStyles)}>
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="openai-api-key">OpenAI API Key</Label>
            <div className="flex items-center">
              <Input
                id="openai-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenAI API Key"
              />
              <Button onClick={handleSave} className="ml-2">
                Save API Key
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Label htmlFor="delete-database">Delete Database</Label>
            <div className="flex items-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Database</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your data from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteDatabase}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
