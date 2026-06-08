import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type WebhookPayload = {
  id?: string;
  type?: string;
  event?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

type DinnerOrder = {
  id: string;
  dinner_event_id: string;
  buyer_name: string;
  buyer_whatsapp: string;
  buyer_email: string | null;
  quantity: number;
  unit_price: string;
  status: string;
  voucher_code: string;
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
}

function extractPayloadInfo(payload: WebhookPayload) {
  const data = asRecord(payload.data) || {};
  const order = asRecord(data.order) || data;
  const charge =
    asRecord(data.charge) ||
    asRecord((order.charges as unknown[])?.[0]) ||
    asRecord(data.last_transaction) ||
    {};

  return {
    eventId: getString(payload.id, data.id),
    eventType: getString(payload.type, payload.event) || "unknown",
    pagarmeOrderId: getString(order.id, data.order_id),
    pagarmeOrderCode: getString(order.code, order.order_code, data.code, data.order_code),
    pagarmeChargeId: getString(charge.id, data.charge_id),
    paymentMethod: getString(charge.payment_method, data.payment_method),
    paymentStatus: getString(order.status, charge.status, data.status),
  };
}

async function releaseReservedQuantity(
  supabase: ReturnType<typeof createClient>,
  order: DinnerOrder,
) {
  const { data: eventRow, error } = await supabase
    .from("dinner_events")
    .select("reserved_quantity")
    .eq("id", order.dinner_event_id)
    .single<{ reserved_quantity: number }>();

  if (error || !eventRow) throw new Error(error?.message || "Jantar nao encontrado para liberar vaga.");

  const { error: updateError } = await supabase
    .from("dinner_events")
    .update({
      reserved_quantity: Math.max(0, eventRow.reserved_quantity - order.quantity),
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.dinner_event_id);

  if (updateError) throw new Error(updateError.message);
}

function moneyToCents(value: string) {
  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const amount = Number(cleaned);

  if (!Number.isFinite(amount) || amount <= 0) return null;

  return Math.round(amount * 100);
}

async function notifyRestaurant(event: string, order: DinnerOrder, info: ReturnType<typeof extractPayloadInfo>) {
  const notificationUrl = Deno.env.get("RESTAURANT_NOTIFY_WEBHOOK_URL");
  if (!notificationUrl) return;

  const total = moneyToCents(order.unit_price);

  try {
    await fetch(notificationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-notification-source": "armecardapio",
      },
      body: JSON.stringify({
        event,
        message: `Pagamento aprovado: ${order.buyer_name} reservou ${order.quantity} jantar(es). Voucher ${order.voucher_code}.`,
        order: {
          id: order.id,
          voucher_code: order.voucher_code,
          buyer_name: order.buyer_name,
          buyer_whatsapp: order.buyer_whatsapp,
          buyer_email: order.buyer_email,
          quantity: order.quantity,
          unit_price: order.unit_price,
          total_cents: total ? total * order.quantity : null,
          status: "paid",
        },
        dinner_event: order.dinner_events,
        pagarme: info,
      }),
    });
  } catch (error) {
    console.error("restaurant notification failed", error);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  try {
    const webhookSecret = Deno.env.get("PAGARME_WEBHOOK_SECRET");
    if (webhookSecret) {
      const receivedSecret = req.headers.get("x-webhook-secret");
      const urlSecret = new URL(req.url).searchParams.get("secret");

      if (receivedSecret !== webhookSecret && urlSecret !== webhookSecret) {
        return jsonResponse({ error: "Webhook nao autorizado." }, 401);
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase URL/service role nao configurados.");
    }

    const payload = await req.json() as WebhookPayload;
    const info = extractPayloadInfo(payload);
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (!info.pagarmeOrderCode && !info.pagarmeOrderId && !info.pagarmeChargeId) {
      throw new Error("Webhook sem identificador de pedido/cobranca.");
    }

    const orderQuery = supabase
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
        dinner_events(title, event_date, purchase_deadline)
      `)
      .limit(1);

    if (info.pagarmeOrderCode) {
      orderQuery.eq("pagarme_order_code", info.pagarmeOrderCode);
    } else if (info.pagarmeChargeId) {
      orderQuery.eq("pagarme_charge_id", info.pagarmeChargeId);
    } else {
      orderQuery.eq("pagarme_response->>id", info.pagarmeOrderId);
    }

    const { data: orders, error: orderError } = await orderQuery;
    if (orderError) throw new Error(orderError.message);

    const order = (orders?.[0] || null) as DinnerOrder | null;
    if (!order) {
      throw new Error(`Pedido local nao encontrado para ${info.pagarmeOrderCode || info.pagarmeOrderId || info.pagarmeChargeId}.`);
    }

    const eventInsert = await supabase
      .from("pagarme_webhook_events")
      .insert({
        event_id: info.eventId,
        event_type: info.eventType,
        pagarme_order_id: info.pagarmeOrderId,
        pagarme_order_code: info.pagarmeOrderCode,
        pagarme_charge_id: info.pagarmeChargeId,
        dinner_order_id: order.id,
        payload,
      })
      .select("id")
      .single<{ id: string }>();

    const webhookEventId = eventInsert.data?.id;

    if (eventInsert.error && eventInsert.error.code !== "23505") {
      throw new Error(eventInsert.error.message);
    }

    const paidEvents = new Set(["order.paid", "charge.paid"]);
    const failedEvents = new Set([
      "order.payment_failed",
      "order.canceled",
      "charge.payment_failed",
      "checkout.canceled",
    ]);

    if (paidEvents.has(info.eventType)) {
      const { error: updateError } = await supabase
        .from("dinner_orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_status: info.paymentStatus || "paid",
          payment_method: info.paymentMethod,
          pagarme_charge_id: info.pagarmeChargeId,
          webhook_last_event: info.eventType,
          webhook_last_payload: payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .in("status", ["pending", "paid"]);

      if (updateError) throw new Error(updateError.message);

      await notifyRestaurant("dinner_order.paid", order, info);
    } else if (failedEvents.has(info.eventType)) {
      if (order.status === "pending") {
        await releaseReservedQuantity(supabase, order);
      }

      const { error: updateError } = await supabase
        .from("dinner_orders")
        .update({
          status: info.eventType.includes("cancel") ? "cancelled" : "expired",
          payment_failed_at: new Date().toISOString(),
          cancelled_at: info.eventType.includes("cancel") ? new Date().toISOString() : null,
          payment_status: info.paymentStatus || "failed",
          payment_method: info.paymentMethod,
          pagarme_charge_id: info.pagarmeChargeId,
          webhook_last_event: info.eventType,
          webhook_last_payload: payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("status", "pending");

      if (updateError) throw new Error(updateError.message);
    } else {
      const { error: updateError } = await supabase
        .from("dinner_orders")
        .update({
          payment_status: info.paymentStatus,
          payment_method: info.paymentMethod,
          pagarme_charge_id: info.pagarmeChargeId,
          webhook_last_event: info.eventType,
          webhook_last_payload: payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) throw new Error(updateError.message);
    }

    if (webhookEventId) {
      await supabase
        .from("pagarme_webhook_events")
        .update({ processed: true })
        .eq("id", webhookEventId);
    }

    return jsonResponse({ received: true, processed: true });
  } catch (error) {
    console.error("pagarme-webhook failed", error);

    return jsonResponse({
      received: true,
      processed: false,
      error: error.message || "Erro inesperado.",
    }, 400);
  }
});
