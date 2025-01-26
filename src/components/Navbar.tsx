"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import { ThemeSelect } from "./ThemeSelect";

interface NavItem {
  icon?: string;
  label: string;
  href: string | null;
  onClick: React.MouseEventHandler<HTMLButtonElement> | null;
}

const navItems: NavItem[] = [
  // {
  //   label: "Link-1",
  //   href: "#",
  //   onClick: null,
  // },
  // {
  //   label: "Link-2",
  //   href: "#",
  //   onClick: null,
  // },
  // {
  //   label: "Link-3",
  //   href: "#",
  //   onClick: null,
  // },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 w-full p-4 shadow-sm inline-flex items-center h-[var(--nav-height)]">
      <Link href="#" className="mr-6">
        {"Realtime Video Chat 🤖"}
      </Link>

      <span className="flex-1 inline-flex items-center justify-end gap-4 px-6">
        {navItems.map((navItem, index) =>
          !!navItem.onClick ? (
            <button key={index + "-" + navItem.label} onClick={navItem.onClick}>
              {navItem.label}
            </button>
          ) : !!navItem.href ? (
            <a key={index + "-" + navItem.label} href={navItem.href}>
              {navItem.label}
            </a>
          ) : (
            <span>{navItem.label}</span>
          )
        )}
      </span>

      <div className="inline-flex-center gap-2">
        <ThemeSelect/>
        <AuthMenu />
      </div>
    </nav>
  );
}

const AuthMenu = () => {
  const { userId, isLoaded } = useAuth();

  return !isLoaded ? (
    <></>
  ) : userId ? (
    <>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "size-10",
          },
        }}
      />
    </>
  ) : (
    <>
      <Link
        href="/sign-in"
        className="bg-background text-foreground rounded-md py-2 px-4 mr-1 border-[1px] border-solid"
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        className="bg-foreground text-background rounded-md py-2 px-4 ml-1 "
      >
        Sign Up
      </Link>
    </>
  );
};
