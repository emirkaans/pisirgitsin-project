"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const userData = {
  name: "Emir Kaan",
  avatar: "./assets/avatar.png",
  email: "test@test.com",
};

export function AuthProvider({ children }) {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan giriş durumunu ve kullanıcı bilgilerini kontrol et
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";

    setIsUserLoggedIn(loggedIn);
    setUser(userData);
  }, []);

  const login = () => {
    setIsUserLoggedIn(true);
    setUser(userData);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = () => {
    setIsUserLoggedIn(false);
    setUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userData");
  };

  return (
    <AuthContext.Provider value={{ isUserLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
