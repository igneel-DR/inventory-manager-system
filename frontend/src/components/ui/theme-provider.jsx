import { createContext, useContext, useEffect, useState } from "react";

// Theme options
const themes = ["light", "dark", "system"];

// Create ThemeContext
const ThemeProviderContext = createContext({ theme: "system", setTheme: () => null });

// ThemeProvider component
export function ThemeProvider({ children, defaultTheme = "system", storageKey = "ui-theme" }) {
  // Get initial theme from local storage or use default
  const [theme, setTheme] = useState(() => {
    // Try to get the theme from localStorage
    const storedTheme = localStorage.getItem(storageKey);
    // Return the stored theme if it exists, otherwise use the default
    return storedTheme || defaultTheme;
  });

  // Update the theme attribute in the HTML element and store in localStorage
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark");

    // Add the appropriate theme class
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Save to localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    // Callback for when the media query changes
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      }
    };

    // Add event listener
    mediaQuery.addEventListener("change", handleChange);
    
    // Cleanup
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Context value
  const value = {
    theme,
    setTheme: (newTheme) => {
      if (themes.includes(newTheme)) {
        setTheme(newTheme);
      } else {
        console.warn(`Invalid theme: ${newTheme}. Must be one of: ${themes.join(", ")}`);
      }
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}; 