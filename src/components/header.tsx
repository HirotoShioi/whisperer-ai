"use client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import Dropdown from "./dropdown";
import { Logo } from "./logo";

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

export default function Header() {
  return (
    <header className="sticky top-0 p-4 mb-1.5 flex items-center justify-between z-10 bg-white">
      <Logo />
      <Dropdown />
    </header>
  );
}
