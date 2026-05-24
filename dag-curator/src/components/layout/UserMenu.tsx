"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const login = (session.user as { login?: string }).login ?? session.user.name ?? "User";
  const avatar = session.user.image;

  return (
    <div className="flex items-center gap-2">
      {avatar ? (
        <Image
          src={avatar}
          alt={login}
          width={28}
          height={28}
          className="rounded-full"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
          {login[0]?.toUpperCase()}
        </div>
      )}
      <span className="text-sm font-medium flex-1 truncate">{login}</span>
      <button
        onClick={() => signOut()}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
