import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";
import { Menu } from "lucide-react";
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
  const { user } = useAuthenticator((c) => [c.user]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer bg-muted rounded-full p-2 w-10 h-10 flex items-center justify-center">
        <Menu size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <HeaderMenuItem href="/settings">Settings</HeaderMenuItem>
        {user ? (
          <DropdownMenuItem onClick={() => signOut()}>
            Sign out
          </DropdownMenuItem>
        ) : (
          <HeaderMenuItem href="/sign-in">Sign in</HeaderMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
