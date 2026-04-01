"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { AppUser } from "@/lib/domain";

const AppUserContext = createContext<AppUser | null>(null);

export function AppUserProvider({
  user,
  children,
}: {
  user: AppUser | null;
  children: ReactNode;
}) {
  return <AppUserContext.Provider value={user}>{children}</AppUserContext.Provider>;
}

export function useAppUser() {
  return useContext(AppUserContext);
}
