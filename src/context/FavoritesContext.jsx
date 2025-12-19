"use client";

import { supabase } from "@/lib/supabase";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useAuth } from "@/context/AuthContext";

const FavoritesContext = createContext(undefined);

export function FavoritesProvider({ children }) {
  const { user, isUserLoggedIn } = useAuth();

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]); // opsiyonel
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const userId = user?.id ?? null;

  const normalizeIds = (ids) =>
    Array.isArray(ids)
      ? ids
          .map((x) => (typeof x === "string" ? Number(x) : x))
          .filter((x) => Number.isFinite(x))
      : [];

  const loadFavoriteIds = useCallback(async () => {
    setError(null);

    if (!isUserLoggedIn || !userId) {
      setFavoriteIds([]);
      setFavoriteRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: profile, error: pErr } = await supabase
      .from("profile")
      .select("favorite_recipe_ids")
      .eq("id", userId)
      .single();

    if (pErr) {
      setError(pErr);
      setLoading(false);
      return;
    }

    const ids = normalizeIds(profile?.favorite_recipe_ids ?? []);
    setFavoriteIds(ids);
    setLoading(false);
  }, [isUserLoggedIn, userId]);

  useEffect(() => {
    loadFavoriteIds();
  }, [loadFavoriteIds]);

  const persistFavoriteIds = useCallback(
    async (nextIds) => {
      if (!userId) throw new Error("Not authenticated");

      setSaving(true);
      setError(null);

      const { error: uErr } = await supabase
        .from("profile")
        .update({ favorite_recipe_ids: nextIds })
        .eq("id", userId);

      setSaving(false);

      if (uErr) {
        setError(uErr);
        throw uErr;
      }
    },
    [userId]
  );

  const addFavorite = useCallback(
    async (recipeId) => {
      const id = Number(recipeId);
      if (!Number.isFinite(id)) return;

      const nextIds = favoriteIds.includes(id)
        ? favoriteIds
        : [...favoriteIds, id];
      setFavoriteIds(nextIds); // optimistic
      await persistFavoriteIds(nextIds);
    },
    [favoriteIds, persistFavoriteIds]
  );

  const removeFavorite = useCallback(
    async (recipeId) => {
      const id = Number(recipeId);
      if (!Number.isFinite(id)) return;

      const nextIds = favoriteIds.filter((x) => x !== id);
      setFavoriteIds(nextIds); // optimistic
      await persistFavoriteIds(nextIds);
    },
    [favoriteIds, persistFavoriteIds]
  );

  const toggleFavorite = useCallback(
    async (recipeId) => {
      const id = Number(recipeId);
      if (!Number.isFinite(id)) return;

      if (favoriteIds.includes(id)) return removeFavorite(id);
      return addFavorite(id);
    },
    [addFavorite, favoriteIds, removeFavorite]
  );

  const isFavorited = useCallback(
    (recipeId) => {
      const id = Number(recipeId);
      if (!Number.isFinite(id)) return false;
      return favoriteIds.includes(id);
    },
    [favoriteIds]
  );

  // Opsiyonel: favori tariflerin detaylarını çekmek istersen
  const fetchFavoriteRecipes = useCallback(async () => {
    setError(null);

    if (!isUserLoggedIn || !userId) {
      setFavoriteRecipes([]);
      return [];
    }

    if (favoriteIds.length === 0) {
      setFavoriteRecipes([]);
      return [];
    }

    const { data, error: rErr } = await supabase
      .from("recipes")
      .select("*")
      .in("id", favoriteIds);

    if (rErr) {
      setError(rErr);
      return [];
    }

    // ids sırasını koruyalım:
    const byId = new Map((data ?? []).map((r) => [r.id, r]));
    const ordered = favoriteIds.map((id) => byId.get(id)).filter(Boolean);

    setFavoriteRecipes(ordered);
    return ordered;
  }, [favoriteIds, isUserLoggedIn, userId]);

  const value = useMemo(
    () => ({
      loading,
      saving,
      error,

      favoriteIds,
      favoriteRecipes,

      reloadFavorites: loadFavoriteIds,
      fetchFavoriteRecipes,

      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorited,
      count: favoriteIds.length,
    }),
    [
      loading,
      saving,
      error,
      favoriteIds,
      favoriteRecipes,
      loadFavoriteIds,
      fetchFavoriteRecipes,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorited,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
