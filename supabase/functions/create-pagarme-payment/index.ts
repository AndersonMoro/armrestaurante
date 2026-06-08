import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type DinnerOrderRow = {
  id: string;
  dinner_event_id: string;
  buyer_name: string;
  buyer_whatsapp: string;
  buyer_email: string | null;
  quantity: number;
  unit_price: string;
  status: string;
  voucher_code: string;
  pagarme_payment_url: string | null;
  dinner_events: {
    title: string;
    event_date: string;
    purchase_deadline: string;
  };
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function moneyToCents(value: string) {
  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const amount = Number(cleaned);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Valor antecipado invalido para criar pagamento.");
  }

  return Math.round(amount * 100);
}

function minutesUntilPaymentDeadline(eventDate: string, deadline: string) {
  const now = new Date();
  const deadlineDate = new Date(`${eventDate}T${deadline || "17:00"}:00-03:00`);
  const diff = Math.floor((deadlineDate.getTime() - now.getTime()) / 60000);

  return Math.max(10, Math.min(diff > 0 ? diff : 10, 1440));
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

Deno.serve(async (req) => {
  let orderForCleanup: DinnerOrderRow | null = null;

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  try {
    const pagarmeSecretKey = Deno.env.get("PAGARME_SECRET_KEY");
    const pagarmeApiBase = Deno.env.get("PAGARME_API_BASE") || "https://api.pagar.me/core/v5";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!pagarmeSecretKey) {
      throw new Error("Configure PAGARME_SECRET_KEY nos secrets da Edge Function.");
    }

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase URL/service role nao configurados.");
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return jsonResponse({ error: "orderId e obrigatorio." }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: order, error: orderError } = await supabase
      .from("dinner_orders")
      .select(`
        id,
        dinner_event_id,
        buyer_name,
        buyer_whatsapp,
        buyer_email,
        quantity,
        unit_price,
        status,
        voucher_code,
        pagarme_payment_url,
        dinner_events(title, event_date, purchase_deadline)
      `)
      .eq("id", orderId)
      .single<DinnerOrderRow>();

    if (orderError || !order) {
      throw new Error(orderError?.message || "Pedido nao encontrado.");
    }

    orderForCleanup = order;

    if (order.status !== "pending") {
      throw new Error("Somente pedidos pendentes podem gerar pagamento.");
    }

    if (order.pagarme_payment_url) {
      return jsonResponse({
        payment_url: order.pagarme_payment_url,
        order_id: order.id,
        voucher_code: order.voucher_code,
      });
    }

    const unitAmount = moneyToCents(order.unit_price);
    const total = unitAmount * order.quantity;
    const orderCode = `DIN-${order.id.slice(0, 8)}`;
    const expiresIn = minutesUntilPaymentDeadline(
      order.dinner_events.event_date,
      order.dinner_events.purchase_deadline
    );

    const paymentLinkPayload = {
      is_building: false,
      name: `Jantar ${order.dinner_events.title}`,
      order_code: orderCode,
      type: "order",
      expires_in: expiresIn,
      max_paid_sessions: 1,
      max_sessions: 1,
      payment_settings: {
        accepted_payment_methods: ["credit_card"],
        credit_card_settings: {
          operation_type: "auth_and_capture",
          installments: [
            {
              number: 1,
              total,
            },
          ],
        },
      },
      cart_settings: {
        items: [
          {
            amount: unitAmount,
            name: order.dinner_events.title,
            description: `Voucher ${order.voucher_code}`,
            default_quantity: order.quantity,
          },
        ],
      },
    };

    const pagarmeResponse = await fetch(`${pagarmeApiBase}/paymentlinks`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "armecardapio/1.0",
        Authorization: `Basic ${btoa(`${pagarmeSecretKey}:`)}`,
      },
      body: JSON.stringify(paymentLinkPayload),
    });

    const pagarmeData = await readJsonResponse(pagarmeResponse);

    if (!pagarmeResponse.ok) {
      console.error("Pagar.me error", pagarmeData);
      const details =
        pagarmeData?.message ||
        pagarmeData?.error ||
        pagarmeData?.raw ||
        pagarmeResponse.statusText ||
        "sem detalhe retornado";

      throw new Error(`Pagar.me retornou ${pagarmeResponse.status}: ${details}`);
    }

    if (!pagarmeData) {
      throw new Error(`Pagar.me retornou ${pagarmeResponse.status}, mas sem corpo de resposta.`);
    }

    const paymentUrl = pagarmeData.url;
    if (!paymentUrl) {
      throw new Error("Pagar.me nao retornou URL de pagamento.");
    }

    const { error: updateError } = await supabase
      .from("dinner_orders")
      .update({
        payment_provider: "pagarme",
        pagarme_payment_link_id: pagarmeData.id || null,
        pagarme_payment_url: paymentUrl,
        pagarme_order_code: orderCode,
        pagarme_response: pagarmeData,
      })
      .eq("id", order.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return jsonResponse({
      payment_url: paymentUrl,
      payment_link_id: pagarmeData.id,
      order_id: order.id,
      voucher_code: order.voucher_code,
    });
  } catch (error) {
    console.error("create-pagarme-payment failed", error);

    if (orderForCleanup?.status === "pending" && !orderForCleanup.pagarme_payment_url) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (supabaseUrl && serviceRoleKey) {
          const supabase = createClient(supabaseUrl, serviceRoleKey);

          const { data: eventRow } = await supabase
            .from("dinner_events")
            .select("reserved_quantity")
            .eq("id", orderForCleanup.dinner_event_id)
            .single<{ reserved_quantity: number }>();

          await supabase
            .from("dinner_orders")
            .update({ status: "cancelled" })
            .eq("id", orderForCleanup.id)
            .eq("status", "pending");

          if (eventRow) {
            await supabase
              .from("dinner_events")
              .update({
                reserved_quantity: Math.max(0, eventRow.reserved_quantity - orderForCleanup.quantity),
              })
              .eq("id", orderForCleanup.dinner_event_id);
          }
        }
      } catch (cleanupError) {
        console.error("create-pagarme-payment cleanup failed", cleanupError);
      }
    }

    return jsonResponse({ error: error.message || "Erro inesperado." }, 400);
  }
});
