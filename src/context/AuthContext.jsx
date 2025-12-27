"use client";

import { supabase, withRetry } from "@/lib/supabase";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (!userId) return null;

    try {
      const { data, error } = await withRetry(
        () => supabase.from("profile").select("*").eq("id", userId).single(),
        2,
        500,
        8000
      );

      if (error) {
        console.error("❌ fetchProfile error:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("❌ fetchProfile unexpected error:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error) console.error("❌ getSession error:", error);

      const s = data?.session ?? null;
      const u = s?.user ?? null;

      setSession(s);
      setUser(u);

      if (u?.id) {
        try {
          const p = await fetchProfile(u.id);
          if (mounted) setProfile(p);
        } catch (err) {
          console.error("⚠️ Profile fetch failed in init:", err);
          if (mounted) setProfile(null);
        }
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
          try {
            const p = await fetchProfile(u.id);
            setProfile(p);
          } catch (err) {
            console.error("⚠️ Profile fetch failed in auth state change:", err);
            setProfile(null);
          }
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
    console.log("🔐 Attempting login...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Login error:", error);
      throw error;
    }

    if (!data?.session || !data?.user) {
      console.error("❌ Login succeeded but no session/user returned");
      throw new Error("Giriş başarısız. Lütfen tekrar deneyin.");
    }

    console.log("✅ Login successful, setting session and user");
    setSession(data.session);
    setUser(data.user);

    // ✅ login sonrası profile çek (non-blocking - hata olsa bile login başarılı)
    try {
      const p = await fetchProfile(data.user?.id);
      if (p) {
        setProfile(p);
        console.log("✅ Profile loaded");
      } else {
        console.warn("⚠️ Profile not found, but login successful");
      }
    } catch (err) {
      console.error("⚠️ Profile fetch failed, but login is still valid:", err);
      // Profile fetch hatası login'i engellemesin
    }

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
