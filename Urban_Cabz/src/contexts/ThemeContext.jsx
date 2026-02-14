import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check localStorage or system preference
        const savedTheme = localStorage.getItem("theme");
        console.log("[ThemeProvider] Initializing theme. Saved:", savedTheme);
        if (savedTheme) return savedTheme;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;
        console.log("[ThemeProvider] Applying theme:", theme);
        if (theme === "dark") {
            root.classList.add("dark");
            body.style.backgroundColor = "#020617"; // slate-950
            body.style.color = "#f8fafc"; // slate-50
        } else {
            root.classList.remove("dark");
            body.style.backgroundColor = "#ffffff";
            body.style.color = "#0f172a"; // slate-900
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            console.log("[ThemeProvider] Toggling theme to:", next);
            toast.success(`Switched to ${next} mode`, { id: "theme-toggle" });
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
