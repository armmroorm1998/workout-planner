"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Spinner } from "./Loading";

/** Redirects to /login when signed out, and to /profile when the profile isn't filled in yet. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(path)}`);
    else if (!profile && path !== "/profile") router.replace("/profile?setup=1");
  }, [loading, user, profile, path, router]);

  if (loading || !user || (!profile && path !== "/profile")) return <Spinner />;
  return <>{children}</>;
}
