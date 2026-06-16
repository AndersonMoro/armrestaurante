import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RESTAURANT_SLUG = "principal";

export interface DinnerEvent {
  id: string;
  event_date: string;
  title: string;
  description: string;
  menu_summary: string;
  regular_price: string;
  advance_price: string;
  total_quantity: number;
  reserved_quantity: number;
  purchase_deadline: string;
  active: boolean;
  auto_activate_on_menu: boolean;
  created_at: string;
}

export type DinnerEventInput = Omit<DinnerEvent, "id" | "created_at">;

type DinnerEventRow = {
  id: string;
  event_date: string;
  title: string;
  description: string | null;
  menu_summary: string | null;
  regular_price: string | null;
  advance_price: string;
  total_quantity: number | null;
  reserved_quantity: number | null;
  purchase_deadline: string | null;
  active: boolean | null;
  auto_activate_on_menu?: boolean | null;
  created_at: string | null;
};

function mapDinnerEvent(row: DinnerEventRow): DinnerEvent {
  return {
    id: row.id,
    event_date: row.event_date,
    title: row.title,
    description: row.description || "",
    menu_summary: row.menu_summary || "",
    regular_price: row.regular_price || "",
    advance_price: row.advance_price,
    total_quantity: row.total_quantity || 0,
    reserved_quantity: row.reserved_quantity || 0,
    purchase_deadline: (row.purchase_deadline || "17:00").slice(0, 5),
    active: row.active !== false,
    auto_activate_on_menu: row.auto_activate_on_menu === true,
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

export function useDinnerEvents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const dinnerEventsQuery = useQuery({
    queryKey: ["dinner_events", RESTAURANT_SLUG],
    queryFn: async () => {
      const restaurantId = await getRestaurantId();
      const { data, error } = await supabase
        .from("dinner_events")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("event_date", { ascending: false });

      if (error) throw error;
      return (data || []).map((event) => mapDinnerEvent(event as DinnerEventRow));
    },
  });

  const addDinnerEventMutation = useMutation({
    mutationFn: async (event: DinnerEventInput) => {
      const restaurantId = await getRestaurantId();
      const { error } = await supabase.from("dinner_events").insert({
        restaurant_id: restaurantId,
        event_date: event.event_date,
        title: event.title,
        description: event.description || null,
        menu_summary: event.menu_summary || null,
        regular_price: event.regular_price || null,
        advance_price: event.advance_price,
        total_quantity: event.total_quantity,
        reserved_quantity: event.reserved_quantity,
        purchase_deadline: event.purchase_deadline,
        active: event.active,
        auto_activate_on_menu: event.auto_activate_on_menu,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dinner_events", RESTAURANT_SLUG] });
      toast({
        title: "Jantar cadastrado",
        description: "A venda antecipada foi salva.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar jantar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addDinnerEventsBulkMutation = useMutation({
    mutationFn: async (events: DinnerEventInput[]) => {
      if (events.length === 0) return 0;

      const restaurantId = await getRestaurantId();
      const rows = events.map((event) => ({
        restaurant_id: restaurantId,
        event_date: event.event_date,
        title: event.title,
        description: event.description || null,
        menu_summary: event.menu_summary || null,
        regular_price: event.regular_price || null,
        advance_price: event.advance_price,
        total_quantity: event.total_quantity,
        reserved_quantity: event.reserved_quantity,
        purchase_deadline: event.purchase_deadline,
        active: event.active,
        auto_activate_on_menu: event.auto_activate_on_menu,
      }));
      const { error } = await supabase.from("dinner_events").insert(rows);

      if (error) throw error;
      return events.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dinner_events", RESTAURANT_SLUG] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar jantares",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDinnerEventMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DinnerEvent> }) => {
      const { error } = await supabase
        .from("dinner_events")
        .update({
          event_date: updates.event_date,
          title: updates.title,
          description: updates.description || null,
          menu_summary: updates.menu_summary || null,
          regular_price: updates.regular_price || null,
          advance_price: updates.advance_price,
          total_quantity: updates.total_quantity,
          reserved_quantity: updates.reserved_quantity,
          purchase_deadline: updates.purchase_deadline,
          active: updates.active,
          auto_activate_on_menu: updates.auto_activate_on_menu,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dinner_events", RESTAURANT_SLUG] });
      toast({
        title: "Jantar atualizado",
        description: "As alteracoes foram salvas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar jantar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDinnerEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dinner_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dinner_events", RESTAURANT_SLUG] });
      toast({
        title: "Jantar removido",
        description: "A venda antecipada foi excluida.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover jantar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    dinnerEvents: dinnerEventsQuery.data ?? [],
    isLoading: dinnerEventsQuery.isLoading,
    addDinnerEvent: addDinnerEventMutation.mutate,
    addDinnerEventsBulk: addDinnerEventsBulkMutation.mutateAsync,
    updateDinnerEvent: (id: string, updates: Partial<DinnerEvent>) =>
      updateDinnerEventMutation.mutate({ id, updates }),
    deleteDinnerEvent: deleteDinnerEventMutation.mutate,
    isAddingDinnerEvent: addDinnerEventMutation.isPending,
    isAddingDinnerEventsBulk: addDinnerEventsBulkMutation.isPending,
    isUpdatingDinnerEvent: updateDinnerEventMutation.isPending,
    isDeletingDinnerEvent: deleteDinnerEventMutation.isPending,
  };
}
