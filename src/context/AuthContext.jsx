"use client";

import { supabase } from "@/lib/supabase";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ yeni:
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  // Profile fetch helper
  const fetchProfile = async (userId) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("fetchProfile error:", error);
      return null;
    }
    return data;
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error) console.error("getSession error:", error);

      const s = data?.session ?? null;
      const u = s?.user ?? null;

      setSession(s);
      setUser(u);

      // ✅ session varsa profile da çek
      if (u?.id) {
        const p = await fetchProfile(u.id);
        if (mounted) setProfile(p);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        const u = newSession?.user ?? null;

        setSession(newSession);
        setUser(u);

        if (u?.id) {
          const p = await fetchProfile(u.id);
          setProfile(p);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    setSession(data.session);
    setUser(data.user);

    // ✅ login sonrası profile çek
    const p = await fetchProfile(data.user?.id);
    setProfile(p);

    return data;
  };

  const signUp = async ({ email, password, full_name }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // session geldiyse (auto login)
    if (data?.user && data?.session) {
      // profile satırı trigger ile zaten oluşuyor, sadece full_name yaz
      const { data: updatedProfile, error: profileErr } = await supabase
        .from("profile")
        .update({ full_name })
        .eq("id", data.user.id)
        .select("*")
        .single();

      if (profileErr) throw profileErr;

      // ✅ profile state’i de güncelle
      setProfile(updatedProfile);

      setSession(data.session);
      setUser(data.user);
    }

    return data;
  };

  const loginWithProvider = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    return data;
  };

  // ✅ Tek yerden profile güncelle (onboarding vs. buradan)
  const updateProfile = async (patch) => {
    if (!user?.id) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profile")
      .update(patch)
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) throw error;

    setProfile(data);
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      loading,
      session,
      user,
      profile, // ✅ expose et
      isUserLoggedIn: !!session,

      login,
      signUp,
      loginWithProvider,
      logout,

      fetchProfile, // istersen dışarı aç
      updateProfile, // ✅ çok işine yarayacak
      setProfile, // istersen dışarı açma, ama bazen lazım olur
    }),
    [loading, session, user, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
