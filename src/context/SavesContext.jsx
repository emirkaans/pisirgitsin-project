"use client";

import { supabase, withRetry } from "@/lib/supabase";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useAuth } from "@/context/AuthContext";

const SavesContext = createContext(undefined);

const normalizeIds = (ids) =>
  Array.isArray(ids)
    ? ids
        .map((x) => (typeof x === "string" ? Number(x) : x))
        .filter((x) => Number.isFinite(x))
    : [];

export function SavesProvider({ children }) {
  const { user, isUserLoggedIn, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [savedIds, setSavedIds] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadSavedIds = useCallback(async () => {
    setError(null);

     
    if (authLoading) {
      return;
    }

    if (!isUserLoggedIn || !userId) {
      setSavedIds([]);
      setSavedRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: profile, error: pErr } = await withRetry(
      () =>
        supabase
          .from("profile")
          .select("saved_recipe_ids")
          .eq("id", userId)
          .single(),
      3,
      500,
      20000
    );

    if (pErr) {
      setError(pErr);
      setLoading(false);
      return;
    }

    setSavedIds(normalizeIds(profile?.saved_recipe_ids ?? []));
    setLoading(false);
  }, [isUserLoggedIn, userId, authLoading]);

  useEffect(() => {
    loadSavedIds();
  }, [loadSavedIds]);

  




  const toggleSave = useCallback(
    async (recipeId) => {
      if (!isUserLoggedIn || !userId) {
        throw new Error("Not authenticated");
      }

      const id = Number(recipeId);
      if (!Number.isFinite(id)) return;

      setSaving(true);
      setError(null);

       
      const optimisticNext = savedIds.includes(id)
        ? savedIds.filter((x) => x !== id)
        : [...savedIds, id];
      setSavedIds(optimisticNext);

      const { data, error: rpcErr } = await withRetry(
        () => supabase.rpc("toggle_save", { p_recipe_id: id }),
        3,
        500,
        20000
      );

      setSaving(false);

      if (rpcErr) {
         
        setSavedIds(savedIds);
        setError(rpcErr);
        throw rpcErr;
      }

       
       
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.saved_recipe_ids) {
        setSavedIds(normalizeIds(row.saved_recipe_ids));
      } else {
         
         
        await loadSavedIds();
      }
    },
    [isUserLoggedIn, userId, savedIds, loadSavedIds]
  );

  const isSaved = useCallback(
    (recipeId) => {
      const id = Number(recipeId);
      if (!Number.isFinite(id)) return false;
      return savedIds.includes(id);
    },
    [savedIds]
  );

  const fetchSaveRecipes = useCallback(async () => {
    setError(null);

    if (!isUserLoggedIn || !userId) {
      setSavedRecipes([]);
      return [];
    }

    if (savedIds.length === 0) {
      setSavedRecipes([]);
      return [];
    }

     
    const { data, error: rErr } = await withRetry(
      () =>
        supabase
          .from("recipe")
          .select("*")
          .in("id", savedIds),
      3,
      500,
      20000
    );

    if (rErr) {
      setError(rErr);
      return [];
    }

    const byId = new Map((data ?? []).map((r) => [r.id, r]));
    const ordered = savedIds.map((id) => byId.get(id)).filter(Boolean);

    setSavedRecipes(ordered);
    return ordered;
  }, [savedIds, isUserLoggedIn, userId]);

  const value = useMemo(
    () => ({
      loading,
      saving,
      error,

      savedIds,
      savedRecipes,

      reloadSaves: loadSavedIds,
      fetchSaveRecipes,

      toggleSave,
      isSaved,
      count: savedIds.length,
    }),
    [
      loading,
      saving,
      error,
      savedIds,
      savedRecipes,
      loadSavedIds,
      fetchSaveRecipes,
      toggleSave,
      isSaved,
    ]
  );

  return (
    <SavesContext.Provider value={value}>{children}</SavesContext.Provider>
  );
}

export function useSaves() {
  const ctx = useContext(SavesContext);
  if (!ctx) throw new Error("useSaves must be used within a SavesProvider");
  return ctx;
}
