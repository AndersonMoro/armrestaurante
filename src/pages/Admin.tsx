import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useMenus, MenuPDF } from "@/hooks/useMenus";
import { useEventQuotes, EventQuote, EventQuoteOption, EventQuoteStatus } from "@/hooks/useEventQuotes";
import { useDinnerEvents, DinnerEvent } from "@/hooks/useDinnerEvents";
import { useSiteConfigDB } from "@/hooks/useSiteConfigDB";
import { formatDateDisplay, formatDateStorage } from "@/lib/date";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Settings,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Save,
  Loader2,
  Palette,
  MapPin,
  Clock,
  Star,
  MessageSquare,
  Phone,
  FileText as FileTextIcon,
  Printer,
  ClipboardList,
  Utensils,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ModulesConfig,
  ContactInfo,
  HighlightItem,
  HoursItem,
  StatItem,
  MenuCategory,
  defaultModules,
  defaultContact,
  defaultStats,
  defaultKitchenText,
} from "@/types";

const createLocalId = () => Math.random().toString(36).slice(2, 10);

const createEmptyCategory = (): MenuCategory => ({
  id: createLocalId(),
  name: "Pratos principais",
  items: [
    {
      id: createLocalId(),
      name: "",
      description: "",
      price: "",
      available: true,
    },
  ],
});

const createMenuItem = (name = "", description = "") => ({
  id: createLocalId(),
  name,
  description,
  price: "",
  available: true,
});

const createBuffetTemplateCategories = (): MenuCategory[] => [
  {
    id: createLocalId(),
    name: "Pratos principais",
    items: [createMenuItem()],
  },
  {
    id: createLocalId(),
    name: "Acompanhamentos",
    items: [createMenuItem()],
  },
  {
    id: createLocalId(),
    name: "Saladas",
    items: [createMenuItem()],
  },
  {
    id: createLocalId(),
    name: "Sobremesas",
    items: [createMenuItem()],
  },
];

const createQuoteOption = (index: number): EventQuoteOption => ({
  id: createLocalId(),
  title: `Opcao ${index + 1}`,
  menu: "",
  price: "",
  notes: "",
});

const createDefaultQuoteOptions = () => [0, 1, 2].map((index) => createQuoteOption(index));

const Admin = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const {
    menus,
    isLoading: menusLoading,
    addMenu,
    updateMenu,
    deleteMenu,
    uploadMenuFile,
    isAddingMenu,
    isUpdatingMenu,
    isUploadingMenuFile,
  } = useMenus();
  const {
    quotes,
    isLoading: quotesLoading,
    addQuote,
    updateQuote,
    deleteQuote,
    isAddingQuote,
    isUpdatingQuote,
  } = useEventQuotes();
  const {
    dinnerEvents,
    isLoading: dinnerEventsLoading,
    addDinnerEvent,
    updateDinnerEvent,
    deleteDinnerEvent,
    isAddingDinnerEvent,
    isUpdatingDinnerEvent,
  } = useDinnerEvents();
  const { config, isLoading: configLoading, updateConfig, isUpdating } = useSiteConfigDB();
  const { toast } = useToast();

  // Menu form state
  const [menuDate, setMenuDate] = useState<Date | undefined>(new Date());
  const [menuTitle, setMenuTitle] = useState("");
  const [menuPdfUrl, setMenuPdfUrl] = useState("");
  const [menuNotes, setMenuNotes] = useState("");
  const [menuPricePerKg, setMenuPricePerKg] = useState("");
  const [menuBuffetPrice, setMenuBuffetPrice] = useState("");
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([createEmptyCategory()]);
  const [bulkItemsByCategory, setBulkItemsByCategory] = useState<Record<string, string>>({});
  const [menuActive, setMenuActive] = useState(true);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  // Event quote form state
  const [quoteClientName, setQuoteClientName] = useState("");
  const [quoteClientContact, setQuoteClientContact] = useState("");
  const [quoteEventDate, setQuoteEventDate] = useState<Date | undefined>();
  const [quoteEventType, setQuoteEventType] = useState("");
  const [quoteGuestCount, setQuoteGuestCount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteStatus, setQuoteStatus] = useState<EventQuoteStatus>("draft");
  const [quoteOptions, setQuoteOptions] = useState<EventQuoteOption[]>(createDefaultQuoteOptions());
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // Advance dinner sales form state
  const [dinnerDate, setDinnerDate] = useState<Date | undefined>(new Date());
  const [dinnerTitle, setDinnerTitle] = useState("");
  const [dinnerDescription, setDinnerDescription] = useState("");
  const [dinnerMenuSummary, setDinnerMenuSummary] = useState("");
  const [dinnerRegularPrice, setDinnerRegularPrice] = useState("");
  const [dinnerAdvancePrice, setDinnerAdvancePrice] = useState("");
  const [dinnerTotalQuantity, setDinnerTotalQuantity] = useState("10");
  const [dinnerReservedQuantity, setDinnerReservedQuantity] = useState("0");
  const [dinnerPurchaseDeadline, setDinnerPurchaseDeadline] = useState("17:00");
  const [dinnerActive, setDinnerActive] = useState(true);
  const [editingDinnerId, setEditingDinnerId] = useState<string | null>(null);

  // Local config state for form
  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0369a1");
  const [secondaryColor, setSecondaryColor] = useState("#e0f2fe");
  const [modules, setModules] = useState<ModulesConfig>(defaultModules);
  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  
  // About page state
  const [aboutText, setAboutText] = useState("");
  const [aboutImage, setAboutImage] = useState("");
  const [kitchenText, setKitchenText] = useState(defaultKitchenText);
  const [stats, setStats] = useState<StatItem[]>(defaultStats);

  // Initialize form when config loads
  useEffect(() => {
    if (config) {
      setBrandName(config.brand_name || "Center Hotel");
      setLogoUrl(config.logo_url || "");
      setHeroTitle(config.hero_title || "");
      setHeroSubtitle(config.hero_subtitle || "");
      setPrimaryColor(config.primary_color || "#0369a1");
      setSecondaryColor(config.secondary_color || "#e0f2fe");
      
      // About page fields
      setAboutText(config.about_text || "");
      setAboutImage(config.about_image || "");
      
      // Access kitchen_text and stats with type assertion
      const extendedConfig = config as typeof config & { 
        kitchen_text?: string | null; 
        stats?: unknown;
      };
      setKitchenText(extendedConfig.kitchen_text || defaultKitchenText);
      
      // Parse stats
      const rawStats = extendedConfig.stats;
      if (Array.isArray(rawStats)) {
        setStats(rawStats.map((item: unknown) => {
          const i = item as Record<string, unknown>;
          return {
            value: (i.value as string) || "",
            label: (i.label as string) || "",
          };
        }));
      } else {
        setStats(defaultStats);
      }
      
      // Parse modules from JSON
      const rawModules = config.modules as unknown;
      if (rawModules && typeof rawModules === 'object') {
        const m = rawModules as Record<string, unknown>;
        setModules({
          highlights: {
            enabled: (m.highlights as Record<string, unknown>)?.enabled !== false,
            items: Array.isArray((m.highlights as Record<string, unknown>)?.items) 
              ? (m.highlights as Record<string, unknown>).items as HighlightItem[]
              : defaultModules.highlights.items,
          },
          hours: {
            enabled: (m.hours as Record<string, unknown>)?.enabled !== false,
            items: Array.isArray((m.hours as Record<string, unknown>)?.items)
              ? (m.hours as Record<string, unknown>).items as HoursItem[]
              : defaultModules.hours.items,
          },
          location: {
            enabled: (m.location as Record<string, unknown>)?.enabled !== false,
            address: ((m.location as Record<string, unknown>)?.address as string) || defaultModules.location.address,
            mapEmbedUrl: ((m.location as Record<string, unknown>)?.mapEmbedUrl as string) || "",
          },
          cta: {
            enabled: (m.cta as Record<string, unknown>)?.enabled !== false,
            title: ((m.cta as Record<string, unknown>)?.title as string) || defaultModules.cta.title,
            subtitle: ((m.cta as Record<string, unknown>)?.subtitle as string) || defaultModules.cta.subtitle,
            buttonText: ((m.cta as Record<string, unknown>)?.buttonText as string) || defaultModules.cta.buttonText,
            buttonLink: ((m.cta as Record<string, unknown>)?.buttonLink as string) || defaultModules.cta.buttonLink,
          },
        });
      }
      
      // Parse contact from JSON
      const rawContact = config.contact as unknown;
      if (rawContact && typeof rawContact === 'object') {
        const c = rawContact as Record<string, string>;
        setContact({
          phone: c.phone || "",
          whatsapp: c.whatsapp || "",
          email: c.email || "",
          address: c.address || "",
          instagram: c.instagram || "",
          facebook: c.facebook || "",
        });
      }
    }
  }, [config]);

  const handleLogout = async () => {
    /*
    toast({
      title: "Logout realizado",
      description: "Você saiu do painel administrativo.",
    });
    */
    await signOut();
    navigate("/auth");
  };

  const resetMenuForm = () => {
    setMenuDate(new Date());
    setMenuTitle("");
    setMenuPdfUrl("");
    setMenuNotes("");
    setMenuPricePerKg("");
    setMenuBuffetPrice("");
    setMenuCategories([createEmptyCategory()]);
    setBulkItemsByCategory({});
    setMenuActive(true);
    setEditingMenuId(null);
  };

  const hasStructuredMenu = menuCategories.some((category) =>
    category.name.trim() || category.items.some((item) => item.name.trim())
  );

  const cleanMenuCategories = () =>
    menuCategories
      .map((category) => ({
        ...category,
        name: category.name.trim(),
        items: category.items
          .map((item) => ({
            ...item,
            name: item.name.trim(),
            description: item.description.trim(),
            price: "",
          }))
          .filter((item) => item.name),
      }))
      .filter((category) => category.name || category.items.length > 0);

  const handleSaveMenu = () => {
    if (!menuDate || !menuTitle.trim() || (!menuPdfUrl.trim() && !hasStructuredMenu)) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a data, título e link do PDF.",
        variant: "destructive",
      });
      return;
    }

    const dateStr = formatDateStorage(menuDate);

    const existingActiveMenu = menus.find(
      (m) => m.date === dateStr && m.active && m.id !== editingMenuId
    );

    if (existingActiveMenu && menuActive) {
      toast({
        title: "Data já possui cardápio ativo",
        description: "Desative o cardápio existente ou escolha outra data.",
        variant: "destructive",
      });
      return;
    }

    const menuPayload = {
      date: dateStr,
      title: menuTitle,
      pdf_url: menuPdfUrl.trim(),
      notes: menuNotes.trim() || null,
      price_per_kg: menuPricePerKg.trim() || null,
      buffet_price: menuBuffetPrice.trim() || null,
      categories: cleanMenuCategories(),
      active: menuActive,
    };

    if (editingMenuId) {
      updateMenu(editingMenuId, menuPayload);
    } else {
      addMenu(menuPayload);
    }

    resetMenuForm();
  };

  const handleEditMenu = (menu: MenuPDF) => {
    setMenuDate(new Date(menu.date + "T12:00:00"));
    setMenuTitle(menu.title);
    setMenuPdfUrl(menu.pdf_url);
    setMenuNotes(menu.notes || "");
    setMenuPricePerKg(menu.price_per_kg || "");
    setMenuBuffetPrice(menu.buffet_price || "");
    setMenuCategories(menu.categories?.length ? menu.categories : [createEmptyCategory()]);
    setBulkItemsByCategory({});
    setMenuActive(menu.active);
    setEditingMenuId(menu.id);
  };

  const handleDeleteMenu = (id: string) => {
    deleteMenu(id);
  };

  const handleMenuFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const publicUrl = await uploadMenuFile(file);
    setMenuPdfUrl(publicUrl);
    toast({
      title: "Arquivo enviado",
      description: "O link do PDF foi preenchido automaticamente.",
    });
    event.target.value = "";
  };

  const resetQuoteForm = () => {
    setQuoteClientName("");
    setQuoteClientContact("");
    setQuoteEventDate(undefined);
    setQuoteEventType("");
    setQuoteGuestCount("");
    setQuoteNotes("");
    setQuoteStatus("draft");
    setQuoteOptions(createDefaultQuoteOptions());
    setEditingQuoteId(null);
  };

  const updateQuoteOption = (optionId: string, field: keyof Omit<EventQuoteOption, "id">, value: string) => {
    setQuoteOptions((current) =>
      current.map((option) => (option.id === optionId ? { ...option, [field]: value } : option))
    );
  };

  const cleanQuoteOptions = () =>
    quoteOptions.map((option, index) => ({
      ...option,
      title: option.title.trim() || `Opcao ${index + 1}`,
      menu: option.menu.trim(),
      price: option.price.trim(),
      notes: option.notes.trim(),
    }));

  const handleSaveQuote = () => {
    if (!quoteClientName.trim()) {
      toast({
        title: "Cliente obrigatorio",
        description: "Informe pelo menos o nome do cliente ou empresa.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      client_name: quoteClientName.trim(),
      client_contact: quoteClientContact.trim(),
      event_date: quoteEventDate ? formatDateStorage(quoteEventDate) : "",
      event_type: quoteEventType.trim(),
      guest_count: quoteGuestCount ? Number(quoteGuestCount) : null,
      notes: quoteNotes.trim(),
      status: quoteStatus,
      options: cleanQuoteOptions(),
    };

    if (editingQuoteId) {
      updateQuote(editingQuoteId, payload);
    } else {
      addQuote(payload);
    }

    resetQuoteForm();
  };

  const handleEditQuote = (quote: EventQuote) => {
    setQuoteClientName(quote.client_name);
    setQuoteClientContact(quote.client_contact);
    setQuoteEventDate(quote.event_date ? new Date(`${quote.event_date}T12:00:00`) : undefined);
    setQuoteEventType(quote.event_type);
    setQuoteGuestCount(quote.guest_count ? String(quote.guest_count) : "");
    setQuoteNotes(quote.notes);
    setQuoteStatus(quote.status);
    setQuoteOptions(quote.options.length ? quote.options : createDefaultQuoteOptions());
    setEditingQuoteId(quote.id);
  };

  const handleDeleteQuote = (id: string) => {
    deleteQuote(id);
  };

  const resetDinnerForm = () => {
    setDinnerDate(new Date());
    setDinnerTitle("");
    setDinnerDescription("");
    setDinnerMenuSummary("");
    setDinnerRegularPrice("");
    setDinnerAdvancePrice("");
    setDinnerTotalQuantity("10");
    setDinnerReservedQuantity("0");
    setDinnerPurchaseDeadline("17:00");
    setDinnerActive(true);
    setEditingDinnerId(null);
  };

  const handleSaveDinnerEvent = () => {
    const totalQuantity = Number(dinnerTotalQuantity);
    const reservedQuantity = Number(dinnerReservedQuantity);

    if (!dinnerDate || !dinnerTitle.trim() || !dinnerAdvancePrice.trim()) {
      toast({
        title: "Campos obrigatorios",
        description: "Informe data, titulo e valor antecipado.",
        variant: "destructive",
      });
      return;
    }

    if (Number.isNaN(totalQuantity) || totalQuantity < 0 || Number.isNaN(reservedQuantity) || reservedQuantity < 0) {
      toast({
        title: "Quantidade invalida",
        description: "Use numeros validos para estoque e reservas.",
        variant: "destructive",
      });
      return;
    }

    if (reservedQuantity > totalQuantity) {
      toast({
        title: "Reserva maior que estoque",
        description: "A quantidade reservada nao pode passar da quantidade disponivel.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      event_date: formatDateStorage(dinnerDate),
      title: dinnerTitle.trim(),
      description: dinnerDescription.trim(),
      menu_summary: dinnerMenuSummary.trim(),
      regular_price: dinnerRegularPrice.trim(),
      advance_price: dinnerAdvancePrice.trim(),
      total_quantity: totalQuantity,
      reserved_quantity: reservedQuantity,
      purchase_deadline: dinnerPurchaseDeadline || "17:00",
      active: dinnerActive,
    };

    if (editingDinnerId) {
      updateDinnerEvent(editingDinnerId, payload);
    } else {
      addDinnerEvent(payload);
    }

    resetDinnerForm();
  };

  const handleEditDinnerEvent = (event: DinnerEvent) => {
    setDinnerDate(new Date(`${event.event_date}T12:00:00`));
    setDinnerTitle(event.title);
    setDinnerDescription(event.description);
    setDinnerMenuSummary(event.menu_summary);
    setDinnerRegularPrice(event.regular_price);
    setDinnerAdvancePrice(event.advance_price);
    setDinnerTotalQuantity(String(event.total_quantity));
    setDinnerReservedQuantity(String(event.reserved_quantity));
    setDinnerPurchaseDeadline(event.purchase_deadline || "17:00");
    setDinnerActive(event.active);
    setEditingDinnerId(event.id);
  };

  const handleDeleteDinnerEvent = (id: string) => {
    deleteDinnerEvent(id);
  };

  const addCategory = () => {
    setMenuCategories((current) => [...current, createEmptyCategory()]);
  };

  const applyBuffetTemplate = () => {
    setMenuCategories(createBuffetTemplateCategories());
    setBulkItemsByCategory({});
  };

  const duplicateLatestMenu = () => {
    const latestMenu = menus
      .filter((menu) => menu.active && menu.id !== editingMenuId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!latestMenu) {
      toast({
        title: "Sem cardapio anterior",
        description: "Ainda nao existe um cardapio ativo para duplicar.",
      });
      return;
    }

    setMenuTitle(latestMenu.title);
    setMenuNotes(latestMenu.notes || "");
    setMenuPricePerKg(latestMenu.price_per_kg || "");
    setMenuBuffetPrice(latestMenu.buffet_price || "");
    setMenuCategories(latestMenu.categories?.length ? latestMenu.categories : [createEmptyCategory()]);
    setBulkItemsByCategory({});
  };

  const updateCategoryName = (categoryId: string, name: string) => {
    setMenuCategories((current) =>
      current.map((category) => (category.id === categoryId ? { ...category, name } : category))
    );
  };

  const removeCategory = (categoryId: string) => {
    setMenuCategories((current) =>
      current.length > 1 ? current.filter((category) => category.id !== categoryId) : [createEmptyCategory()]
    );
    setBulkItemsByCategory((current) => {
      const next = { ...current };
      delete next[categoryId];
      return next;
    });
  };

  const addMenuItem = (categoryId: string) => {
    setMenuCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: [
                ...category.items,
                { id: createLocalId(), name: "", description: "", price: "", available: true },
              ],
            }
          : category
      )
    );
  };

  const addBulkMenuItems = (categoryId: string) => {
    const text = bulkItemsByCategory[categoryId] || "";
    const items = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, ...descriptionParts] = line.split(/\s[-:]\s/);
        return createMenuItem(name.trim(), descriptionParts.join(" - ").trim());
      });

    if (items.length === 0) return;

    setMenuCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: [
                ...category.items.filter((item) => item.name.trim()),
                ...items,
              ],
            }
          : category
      )
    );
    setBulkItemsByCategory((current) => ({ ...current, [categoryId]: "" }));
  };

  const updateMenuItem = (
    categoryId: string,
    itemId: string,
    field: "name" | "description" | "price" | "available",
    value: string | boolean
  ) => {
    setMenuCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : category
      )
    );
  };

  const removeMenuItem = (categoryId: string, itemId: string) => {
    setMenuCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.length > 1
                ? category.items.filter((item) => item.id !== itemId)
                : [{ id: createLocalId(), name: "", description: "", price: "", available: true }],
            }
          : category
      )
    );
  };

  const handleSaveConfig = () => {
    updateConfig({
      brand_name: brandName,
      logo_url: logoUrl || null,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      about_text: aboutText || null,
      about_image: aboutImage || null,
      modules: JSON.parse(JSON.stringify(modules)),
      contact: JSON.parse(JSON.stringify(contact)),
      kitchen_text: kitchenText,
      stats: JSON.parse(JSON.stringify(stats)),
    } as Record<string, unknown>);
  };

  // Helper to update stat item
  const updateStatItem = (index: number, field: keyof StatItem, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };

  // Helper to update highlight item
  const updateHighlightItem = (index: number, field: keyof HighlightItem, value: string | boolean) => {
    const newItems = [...modules.highlights.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setModules(prev => ({
      ...prev,
      highlights: { ...prev.highlights, items: newItems },
    }));
  };

  // Helper to update hours item
  const updateHoursItem = (index: number, field: keyof HoursItem, value: string | boolean) => {
    const newItems = [...modules.hours.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setModules(prev => ({
      ...prev,
      hours: { ...prev.hours, items: newItems },
    }));
  };

  if (menusLoading || configLoading || quotesLoading || dinnerEventsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display font-bold">
              A
            </div>
            <div>
              <p className="font-display font-semibold">Painel Admin</p>
              <p className="text-xs text-muted-foreground">{brandName}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container py-8">
        <Tabs defaultValue="menus" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="menus" className="gap-2">
              <FileText className="h-4 w-4" />
              Cardápios
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Orcamentos
            </TabsTrigger>
            <TabsTrigger value="dinners" className="gap-2">
              <Utensils className="h-4 w-4" />
              Jantares
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Menus Tab */}
          <TabsContent value="menus" className="space-y-6">
            {/* Menu Form */}
            <div className="bg-card rounded-xl shadow-card p-6">
              <h2 className="font-display text-lg font-semibold mb-6">
                {editingMenuId ? "Editar Cardápio" : "Novo Cardápio"}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !menuDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {menuDate ? format(menuDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={menuDate}
                        onSelect={setMenuDate}
                        locale={ptBR}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menuTitle">Título</Label>
                  <Input
                    id="menuTitle"
                    value={menuTitle}
                    onChange={(e) => setMenuTitle(e.target.value)}
                    placeholder="Ex: Cardápio de Domingo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menuPdfUrl">Link do PDF</Label>
                  <Input
                    id="menuPdfUrl"
                    value={menuPdfUrl}
                    onChange={(e) => setMenuPdfUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <Input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleMenuFileUpload}
                    disabled={isUploadingMenuFile}
                  />
                  <p className="text-xs text-muted-foreground">
                    Envie um PDF pronto ou informe um link externo. O cardápio estruturado continua sendo exibido no site.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-3 h-10">
                    <Switch checked={menuActive} onCheckedChange={setMenuActive} />
                    <span className="text-sm">{menuActive ? "Ativo" : "Inativo"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="menuPricePerKg">Valor por kg</Label>
                  <Input
                    id="menuPricePerKg"
                    value={menuPricePerKg}
                    onChange={(e) => setMenuPricePerKg(e.target.value)}
                    placeholder="Ex: R$ 69,90/kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menuBuffetPrice">Buffet livre</Label>
                  <Input
                    id="menuBuffetPrice"
                    value={menuBuffetPrice}
                    onChange={(e) => setMenuBuffetPrice(e.target.value)}
                    placeholder="Ex: R$ 39,90"
                  />
                </div>
              </div>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="menuNotes">Observações do cardápio</Label>
                  <Textarea
                    id="menuNotes"
                    value={menuNotes}
                    onChange={(e) => setMenuNotes(e.target.value)}
                    placeholder="Ex: Cardápio sujeito a alterações conforme disponibilidade."
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-display text-base font-semibold">Itens do cardápio</h3>
                      <p className="text-sm text-muted-foreground">
                        Cadastre os pratos por categoria. Os valores ficam no cardápio: por kg e buffet livre.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={duplicateLatestMenu}>
                        Duplicar último
                      </Button>
                      <Button type="button" variant="outline" onClick={applyBuffetTemplate}>
                        Modelo buffet
                      </Button>
                      <Button type="button" variant="outline" onClick={addCategory}>
                        <Plus className="mr-2 h-4 w-4" />
                        Categoria
                      </Button>
                    </div>
                  </div>

                  {menuCategories.map((category, categoryIndex) => (
                    <div key={category.id} className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`category-${category.id}`}>Categoria {categoryIndex + 1}</Label>
                          <Input
                            id={`category-${category.id}`}
                            value={category.name}
                            onChange={(e) => updateCategoryName(category.id, e.target.value)}
                            placeholder="Ex: Entradas, Pratos principais, Sobremesas"
                          />
                        </div>
                        <Button type="button" variant="ghost" onClick={() => removeCategory(category.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {category.items.map((item) => (
                          <div key={item.id} className="grid gap-3 rounded-lg bg-card p-3 md:grid-cols-[1fr_1.6fr_auto_auto]">
                            <Input
                              value={item.name}
                              onChange={(e) => updateMenuItem(category.id, item.id, "name", e.target.value)}
                              placeholder="Nome do prato"
                            />
                            <Input
                              value={item.description}
                              onChange={(e) => updateMenuItem(category.id, item.id, "description", e.target.value)}
                              placeholder="Descrição curta"
                            />
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.available}
                                onCheckedChange={(checked) => updateMenuItem(category.id, item.id, "available", checked)}
                              />
                              <span className="text-sm">Ativo</span>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeMenuItem(category.id, item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-lg border border-dashed border-border bg-background p-3">
                        <Label htmlFor={`bulk-${category.id}`}>Adicionar vários pratos</Label>
                        <Textarea
                          id={`bulk-${category.id}`}
                          value={bulkItemsByCategory[category.id] || ""}
                          onChange={(e) =>
                            setBulkItemsByCategory((current) => ({
                              ...current,
                              [category.id]: e.target.value,
                            }))
                          }
                          placeholder={"Um prato por linha. Ex:\nFrango assado\nCarne de panela - molho da casa\nLasanha bolonhesa"}
                          rows={4}
                          className="mt-2"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => addBulkMenuItems(category.id)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar lista
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => addMenuItem(category.id)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar um prato
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleSaveMenu} disabled={isAddingMenu || isUpdatingMenu}>
                  {(isAddingMenu || isUpdatingMenu) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : editingMenuId ? (
                    <Save className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {editingMenuId ? "Salvar Alterações" : "Cadastrar"}
                </Button>
                {editingMenuId && (
                  <Button variant="outline" onClick={resetMenuForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>

            {/* Menu List */}
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-display text-lg font-semibold">Cardápios Cadastrados</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Título</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Formato</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {menus.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhum cardápio cadastrado
                        </td>
                      </tr>
                    ) : (
                      menus.map((menu) => (
                        <tr key={menu.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm">{formatDateDisplay(menu.date)}</td>
                          <td className="px-4 py-3 text-sm font-medium">{menu.title}</td>
                          <td className="px-4 py-3 text-sm">{menu.categories?.length ? "Estruturado" : "PDF"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                menu.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              )}
                            >
                              {menu.active ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(`/cardapio/${menu.id}/imprimir`, "_blank")}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditMenu(menu)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteMenu(menu.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Event Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h2 className="font-display text-lg font-semibold mb-2">
                {editingQuoteId ? "Editar Orcamento" : "Novo Orcamento de Evento"}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Monte ate 3 opcoes de cardapio para o cliente comparar e escolher.
              </p>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="quoteClientName">Cliente</Label>
                  <Input
                    id="quoteClientName"
                    value={quoteClientName}
                    onChange={(e) => setQuoteClientName(e.target.value)}
                    placeholder="Nome ou empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quoteClientContact">Contato</Label>
                  <Input
                    id="quoteClientContact"
                    value={quoteClientContact}
                    onChange={(e) => setQuoteClientContact(e.target.value)}
                    placeholder="WhatsApp, telefone ou e-mail"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data do evento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !quoteEventDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {quoteEventDate ? format(quoteEventDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={quoteEventDate}
                        onSelect={setQuoteEventDate}
                        locale={ptBR}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quoteGuestCount">Pessoas</Label>
                  <Input
                    id="quoteGuestCount"
                    type="number"
                    min="0"
                    value={quoteGuestCount}
                    onChange={(e) => setQuoteGuestCount(e.target.value)}
                    placeholder="Ex: 80"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quoteEventType">Tipo de evento</Label>
                  <Input
                    id="quoteEventType"
                    value={quoteEventType}
                    onChange={(e) => setQuoteEventType(e.target.value)}
                    placeholder="Aniversario, jantar, confraternizacao..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quoteStatus">Status</Label>
                  <select
                    id="quoteStatus"
                    value={quoteStatus}
                    onChange={(e) => setQuoteStatus(e.target.value as EventQuoteStatus)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="sent">Enviado</option>
                    <option value="approved">Aprovado</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="quoteNotes">Observacoes gerais</Label>
                <Textarea
                  id="quoteNotes"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Preferencias, restricoes alimentares, horario, local, servico incluso..."
                  rows={3}
                />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {quoteOptions.map((option, index) => (
                  <div key={option.id} className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-display text-base font-semibold">Opcao {index + 1}</h3>
                      <Input
                        value={option.price}
                        onChange={(e) => updateQuoteOption(option.id, "price", e.target.value)}
                        placeholder="R$"
                        className="w-32"
                      />
                    </div>
                    <div className="space-y-3">
                      <Input
                        value={option.title}
                        onChange={(e) => updateQuoteOption(option.id, "title", e.target.value)}
                        placeholder="Ex: Buffet simples"
                      />
                      <Textarea
                        value={option.menu}
                        onChange={(e) => updateQuoteOption(option.id, "menu", e.target.value)}
                        placeholder="Itens do cardapio desta opcao..."
                        rows={8}
                      />
                      <Textarea
                        value={option.notes}
                        onChange={(e) => updateQuoteOption(option.id, "notes", e.target.value)}
                        placeholder="Condicoes, bebidas, sobremesas, equipe, entrega..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveQuote} disabled={isAddingQuote || isUpdatingQuote}>
                  {(isAddingQuote || isUpdatingQuote) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : editingQuoteId ? (
                    <Save className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {editingQuoteId ? "Salvar Alteracoes" : "Salvar Orcamento"}
                </Button>
                {editingQuoteId && (
                  <Button variant="outline" onClick={resetQuoteForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-display text-lg font-semibold">Orcamentos Salvos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Evento</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quotes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhum orcamento cadastrado
                        </td>
                      </tr>
                    ) : (
                      quotes.map((quote) => (
                        <tr key={quote.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm">
                            <p className="font-medium">{quote.client_name}</p>
                            {quote.client_contact && (
                              <p className="text-xs text-muted-foreground">{quote.client_contact}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <p>{quote.event_type || "Evento"}</p>
                            {quote.guest_count && (
                              <p className="text-xs text-muted-foreground">{quote.guest_count} pessoas</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {quote.event_date ? formatDateDisplay(quote.event_date) : "Sem data"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium">
                              {quote.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEditQuote(quote)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteQuote(quote.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Advance Dinner Sales Tab */}
          <TabsContent value="dinners" className="space-y-6">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h2 className="font-display text-lg font-semibold mb-2">
                {editingDinnerId ? "Editar jantar antecipado" : "Novo jantar antecipado"}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Configure a quantidade disponivel, preco antecipado e horario limite de compra.
              </p>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Data do jantar</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dinnerDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dinnerDate ? format(dinnerDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dinnerDate}
                        onSelect={setDinnerDate}
                        locale={ptBR}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dinnerTitle">Titulo</Label>
                  <Input
                    id="dinnerTitle"
                    value={dinnerTitle}
                    onChange={(e) => setDinnerTitle(e.target.value)}
                    placeholder="Ex: Jantar Italiano"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dinnerRegularPrice">Valor no dia</Label>
                  <Input
                    id="dinnerRegularPrice"
                    value={dinnerRegularPrice}
                    onChange={(e) => setDinnerRegularPrice(e.target.value)}
                    placeholder="Ex: R$ 79,90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dinnerAdvancePrice">Valor antecipado</Label>
                  <Input
                    id="dinnerAdvancePrice"
                    value={dinnerAdvancePrice}
                    onChange={(e) => setDinnerAdvancePrice(e.target.value)}
                    placeholder="Ex: R$ 69,90"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="dinnerTotalQuantity">Quantidade disponivel</Label>
                  <Input
                    id="dinnerTotalQuantity"
                    type="number"
                    min="0"
                    value={dinnerTotalQuantity}
                    onChange={(e) => setDinnerTotalQuantity(e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dinnerReservedQuantity">Reservados</Label>
                  <Input
                    id="dinnerReservedQuantity"
                    type="number"
                    min="0"
                    value={dinnerReservedQuantity}
                    onChange={(e) => setDinnerReservedQuantity(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Por enquanto manual. Na fase do pagamento, o webhook atualiza sozinho.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dinnerPurchaseDeadline">Comprar ate</Label>
                  <Input
                    id="dinnerPurchaseDeadline"
                    type="time"
                    value={dinnerPurchaseDeadline}
                    onChange={(e) => setDinnerPurchaseDeadline(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-3 h-10">
                    <Switch checked={dinnerActive} onCheckedChange={setDinnerActive} />
                    <span className="text-sm">{dinnerActive ? "Ativo" : "Inativo"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dinnerDescription">Descricao comercial</Label>
                  <Textarea
                    id="dinnerDescription"
                    value={dinnerDescription}
                    onChange={(e) => setDinnerDescription(e.target.value)}
                    placeholder="Texto curto para explicar a venda antecipada."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dinnerMenuSummary">Resumo do cardapio</Label>
                  <Textarea
                    id="dinnerMenuSummary"
                    value={dinnerMenuSummary}
                    onChange={(e) => setDinnerMenuSummary(e.target.value)}
                    placeholder="Ex: massas, carnes, saladas, sobremesa inclusa..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveDinnerEvent} disabled={isAddingDinnerEvent || isUpdatingDinnerEvent}>
                  {(isAddingDinnerEvent || isUpdatingDinnerEvent) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : editingDinnerId ? (
                    <Save className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {editingDinnerId ? "Salvar alteracoes" : "Cadastrar jantar"}
                </Button>
                {editingDinnerId && (
                  <Button variant="outline" onClick={resetDinnerForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-display text-lg font-semibold">Jantares cadastrados</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Jantar</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Preco</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estoque</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Limite</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dinnerEvents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhum jantar antecipado cadastrado
                        </td>
                      </tr>
                    ) : (
                      dinnerEvents.map((event) => {
                        const remaining = event.total_quantity - event.reserved_quantity;
                        return (
                          <tr key={event.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 text-sm">{formatDateDisplay(event.event_date)}</td>
                            <td className="px-4 py-3 text-sm">
                              <p className="font-medium">{event.title}</p>
                              {event.description && (
                                <p className="line-clamp-1 text-xs text-muted-foreground">{event.description}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <p className="font-medium">{event.advance_price}</p>
                              {event.regular_price && (
                                <p className="text-xs text-muted-foreground">No dia: {event.regular_price}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <p>{remaining} restantes</p>
                              <p className="text-xs text-muted-foreground">
                                {event.reserved_quantity}/{event.total_quantity} reservados
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm">{event.purchase_deadline}</td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                  event.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                )}
                              >
                                {event.active ? "Ativo" : "Inativo"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEditDinnerEvent(event)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteDinnerEvent(event.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="space-y-6">
            {/* Branding & Colors */}
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Marca e Cores</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Nome do Cliente</Label>
                  <Input
                    id="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Ex: Center Hotel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL do Logo</Label>
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Título do Hero</Label>
                  <Input
                    id="heroTitle"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Ex: Cardápio do Dia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Subtítulo do Hero</Label>
                  <Input
                    id="heroSubtitle"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="Ex: Hotel e Restaurante..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#0369a1"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#e0f2fe"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights Module */}
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold">Destaques (3 Cards)</h2>
                </div>
                <Switch
                  checked={modules.highlights.enabled}
                  onCheckedChange={(checked) =>
                    setModules(prev => ({
                      ...prev,
                      highlights: { ...prev.highlights, enabled: checked },
                    }))
                  }
                />
              </div>
              {modules.highlights.enabled && (
                <div className="space-y-4">
                  {modules.highlights.items.map((item, index) => (
                    <div key={index} className={cn(
                      "p-4 bg-muted/50 rounded-lg transition-opacity",
                      !item.enabled && "opacity-60"
                    )}>
                      <div className="flex items-center gap-3 mb-3">
                        <Switch
                          checked={item.enabled !== false}
                          onCheckedChange={(checked) => updateHighlightItem(index, 'enabled', checked)}
                        />
                        <span className="text-sm font-medium">
                          {item.enabled !== false ? "Ativo" : "Desativado"}
                        </span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Ícone</Label>
                          <Input
                            value={item.icon}
                            onChange={(e) => updateHighlightItem(index, 'icon', e.target.value)}
                            placeholder="coffee, utensils, moon..."
                            disabled={!item.enabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateHighlightItem(index, 'title', e.target.value)}
                            placeholder="Café da Manhã"
                            disabled={!item.enabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateHighlightItem(index, 'description', e.target.value)}
                            placeholder="Buffet completo..."
                            disabled={!item.enabled}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hours Module */}
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold">Horários (3 Itens)</h2>
                </div>
                <Switch
                  checked={modules.hours.enabled}
                  onCheckedChange={(checked) =>
                    setModules(prev => ({
                      ...prev,
                      hours: { ...prev.hours, enabled: checked },
                    }))
                  }
                />
              </div>
              {modules.hours.enabled && (
                <div className="space-y-4">
                  {modules.hours.items.map((item, index) => (
                    <div key={index} className={cn(
                      "p-4 bg-muted/50 rounded-lg transition-opacity",
                      !item.enabled && "opacity-60"
                    )}>
                      <div className="flex items-center gap-3 mb-3">
                        <Switch
                          checked={item.enabled !== false}
                          onCheckedChange={(checked) => updateHoursItem(index, 'enabled', checked)}
                        />
                        <span className="text-sm font-medium">
                          {item.enabled !== false ? "Ativo" : "Desativado"}
                        </span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Refeição</Label>
                          <Input
                            value={item.label}
                            onChange={(e) => updateHoursItem(index, 'label', e.target.value)}
                            placeholder="Café da Manhã"
                            disabled={!item.enabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Horário</Label>
                          <Input
                            value={item.time}
                            onChange={(e) => updateHoursItem(index, 'time', e.target.value)}
                            placeholder="06:30 às 10:00"
                            disabled={!item.enabled}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location Module */}
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold">Localização</h2>
                </div>
                <Switch
                  checked={modules.location.enabled}
                  onCheckedChange={(checked) =>
                    setModules(prev => ({
                      ...prev,
                      location: { ...prev.location, enabled: checked },
                    }))
                  }
                />
              </div>
              {modules.location.enabled && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="locationAddress">Endereço</Label>
                    <Input
                      id="locationAddress"
                      value={modules.location.address}
                      onChange={(e) =>
                        setModules(prev => ({
                          ...prev,
                          location: { ...prev.location, address: e.target.value },
                        }))
                      }
                      placeholder="Rua Principal, 123 - Centro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mapEmbedUrl">Link do Mapa (embed do Google)</Label>
                    <Input
                      id="mapEmbedUrl"
                      value={modules.location.mapEmbedUrl}
                      onChange={(e) =>
                        setModules(prev => ({
                          ...prev,
                          location: { ...prev.location, mapEmbedUrl: e.target.value },
                        }))
                      }
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                    <p className="text-xs text-muted-foreground">
                      No Google Maps, clique em "Compartilhar" → "Incorporar um mapa" e copie apenas o URL do src="..."
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Module */}
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold">CTA (Chamada para Ação)</h2>
                </div>
                <Switch
                  checked={modules.cta.enabled}
                  onCheckedChange={(checked) =>
                    setModules(prev => ({
                      ...prev,
                      cta: { ...prev.cta, enabled: checked },
                    }))
                  }
                />
              </div>
              {modules.cta.enabled && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ctaTitle">Título</Label>
                    <Input
                      id="ctaTitle"
                      value={modules.cta.title}
                      onChange={(e) =>
                        setModules(prev => ({
                          ...prev,
                          cta: { ...prev.cta, title: e.target.value },
                        }))
                      }
                      placeholder="Confira o cardápio de hoje"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaSubtitle">Subtítulo</Label>
                    <Input
                      id="ctaSubtitle"
                      value={modules.cta.subtitle}
                      onChange={(e) =>
                        setModules(prev => ({
                          ...prev,
                          cta: { ...prev.cta, subtitle: e.target.value },
                        }))
                      }
                      placeholder="Veja todas as opções..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaButtonText">Texto do Botão</Label>
                    <Input
                      id="ctaButtonText"
                      value={modules.cta.buttonText}
                      onChange={(e) =>
                        setModules(prev => ({
                          ...prev,
                          cta: { ...prev.cta, buttonText: e.target.value },
                        }))
                      }
                      placeholder="Acessar Cardápio"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaButtonLink">Link do Botão</Label>
                    <Input
                      id="ctaButtonLink"
                      value={modules.cta.buttonLink}
                      onChange={(e) =>
                        setModules(prev => ({
                          ...prev,
                          cta: { ...prev.cta, buttonLink: e.target.value },
                        }))
                      }
                      placeholder="/cardapio"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* About Page */}
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileTextIcon className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Página Sobre</h2>
              </div>
              <div className="space-y-6">
                {/* Nossa História */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Nossa História</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="aboutText">Texto</Label>
                      <Textarea
                        id="aboutText"
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        placeholder="Descreva a história do estabelecimento..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aboutImage">URL da Imagem (opcional)</Label>
                      <Input
                        id="aboutImage"
                        value={aboutImage}
                        onChange={(e) => setAboutImage(e.target.value)}
                        placeholder="https://..."
                      />
                      {aboutImage && (
                        <div className="mt-2 rounded-lg overflow-hidden border">
                          <img
                            src={aboutImage}
                            alt="Preview"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nossa Cozinha */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Nossa Cozinha</h3>
                  <div className="space-y-2">
                    <Label htmlFor="kitchenText">Texto</Label>
                    <Textarea
                      id="kitchenText"
                      value={kitchenText}
                      onChange={(e) => setKitchenText(e.target.value)}
                      placeholder="Descreva a equipe e cozinha..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Estatísticas (3 itens)</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="space-y-2">
                          <Label>Valor</Label>
                          <Input
                            value={stat.value}
                            onChange={(e) => updateStatItem(index, 'value', e.target.value)}
                            placeholder="10+"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Input
                            value={stat.label}
                            onChange={(e) => updateStatItem(index, 'label', e.target.value)}
                            placeholder="Anos de experiência"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Phone className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Informações de Contato</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={contact.phone}
                    onChange={(e) => setContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp (número completo)</Label>
                  <Input
                    id="whatsapp"
                    value={contact.whatsapp}
                    onChange={(e) => setContact(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="5500000000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactAddress">Endereço</Label>
                  <Input
                    id="contactAddress"
                    value={contact.address}
                    onChange={(e) => setContact(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Rua, número - Bairro, Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram (usuário)</Label>
                  <Input
                    id="instagram"
                    value={contact.instagram || ""}
                    onChange={(e) => setContact(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook (usuário)</Label>
                  <Input
                    id="facebook"
                    value={contact.facebook || ""}
                    onChange={(e) => setContact(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="usuario"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveConfig} disabled={isUpdating} size="lg">
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
