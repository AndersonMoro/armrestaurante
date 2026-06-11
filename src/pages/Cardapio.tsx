import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DatePickerCardapio } from "@/components/DatePickerCardapio";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { formatDateDisplay, formatDateStorage, getBrazilTodayDate, getBrazilTodayStorage } from "@/lib/date";
import { FileText, Download, Printer, Calendar, ExternalLink } from "lucide-react";

function getMissingMenuMessage(dateString: string, todayString: string) {
  if (dateString < todayString) {
    return "Esse cardapio ja virou historia... e parece que ninguem guardou a receita desse capitulo.";
  }

  if (dateString > todayString) {
    return "Esse dia ainda esta no forno. Volte mais perto da data para ver o que a cozinha aprontou.";
  }

  const messages = [
    "O chef esqueceu do cardapio? Sera? A cozinha ja deve estar resolvendo isso.",
    "Hoje o cardapio brincou de esconde-esconde. Daqui a pouco ele aparece.",
    "A panela esta no fogo, mas o cardapio ainda nao chegou na mesa.",
    "Parece que o cardapio tirou uns minutinhos de descanso.",
  ];
  const index = dateString.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % messages.length;

  return messages[index];
}

const Cardapio = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getBrazilTodayDate());
  const [activeTab, setActiveTab] = useState("today");
  const { menus, getMenuByDate } = useSiteConfig();

  const todayString = getBrazilTodayStorage();
  const selectedDateString = selectedDate ? formatDateStorage(selectedDate) : "";
  const dateString = activeTab === "today" ? todayString : selectedDateString;
  const selectedMenu = dateString ? getMenuByDate(dateString) : undefined;
  const hasStructuredMenu = !!selectedMenu?.categories?.some((category) => category.items.length > 0);

  // Get last 7 available menus
  const recentMenus = menus
    .filter((m) => m.active)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const handleOpenPDF = () => {
    if (selectedMenu?.pdf_url) {
      window.open(selectedMenu.pdf_url, "_blank");
    }
  };

  const handleDownloadPDF = () => {
    if (selectedMenu?.pdf_url) {
      const link = document.createElement("a");
      link.href = selectedMenu.pdf_url;
      link.download = `cardapio-${dateString}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (selectedMenu?.pdf_url) {
      window.open(selectedMenu.pdf_url, "_blank");
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/80 py-12 md:py-16">
        <div className="container">
          <div className="text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Cardápio do Dia
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Selecione a data para visualizar o cardápio disponível
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            {/* Date Picker Card */}
            <div className="bg-card rounded-xl shadow-card p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <h2 className="font-display text-xl font-semibold">Cardápios por data</h2>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-2">
                  <TabsTrigger value="today">Hoje</TabsTrigger>
                  <TabsTrigger value="search">Consultar data</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="mt-5 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                  Mostrando o cardapio de hoje pelo horario do Brasil: {formatDateDisplay(todayString)}.
                </TabsContent>
                <TabsContent value="search" className="mt-5">
                  <DatePickerCardapio date={selectedDate} onDateChange={setSelectedDate} />
                </TabsContent>
              </Tabs>

              {/* Result */}
              <div className="mt-8">
                {selectedMenu ? (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-display font-semibold text-lg">{selectedMenu.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Cardápio disponível para {formatDateDisplay(selectedMenu.date)}
                    </p>
                    {(selectedMenu.price_per_kg || selectedMenu.buffet_price) && (
                      <div className="mb-6 grid gap-3 sm:grid-cols-2">
                        {selectedMenu.price_per_kg && (
                          <div className="rounded-lg border border-green-700/20 bg-green-700/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Por kg</p>
                            <p className="mt-1 font-display text-xl font-bold text-green-950">
                              {selectedMenu.price_per_kg}
                            </p>
                          </div>
                        )}
                        {selectedMenu.buffet_price && (
                          <div className="rounded-lg border border-red-700/20 bg-red-700/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-800">Buffet livre</p>
                            <p className="mt-1 font-display text-xl font-bold text-red-950">
                              {selectedMenu.buffet_price}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {hasStructuredMenu && (
                      <div className="mb-6 space-y-6">
                        {selectedMenu.categories?.map((category) => (
                          <div key={category.id} className="rounded-lg border border-border bg-background p-4">
                            <h4 className="font-display text-base font-semibold text-primary">{category.name}</h4>
                            <div className="mt-3 divide-y divide-border">
                              {category.items.filter((item) => item.available).map((item) => (
                                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      {item.description && (
                                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                                      )}
                                    </div>
                                    {item.price && (
                                      <p className="whitespace-nowrap text-sm font-semibold text-primary">{item.price}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {selectedMenu.notes && (
                          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">{selectedMenu.notes}</p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      {selectedMenu.pdf_url && (
                        <>
                          <Button onClick={handleOpenPDF} className="flex-1">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Abrir PDF
                          </Button>
                          <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                            <Download className="mr-2 h-4 w-4" />
                            Baixar
                          </Button>
                        </>
                      )}
                      {hasStructuredMenu ? (
                        <Button asChild variant="outline" className="flex-1">
                          <Link to={`/cardapio/${selectedMenu.id}/imprimir`} target="_blank">
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                          </Link>
                        </Button>
                      ) : (
                        <Button onClick={handlePrint} variant="outline" className="flex-1">
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir
                        </Button>
                      )}
                    </div>
                  </div>
                ) : dateString ? (
                  <div className="text-center py-8 animate-fade-in">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">
                      Cardapio nao disponivel
                    </h3>
                    <p className="text-muted-foreground">
                      {getMissingMenuMessage(dateString, todayString)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Data consultada: {formatDateDisplay(dateString)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Recent Menus */}
            {recentMenus.length > 0 && (
              <div className="bg-card rounded-xl shadow-card p-6 md:p-8">
                <h2 className="font-display text-xl font-semibold mb-6">Últimos Cardápios</h2>
                <div className="space-y-3">
                  {recentMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{menu.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateDisplay(menu.date)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          window.open(
                            menu.categories?.length ? `/cardapio/${menu.id}/imprimir` : menu.pdf_url,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cardapio;
