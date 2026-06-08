import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useMenus, MenuPDF } from "@/hooks/useMenus";
import { useSiteConfigDB, SiteConfigDB } from "@/hooks/useSiteConfigDB";
import { SiteConfig, parseModules, parseContact, parseStats, defaultSiteConfig, defaultKitchenText, defaultStats } from "@/types";

// Re-export MenuPDF for backwards compatibility
export type { MenuPDF };

interface SiteConfigContextType {
  config: SiteConfig;
  isConfigLoading: boolean;
  menus: MenuPDF[];
  isMenusLoading: boolean;
  getMenuByDate: (date: string) => MenuPDF | undefined;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

// Helper to convert hex to HSL values string
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Convert database config to frontend config
function dbConfigToSiteConfig(dbConfig: SiteConfigDB | undefined): SiteConfig {
  if (!dbConfig) {
    return defaultSiteConfig;
  }

  // Access optional fields with type assertion
  const extendedConfig = dbConfig as SiteConfigDB & { 
    kitchen_text?: string | null; 
    stats?: unknown;
  };

  return {
    id: dbConfig.id,
    brand_name: dbConfig.brand_name,
    logo_url: dbConfig.logo_url,
    primary_color: dbConfig.primary_color || defaultSiteConfig.primary_color,
    secondary_color: dbConfig.secondary_color || defaultSiteConfig.secondary_color,
    hero_title: dbConfig.hero_title || defaultSiteConfig.hero_title,
    hero_subtitle: dbConfig.hero_subtitle || defaultSiteConfig.hero_subtitle,
    about_text: dbConfig.about_text,
    about_image: dbConfig.about_image,
    kitchen_text: extendedConfig.kitchen_text || defaultKitchenText,
    stats: extendedConfig.stats ? parseStats(extendedConfig.stats) : defaultStats,
    modules: parseModules(dbConfig.modules),
    contact: parseContact(dbConfig.contact),
    updated_at: dbConfig.updated_at,
  };
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const { menus, isLoading: isMenusLoading, getMenuByDate } = useMenus();
  const { config: dbConfig, isLoading: isConfigLoading } = useSiteConfigDB();

  // Apply colors and create config in one useMemo to prevent flashes
  const config = useMemo(() => {
    const cfg = dbConfigToSiteConfig(dbConfig);
    
    // Apply colors immediately during render (not in useEffect)
    if (cfg.primary_color) {
      const primaryHSL = hexToHSL(cfg.primary_color);
      document.documentElement.style.setProperty('--primary', primaryHSL);
      document.documentElement.style.setProperty('--ring', primaryHSL);
    }
    if (cfg.secondary_color) {
      const secondaryHSL = hexToHSL(cfg.secondary_color);
      document.documentElement.style.setProperty('--secondary', secondaryHSL);
    }
    
    return cfg;
  }, [dbConfig]);

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        isConfigLoading,
        menus,
        isMenusLoading,
        getMenuByDate,
      }}
    >
      {isConfigLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        children
      )}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return context;
}
