"use client";

import { useState, useEffect } from "react";

export const useSystemDarkMode = () => {
    const [isDark, setIsDark] = useState(() => {
        // prevent crash during SSR
        if (typeof window !== "undefined") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => setIsDark(e.matches);
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    return isDark;
};