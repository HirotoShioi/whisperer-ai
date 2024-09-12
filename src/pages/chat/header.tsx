import Dropdown from "@/components/dropdown";
import { Button } from "@/components/ui/button";
import { Files } from "lucide-react";

export type ChatHeaderProps = {
  toggleArchive: () => void;
};

export default function ChatHeader({ toggleArchive }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 p-3 mb-1.5 flex items-center justify-between z-10 h-14 font-semibold bg-token-main-surface-primary">
      <div className="flex items-center gap-8">
        <Dropdown />
      </div>
      <div className="flex items-center">
        <Button onClick={toggleArchive} size="icon" variant="ghost">
          <Files size={24} />
        </Button>
      </div>
    </header>
  );
}
