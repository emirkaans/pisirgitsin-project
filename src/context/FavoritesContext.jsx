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

const FavoritesContext = createContext(undefined);

const normalizeIds = (ids) =>
  Array.isArray(ids)
    ? ids
        .map((x) => (typeof x === "string" ? Number(x) : x))
        .filter((x) => Number.isFinite(x))
    : [];

export function FavoritesProvider({ children }) {
  const { user, isUserLoggedIn } = useAuth();
  const userId = user?.id ?? null;

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]); // opsiyonel
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

    setFavoriteIds(normalizeIds(profile?.favorite_recipe_ids ?? []));
    setLoading(false);
  }, [isUserLoggedIn, userId]);

  useEffect(() => {
    loadFavoriteIds();
  }, [loadFavoriteIds]);

  /**
   * ✅ Tek giriş: toggleFavorite
   * - DB: RPC toggle_favorite(p_recipe_id)
   * - Response: favorite_recipe_ids + likes_count vb döndürebilir
   */
  const toggleFavorite = useCallback(
    async (recipeId) => {
      if (!isUserLoggedIn || !userId) {
        throw new Error("Not authenticated");
      }

      const id = Number(recipeId);
      if (!Number.isFinite(id)) return;

      setSaving(true);
      setError(null);

      // (opsiyonel) optimistic UI
      const optimisticNext = favoriteIds.includes(id)
        ? favoriteIds.filter((x) => x !== id)
        : [...favoriteIds, id];
      setFavoriteIds(optimisticNext);

      const { data, error: rpcErr } = await supabase.rpc("toggle_favorite", {
        p_recipe_id: id,
      });

      setSaving(false);

      if (rpcErr) {
        // optimistic rollback
        setFavoriteIds(favoriteIds);
        setError(rpcErr);
        throw rpcErr;
      }

      // RPC returns table => data array olabilir
      const row = Array.isArray(data) ? data[0] : data;

      // ✅ Eğer favorite_recipe_ids dönüyorsa state'i onunla kesinleştir
      if (row?.favorite_recipe_ids) {
        setFavoriteIds(normalizeIds(row.favorite_recipe_ids));
      } else {
        // dönmüyorsa profili refresh et
        await loadFavoriteIds();
      }
    },
    [isUserLoggedIn, userId, favoriteIds, loadFavoriteIds]
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

    // ✅ tablo adı "recipe"
    const { data, error: rErr } = await withRetry(
      () =>
        supabase
          .from("recipe")
          .select("*")
          .in("id", favoriteIds),
      2,
      500,
      8000
    );

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
