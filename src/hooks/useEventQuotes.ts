import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RESTAURANT_SLUG = "principal";

export type EventQuoteStatus = "draft" | "sent" | "approved" | "archived";

export interface EventQuoteOption {
  id: string;
  title: string;
  menu: string;
  price: string;
  notes: string;
}

export interface EventQuote {
  id: string;
  client_name: string;
  client_contact: string;
  event_date: string;
  event_type: string;
  guest_count: number | null;
  notes: string;
  status: EventQuoteStatus;
  options: EventQuoteOption[];
  created_at: string;
}

type EventQuoteRow = {
  id: string;
  client_name: string;
  client_contact: string | null;
  event_date: string | null;
  event_type: string | null;
  guest_count: number | null;
  notes: string | null;
  status: EventQuoteStatus | null;
  options: unknown;
  created_at: string | null;
};

function normalizeOptions(options: unknown): EventQuoteOption[] {
  if (!Array.isArray(options)) return [];

  return options.map((option, index) => {
    const item = option as Record<string, unknown>;
    return {
      id: (item.id as string) || `option-${index + 1}`,
      title: (item.title as string) || `Opcao ${index + 1}`,
      menu: (item.menu as string) || "",
      price: (item.price as string) || "",
      notes: (item.notes as string) || "",
    };
  });
}

function mapQuote(row: EventQuoteRow): EventQuote {
  return {
    id: row.id,
    client_name: row.client_name,
    client_contact: row.client_contact || "",
    event_date: row.event_date || "",
    event_type: row.event_type || "",
    guest_count: row.guest_count,
    notes: row.notes || "",
    status: row.status || "draft",
    options: normalizeOptions(row.options),
    created_at: row.created_at || "",
  };
}

async function getRestaurantId() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", RESTAURANT_SLUG)
    .single();

  if (error) throw error;
  return data.id as string;
}

export function useEventQuotes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const quotesQuery = useQuery({
    queryKey: ["event_quotes", RESTAURANT_SLUG],
    queryFn: async () => {
      const restaurantId = await getRestaurantId();
      const { data, error } = await supabase
        .from("event_quotes")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((quote) => mapQuote(quote as EventQuoteRow));
    },
  });

  const addQuoteMutation = useMutation({
    mutationFn: async (quote: Omit<EventQuote, "id" | "created_at">) => {
      const restaurantId = await getRestaurantId();
      const { error } = await supabase.from("event_quotes").insert({
        restaurant_id: restaurantId,
        client_name: quote.client_name,
        client_contact: quote.client_contact || null,
        event_date: quote.event_date || null,
        event_type: quote.event_type || null,
        guest_count: quote.guest_count,
        notes: quote.notes || null,
        status: quote.status,
        options: quote.options,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_quotes", RESTAURANT_SLUG] });
      toast({
        title: "Orcamento salvo",
        description: "A proposta de evento foi guardada no historico.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar orcamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EventQuote> }) => {
      const { error } = await supabase
        .from("event_quotes")
        .update({
          client_name: updates.client_name,
          client_contact: updates.client_contact || null,
          event_date: updates.event_date || null,
          event_type: updates.event_type || null,
          guest_count: updates.guest_count,
          notes: updates.notes || null,
          status: updates.status,
          options: updates.options,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_quotes", RESTAURANT_SLUG] });
      toast({
        title: "Orcamento atualizado",
        description: "As alteracoes foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar orcamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_quotes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_quotes", RESTAURANT_SLUG] });
      toast({
        title: "Orcamento removido",
        description: "A proposta foi excluida.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover orcamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    quotes: quotesQuery.data ?? [],
    isLoading: quotesQuery.isLoading,
    addQuote: addQuoteMutation.mutate,
    updateQuote: (id: string, updates: Partial<EventQuote>) =>
      updateQuoteMutation.mutate({ id, updates }),
    deleteQuote: deleteQuoteMutation.mutate,
    isAddingQuote: addQuoteMutation.isPending,
    isUpdatingQuote: updateQuoteMutation.isPending,
    isDeletingQuote: deleteQuoteMutation.isPending,
  };
}
