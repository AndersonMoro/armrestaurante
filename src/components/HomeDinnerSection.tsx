import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, CreditCard, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DinnerEvent, useDinnerEvents } from "@/hooks/useDinnerEvents";
import { DinnerOrderReceipt, useDinnerOrders } from "@/hooks/useDinnerOrders";
import { formatDateDisplay, getBrazilTimeStorage, getBrazilTodayStorage } from "@/lib/date";

function isPurchaseClosed(event: DinnerEvent) {
  const today = getBrazilTodayStorage();
  const nowTime = getBrazilTimeStorage();

  if (event.event_date < today) return true;
  if (event.event_date === today && nowTime > event.purchase_deadline) return true;

  return false;
}

function remainingQuantity(event: DinnerEvent) {
  return Math.max(0, event.total_quantity - event.reserved_quantity);
}

export function HomeDinnerSection() {
  const { dinnerEvents, isLoading } = useDinnerEvents();
  const { createDinnerOrder, isCreatingDinnerOrder } = useDinnerOrders();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [receipt, setReceipt] = useState<DinnerOrderReceipt | null>(null);

  const availableEvents = useMemo(
    () =>
      dinnerEvents
        .filter((event) => event.active && event.event_date >= getBrazilTodayStorage())
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
    [dinnerEvents]
  );

  const selectedEvent = availableEvents.find((event) => event.id === selectedEventId) || availableEvents[0];
  const selectedRemaining = selectedEvent ? remainingQuantity(selectedEvent) : 0;
  const selectedClosed = selectedEvent ? isPurchaseClosed(selectedEvent) : false;
  const disabledReason = selectedClosed
    ? "Compra encerrada para esta data."
    : selectedRemaining === 0
      ? "Vagas esgotadas para esta data."
      : "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEvent) return;

    try {
      const created = await createDinnerOrder({
        dinnerEventId: selectedEvent.id,
        buyerName,
        buyerWhatsapp,
        buyerEmail: "",
        quantity: Number(quantity),
        notes: "Compra iniciada pela tela principal.",
      });

      setReceipt(created);
      setBuyerName("");
      setBuyerWhatsapp("");
      setQuantity("1");
    } catch {
      // The hook already shows the toast with the provider error.
    }
  };

  return (
    <section id="compra-antecipada" className="border-y border-primary/15 bg-primary/5 py-8 md:py-10">
      <div className="container">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Compra antecipada</p>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Reserve antes e ganhe desconto</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Algumas datas têm vagas limitadas com preço antecipado. Comprou no site, chegou com o voucher.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full md:w-auto">
            <Link to="/jantares">Ver todas as datas</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Carregando compras antecipadas...
          </div>
        ) : availableEvents.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <Ticket className="mx-auto h-9 w-9 text-primary" />
            <h3 className="mt-3 font-display text-xl font-semibold">Nenhum jantar antecipado aberto agora</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Quando uma nova data for liberada, ela aparece aqui na tela principal.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
            <div className="grid gap-4 md:grid-cols-2">
              {availableEvents.slice(0, 4).map((event) => {
                const remaining = remainingQuantity(event);
                const closed = isPurchaseClosed(event);
                const selected = selectedEvent?.id === event.id;

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => {
                      setSelectedEventId(event.id);
                      setReceipt(null);
                    }}
                    className={`rounded-lg border bg-card p-5 text-left shadow-card transition ${
                      selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl font-semibold">{event.title}</h3>
                        <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          {formatDateDisplay(event.event_date)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-primary px-3 py-2 text-right text-primary-foreground">
                        <p className="text-[11px] font-semibold uppercase">antecipado</p>
                        <p className="font-display text-xl font-bold">{event.advance_price}</p>
                      </div>
                    </div>

                    {event.description && (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{event.description}</p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                        <Clock className="h-3.5 w-3.5" />
                        ate {event.purchase_deadline}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
                        <Users className="h-3.5 w-3.5" />
                        {remaining} vagas
                      </span>
                      {(closed || remaining === 0) && (
                        <span className="rounded-full bg-destructive/10 px-3 py-1 text-destructive">
                          {remaining === 0 ? "Esgotado" : "Encerrado"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <aside className="rounded-lg border border-primary/20 bg-card p-5 shadow-card">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-semibold">Comprar agora</h3>
              </div>

              {selectedEvent ? (
                <>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedEvent.title} - {formatDateDisplay(selectedEvent.event_date)}
                  </p>
                  {selectedEvent.regular_price && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      No dia: {selectedEvent.regular_price}. Antecipado:{" "}
                      <span className="font-semibold text-primary">{selectedEvent.advance_price}</span>
                    </p>
                  )}

                  {receipt ? (
                    <div className="mt-5 rounded-lg border border-green-700/20 bg-green-700/10 p-4">
                      <p className="text-sm font-semibold text-green-950">Reserva pendente criada</p>
                      <p className="mt-2 font-display text-2xl font-bold text-green-950">{receipt.voucher_code}</p>
                      <p className="mt-2 text-sm text-green-950/80">
                        O voucher final sera liberado depois da confirmacao do pagamento.
                      </p>
                      {receipt.payment_url && (
                        <Button asChild className="mt-4 w-full">
                          <a href={receipt.payment_url} target="_blank" rel="noopener noreferrer">
                            Ir para pagamento
                          </a>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="homeBuyerName">Nome</Label>
                        <Input
                          id="homeBuyerName"
                          value={buyerName}
                          onChange={(event) => setBuyerName(event.target.value)}
                          placeholder="Seu nome"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="homeBuyerWhatsapp">WhatsApp</Label>
                        <Input
                          id="homeBuyerWhatsapp"
                          value={buyerWhatsapp}
                          onChange={(event) => setBuyerWhatsapp(event.target.value)}
                          placeholder="(00) 00000-0000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="homeDinnerQuantity">Quantidade</Label>
                        <Input
                          id="homeDinnerQuantity"
                          type="number"
                          min="1"
                          max={selectedRemaining || 1}
                          value={quantity}
                          onChange={(event) => setQuantity(event.target.value)}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isCreatingDinnerOrder || selectedClosed || selectedRemaining === 0}
                      >
                        {isCreatingDinnerOrder ? "Criando pagamento..." : "Comprar antecipado"}
                      </Button>
                      {disabledReason && (
                        <p className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                          {disabledReason}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Pagamento pelo Pagar.me. A reserva fica pendente ate aprovar.
                      </p>
                    </form>
                  )}
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Selecione uma data para comprar.</p>
              )}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
