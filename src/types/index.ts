export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Menu PDF type for daily menus
export interface MenuPDF {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  pdf_url: string;
  notes?: string | null;
  price_per_kg?: string | null;
  buffet_price?: string | null;
  categories?: MenuCategory[];
  active: boolean;
  created_at: string;
}

// Structured menu for on-screen display and print
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price?: string;
  image_url?: string;
  available: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

// Highlight item structure
export interface HighlightItem {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
}

// Hours item structure
export interface HoursItem {
  label: string;
  time: string;
  enabled: boolean;
}

// CTA module configuration
export interface CTAConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

// Highlights module configuration
export interface HighlightsConfig {
  enabled: boolean;
  items: HighlightItem[];
}

// Hours module configuration
export interface HoursConfig {
  enabled: boolean;
  items: HoursItem[];
}

// Location module configuration
export interface LocationConfig {
  enabled: boolean;
  address: string;
  mapEmbedUrl: string;
}

// Modules structure
export interface ModulesConfig {
  highlights: HighlightsConfig;
  hours: HoursConfig;
  location: LocationConfig;
  cta: CTAConfig;
}

// Contact information
export interface ContactInfo {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram?: string;
  facebook?: string;
}

// Stat item for About page
export interface StatItem {
  value: string;
  label: string;
}

// Default stats
export const defaultStats: StatItem[] = [
  { value: "10+", label: "Anos de experiência" },
  { value: "50+", label: "Pratos no cardápio" },
  { value: "1000+", label: "Clientes satisfeitos" },
];

// Site configuration for white-label system (frontend model)
export interface SiteConfig {
  id: string;
  brand_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string | null;
  about_image?: string | null;
  kitchen_text: string | null;
  stats: StatItem[];
  modules: ModulesConfig;
  contact: ContactInfo;
  updated_at: string;
}

// Default values for modules
export const defaultHighlights: HighlightsConfig = {
  enabled: true,
  items: [
    {
      icon: "coffee",
      title: "Café da Manhã",
      description: "Buffet completo com opções saudáveis e deliciosas para começar o dia.",
      enabled: true,
    },
    {
      icon: "utensils",
      title: "Almoço",
      description: "Pratos executivos e buffet variado com culinária regional e internacional.",
      enabled: true,
    },
    {
      icon: "moon",
      title: "Jantar",
      description: "Menu à la carte com opções sofisticadas em ambiente acolhedor.",
      enabled: true,
    },
  ],
};

export const defaultHours: HoursConfig = {
  enabled: true,
  items: [
    { label: "Café da Manhã", time: "06:30 às 10:00", enabled: true },
    { label: "Almoço", time: "11:30 às 14:30", enabled: true },
    { label: "Jantar", time: "18:30 às 22:00", enabled: true },
  ],
};

export const defaultLocation: LocationConfig = {
  enabled: true,
  address: "Rua Principal, 123 - Centro, Cidade - Estado, CEP 00000-000",
  mapEmbedUrl: "",
};

export const defaultCTA: CTAConfig = {
  enabled: true,
  title: "Confira o cardápio de hoje",
  subtitle: "Veja todas as opções disponíveis para suas refeições",
  buttonText: "Acessar Cardápio",
  buttonLink: "/cardapio",
};

export const defaultModules: ModulesConfig = {
  highlights: defaultHighlights,
  hours: defaultHours,
  location: defaultLocation,
  cta: defaultCTA,
};

export const defaultContact: ContactInfo = {
  phone: "(00) 0000-0000",
  whatsapp: "5500000000000",
  email: "contato@centerhotel.com.br",
  address: "Rua Principal, 123 - Centro, Cidade - Estado",
  instagram: "centerhotel",
  facebook: "centerhotel",
};

// Helper to parse JSON fields from database
export function parseModules(json: Json | null | undefined): ModulesConfig {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return defaultModules;
  }

  const obj = json as Record<string, unknown>;

  // Parse highlights
  const highlightsRaw = obj.highlights as Record<string, unknown> | undefined;
  const highlights: HighlightsConfig = {
    enabled: highlightsRaw?.enabled !== false,
    items: Array.isArray(highlightsRaw?.items) 
      ? (highlightsRaw.items as unknown[]).map((item: unknown) => {
          const i = item as Record<string, unknown>;
          return {
            icon: (i.icon as string) || "coffee",
            title: (i.title as string) || "",
            description: (i.description as string) || "",
            enabled: i.enabled !== false,
          };
        })
      : defaultHighlights.items,
  };

  // Parse hours
  const hoursRaw = obj.hours as Record<string, unknown> | undefined;
  const hours: HoursConfig = {
    enabled: hoursRaw?.enabled !== false,
    items: Array.isArray(hoursRaw?.items)
      ? (hoursRaw.items as unknown[]).map((item: unknown) => {
          const i = item as Record<string, unknown>;
          return {
            label: (i.label as string) || "",
            time: (i.time as string) || "",
            enabled: i.enabled !== false,
          };
        })
      : defaultHours.items,
  };

  // Parse location
  const locationRaw = obj.location as Record<string, unknown> | undefined;
  const location: LocationConfig = {
    enabled: locationRaw?.enabled !== false,
    address: (locationRaw?.address as string) || defaultLocation.address,
    mapEmbedUrl: (locationRaw?.mapEmbedUrl as string) || "",
  };

  // Parse CTA
  const ctaRaw = obj.cta as Record<string, unknown> | undefined;
  const cta: CTAConfig = {
    enabled: ctaRaw?.enabled !== false,
    title: (ctaRaw?.title as string) || defaultCTA.title,
    subtitle: (ctaRaw?.subtitle as string) || defaultCTA.subtitle,
    buttonText: (ctaRaw?.buttonText as string) || defaultCTA.buttonText,
    buttonLink: (ctaRaw?.buttonLink as string) || defaultCTA.buttonLink,
  };

  return { highlights, hours, location, cta };
}

export function parseContact(json: Json | null | undefined): ContactInfo {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return defaultContact;
  }

  const obj = json as Record<string, unknown>;
  return {
    phone: (obj.phone as string) || defaultContact.phone,
    whatsapp: (obj.whatsapp as string) || defaultContact.whatsapp,
    email: (obj.email as string) || defaultContact.email,
    address: (obj.address as string) || defaultContact.address,
    instagram: (obj.instagram as string) || defaultContact.instagram,
    facebook: (obj.facebook as string) || defaultContact.facebook,
  };
}

// Default kitchen text
export const defaultKitchenText = "Nossa equipe de cozinha é formada por profissionais experientes e apaixonados pela arte culinária. Trabalhamos com ingredientes frescos e de alta qualidade, preparando cada prato com carinho e dedicação para proporcionar a melhor experiência gastronômica aos nossos clientes.";

// Default configuration for Center Hotel
export const defaultSiteConfig: SiteConfig = {
  id: "",
  brand_name: "Center Hotel",
  logo_url: null,
  primary_color: "#0369a1",
  secondary_color: "#e0f2fe",
  hero_title: "Cardápio do Dia",
  hero_subtitle: "Hotel e Restaurante com sabor de tradição",
  about_text: "O Center Hotel é referência em hospitalidade e gastronomia, oferecendo aos nossos hóspedes e visitantes uma experiência única de conforto e sabor.",
  kitchen_text: defaultKitchenText,
  stats: defaultStats,
  modules: defaultModules,
  contact: defaultContact,
  updated_at: new Date().toISOString(),
};

// Helper to parse stats from JSON
export function parseStats(json: unknown): StatItem[] {
  if (!Array.isArray(json)) {
    return defaultStats;
  }
  return json.map((item: unknown) => {
    const i = item as Record<string, unknown>;
    return {
      value: (i.value as string) || "",
      label: (i.label as string) || "",
    };
  });
}
