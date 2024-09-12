import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export function HeaderMenuItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenuItem className="cursor-pointer" asChild>
      <Link to={href}>{children}</Link>
    </DropdownMenuItem>
  );
}

export default function Dropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <h1 className="text-2xl">Whisperer</h1>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <HeaderMenuItem href="/">Chat</HeaderMenuItem>
        <HeaderMenuItem href="/settings">Settings</HeaderMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
