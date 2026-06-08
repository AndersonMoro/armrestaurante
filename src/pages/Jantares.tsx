import { useMemo, useState } from "react";
import { CalendarDays, Clock, Ticket, Users } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DinnerEvent, useDinnerEvents } from "@/hooks/useDinnerEvents";
import { useDinnerOrders, DinnerOrderReceipt } from "@/hooks/useDinnerOrders";
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

export default function Jantares() {
  const { dinnerEvents, isLoading } = useDinnerEvents();
  const { createDinnerOrder, isCreatingDinnerOrder } = useDinnerOrders();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
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
        buyerEmail,
        quantity: Number(quantity),
        notes,
      });

      setReceipt(created);
      setBuyerName("");
      setBuyerWhatsapp("");
      setBuyerEmail("");
      setQuantity("1");
      setNotes("");
    } catch {
      // The hook already shows the toast with the provider error.
    }
  };

  return (
    <Layout>
      <section className="bg-primary py-12 text-primary-foreground md:py-16">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/80">
            Compra antecipada
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Jantares especiais</h1>
          <p className="mt-3 max-w-2xl text-primary-foreground/80">
            Reserve seu lugar com valor antecipado e conclua o pagamento pelo Checkout Pagar.me.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container">
          {isLoading ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              Carregando jantares...
            </div>
          ) : availableEvents.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <Ticket className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-3 font-display text-xl font-semibold">Nenhum jantar antecipado disponível</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Assim que a cozinha abrir uma nova data, ela aparece por aqui.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
              <div className="space-y-4">
                {availableEvents.map((event) => {
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
                      className={`w-full rounded-lg border bg-card p-5 text-left shadow-card transition ${
                        selected ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="font-display text-xl font-semibold">{event.title}</h2>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              {formatDateDisplay(event.event_date)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              ate {event.purchase_deadline}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {remaining} disponiveis
                            </span>
                          </div>
                          {event.description && (
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">{event.description}</p>
                          )}
                          {event.menu_summary && (
                            <p className="mt-3 rounded-lg bg-muted p-3 text-sm">{event.menu_summary}</p>
                          )}
                        </div>
                        <div className="sm:text-right">
                          <p className="text-sm text-muted-foreground">Antecipado</p>
                          <p className="font-display text-2xl font-bold text-primary">{event.advance_price}</p>
                          {event.regular_price && (
                            <p className="text-xs text-muted-foreground">No dia: {event.regular_price}</p>
                          )}
                          {(closed || remaining === 0) && (
                            <p className="mt-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                              {remaining === 0 ? "Esgotado" : "Compra encerrada"}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <aside className="rounded-lg border border-border bg-card p-5 shadow-card">
                <h2 className="font-display text-xl font-semibold">Reservar jantar</h2>
                {selectedEvent ? (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedEvent.title} - {formatDateDisplay(selectedEvent.event_date)}
                    </p>

                    {receipt ? (
                      <div className="mt-5 rounded-lg border border-green-700/20 bg-green-700/10 p-4">
                        <p className="text-sm font-semibold text-green-900">Reserva pendente criada</p>
                        <p className="mt-2 font-display text-2xl font-bold text-green-950">
                          {receipt.voucher_code}
                        </p>
                        <p className="mt-2 text-sm text-green-950/80">
                          O voucher so sera liberado apos confirmacao do pagamento.
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
                          <Label htmlFor="buyerName">Nome</Label>
                          <Input
                            id="buyerName"
                            value={buyerName}
                            onChange={(event) => setBuyerName(event.target.value)}
                            required
                            placeholder="Seu nome"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="buyerWhatsapp">WhatsApp</Label>
                          <Input
                            id="buyerWhatsapp"
                            value={buyerWhatsapp}
                            onChange={(event) => setBuyerWhatsapp(event.target.value)}
                            required
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="buyerEmail">E-mail opcional</Label>
                          <Input
                            id="buyerEmail"
                            type="email"
                            value={buyerEmail}
                            onChange={(event) => setBuyerEmail(event.target.value)}
                            placeholder="voce@email.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantidade de pessoas</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={selectedEvent ? remainingQuantity(selectedEvent) : 1}
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Observação opcional</Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Alguma observação para a reserva?"
                            rows={3}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={
                            isCreatingDinnerOrder ||
                            selectedClosed ||
                            selectedRemaining === 0
                          }
                        >
                          {isCreatingDinnerOrder ? "Criando pagamento..." : "Comprar antecipado"}
                        </Button>
                        {disabledReason && (
                          <p className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                            {disabledReason}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          A reserva fica pendente ate o pagamento ser aprovado pelo Pagar.me.
                        </p>
                      </form>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Selecione uma data de jantar.</p>
                )}
              </aside>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
