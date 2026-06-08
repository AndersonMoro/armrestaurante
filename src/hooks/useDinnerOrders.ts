import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CreateDinnerOrderInput {
  dinnerEventId: string;
  buyerName: string;
  buyerWhatsapp: string;
  buyerEmail: string;
  quantity: number;
  notes?: string;
}

export interface DinnerOrderReceipt {
  order_id: string;
  voucher_code: string;
  status: "pending" | "paid" | "cancelled" | "used" | "expired";
  payment_url?: string;
  payment_link_id?: string;
}

async function getFunctionErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: unknown }).context;

    if (context instanceof Response) {
      try {
        const data = await context.clone().json();
        if (data?.error) return String(data.error);
        if (data?.message) return String(data.message);
      } catch {
        const text = await context.clone().text();
        if (text) return text;
      }
    }
  }

  return error instanceof Error ? error.message : "Erro ao criar pagamento.";
}

export function useDinnerOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createOrderMutation = useMutation({
    mutationFn: async (input: CreateDinnerOrderInput) => {
      const { data, error } = await supabase.rpc("create_dinner_order", {
        p_dinner_event_id: input.dinnerEventId,
        p_buyer_name: input.buyerName,
        p_buyer_whatsapp: input.buyerWhatsapp,
        p_buyer_email: input.buyerEmail,
        p_quantity: input.quantity,
        p_notes: input.notes || null,
      });

      if (error) throw error;
      const receipt = data?.[0] as DinnerOrderReceipt;

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "create-pagarme-payment",
        {
          body: { orderId: receipt.order_id },
        }
      );

      if (paymentError) {
        throw new Error(await getFunctionErrorMessage(paymentError));
      }
      if (paymentData?.error) throw new Error(paymentData.error);

      return {
        ...receipt,
        payment_url: paymentData.payment_url,
        payment_link_id: paymentData.payment_link_id,
      } as DinnerOrderReceipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dinner_events"] });
      toast({
        title: "Pagamento criado",
        description: "Acesse o link do Pagar.me para concluir a compra.",
      });
    },
    onError: (error) => {
      toast({
        title: "Nao foi possivel reservar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createDinnerOrder: createOrderMutation.mutateAsync,
    isCreatingDinnerOrder: createOrderMutation.isPending,
  };
}
