import React, { createContext, useContext, useState, useEffect } from "react";
// import { r } from "../data/bookEndPoint";
import { signupUser, loginUser, logOutUser } from "../data/userEndPoint";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "../hooks/useUser";
// import { Navigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { user, isLoading: isUserLoading } = useUser();
  const [isAuthActionLoading, setIsAuthActionLoading] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("greenlib_theme");
    return saved === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("greenlib_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("greenlib_theme", "light");
    }
  }, [isDarkMode]);

  const login = async (email, password) => {
    setIsAuthActionLoading(true);
    const response = await loginUser(email, password);

    if (response?.status === "ok") {
      const newUser = response.data?.user;
      console.log("login success", newUser);
      // Set user data in React Query cache
      queryClient.setQueryData(["user"], newUser);
      setIsAuthActionLoading(false);
      return response.status;
    }
    setIsAuthActionLoading(false);
    return response?.status || "error";
  };

  const signup = async (firstName, lastName, email, password, classLevel) => {
    setIsAuthActionLoading(true);
    const response = await signupUser(
      firstName,
      lastName,
      email,
      password,
      classLevel,
    );
    if (response?.status === "ok") {
      const newUser = response.data?.user;
      // Set user data in React Query cache
      queryClient.setQueryData(["user"], newUser);
      setIsAuthActionLoading(false);
      return response.status;
    }
    setIsAuthActionLoading(false);
    return response?.status || "error";
  };

  const logout = async () => {
    setIsAuthActionLoading(true);
    await logOutUser();
    // Clear user and books data from cache
    queryClient.removeQueries({ queryKey: ["user"] });
    queryClient.removeQueries({ queryKey: ["books"] });
    queryClient.removeQueries({ queryKey: ["videos"] });
    setIsAuthActionLoading(false);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const isLoading = isUserLoading || isAuthActionLoading;
  const isLoagin = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isDarkMode,
        toggleDarkMode,
        isLoading,
        isLoagin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
