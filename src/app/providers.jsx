"use client";

import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import OnboardingDialog from "@/components/OnboardingDialog";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        {children}
        <OnboardingDialog />
      </FavoritesProvider>
    </AuthProvider>
  );
}
