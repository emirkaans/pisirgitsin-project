"use client";

import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import OnboardingDialog from "@/components/OnboardingDialog";
import { SavesProvider } from "@/context/SavesContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <SavesProvider>
          {children}
          <OnboardingDialog />
        </SavesProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
