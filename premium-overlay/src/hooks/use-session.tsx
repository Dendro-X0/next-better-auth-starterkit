"use client";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import type { User } from "better-auth";
import * as React from "react";

import { authClient } from "@/lib/auth/client";

interface Session {
  user: User | null;
}

const queryClient = new QueryClient();

const SessionContext = React.createContext<{ session: Session | undefined }>({ session: undefined });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data, error } = await authClient.getSession();

      if (error) {
        throw new Error(error.message || "Failed to fetch session");
      }

      return { user: data?.user ?? null };
    },
  });

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}

export function AppWithQueryClient({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}

export const useSession = () => {
  const context = React.useContext(SessionContext);

  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context.session;
};
