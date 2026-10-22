"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getProfile } from "@/lib/db";
import { track } from "@/lib/loading";
import type { UserProfile } from "@/lib/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

// Session saved in this browser may belong to an account that was deleted or disabled since.
// Asking Firebase for a fresh ID token verifies it server-side; offline we trust the cached one.
async function tokenStillValid(u: User): Promise<boolean> {
  try {
    await track(u.getIdToken(true));
    return true;
  } catch (e) {
    return (e as { code?: string }).code === "auth/network-request-failed";
  }
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return;
    return onAuthStateChanged(auth(), async (u) => {
      if (u && !(await tokenStillValid(u))) {
        await signOut(auth()); // fires this listener again with null
        return;
      }
      setUser(u);
      setProfile(u ? await getProfile(u.uid).catch(() => null) : null);
      setLoading(false);
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) setProfile(await getProfile(user.uid));
  }, [user]);

  const logout = useCallback(() => signOut(auth()), []);

  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <h1 className="text-xl font-bold">ยังไม่ได้ตั้งค่า Firebase</h1>
        <p className="mt-2 text-muted">คัดลอก .env.local.example เป็น .env.local แล้วใส่ค่า config ตาม README จากนั้นรัน npm run dev ใหม่</p>
      </div>
    );

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
