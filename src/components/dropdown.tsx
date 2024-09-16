import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";
import { Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { user } = useAuthenticator((c) => [c.user]);
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
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
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <h1 className="text-2xl font-bold">Whisperer</h1>
      </div>
    </div>
  );
}
