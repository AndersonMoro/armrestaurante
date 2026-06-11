import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatDateDisplay, getBrazilTodayStorage } from "@/lib/date";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Download, ExternalLink, FileText, Printer } from "lucide-react";
import matriarcaImage from "../../Gemini_Generated_Image_.png";

function isMainDishCategory(name: string) {
  const normalized = name.toLowerCase();
  return normalized.includes("principal") || normalized.includes("prato") || normalized.includes("quente");
}

function getMissingMenuMessage(dateString: string) {
  const messages = [
    "O chef esqueceu do cardapio? Sera? A cozinha ja deve estar resolvendo isso.",
    "Hoje o cardapio brincou de esconde-esconde. Daqui a pouco ele aparece.",
    "A panela esta no fogo, mas o cardapio ainda nao chegou na mesa.",
    "Parece que o cardapio tirou uns minutinhos de descanso.",
  ];
  const index = dateString.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % messages.length;

  return messages[index];
}

export function HomeMenuSection() {
  const { menus, getMenuByDate, isMenusLoading } = useSiteConfig();
  const todayString = getBrazilTodayStorage();
  const menu = getMenuByDate(todayString);
  const hasOtherMenus = menus.some((menuItem) => menuItem.active && menuItem.date !== todayString);
  const hasStructuredMenu = !!menu?.categories?.some((category) =>
    category.items.some((item) => item.available)
  );

  const handleDownloadPDF = () => {
    if (!menu?.pdf_url) return;

    const link = document.createElement("a");
    link.href = menu.pdf_url;
    link.download = `cardapio-${menu.date}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="cardapio-dia" className="bg-background py-8 md:py-10">
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
          <aside className="rounded-lg border border-border bg-card p-5 shadow-card">
            <div className="mx-auto mb-5 h-32 w-32 rounded-full border-4 border-background bg-secondary p-1 shadow-lg ring-2 ring-primary/20">
              <div className="h-full w-full overflow-hidden rounded-full">
                <img
                  src={matriarcaImage}
                  alt="Matriarca do restaurante"
                  className="h-full w-full object-cover object-[center_18%]"
                />
              </div>
            </div>
            <div className="space-y-3 text-center">
              <p className="text-sm font-medium uppercase tracking-wide text-primary">Receitas da matriarca</p>
              <h2 className="font-display text-2xl font-bold">Comida de verdade, feita todos os dias.</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                O cardápio muda conforme a cozinha, os ingredientes e o melhor do dia. A essência fica:
                sabor caseiro, cuidado no preparo e aquele jeito de mesa cheia.
              </p>
              <div className="mx-auto mt-4 flex max-w-[180px] overflow-hidden rounded-full border border-border text-xs font-semibold">
                <span className="flex-1 bg-green-700 px-3 py-2 text-white">origem</span>
                <span className="flex-1 bg-background px-3 py-2 text-foreground">família</span>
                <span className="flex-1 bg-red-700 px-3 py-2 text-white">sabor</span>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-primary">
                  Cardapio de hoje
                </p>
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  {menu?.title || "Cardapio em breve"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {menu
                    ? formatDateDisplay(menu.date)
                    : getMissingMenuMessage(todayString)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {hasOtherMenus && (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/cardapio">Consultar datas</Link>
                  </Button>
                )}
                {menu && (
                  <>
                  {menu.pdf_url && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => window.open(menu.pdf_url, "_blank")}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDownloadPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                    </>
                  )}
                  {hasStructuredMenu && (
                    <Button asChild size="sm">
                      <Link to={`/cardapio/${menu.id}/imprimir`} target="_blank">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                      </Link>
                    </Button>
                  )}
                  </>
                )}
              </div>
            </div>

            {menu && (menu.price_per_kg || menu.buffet_price) && (
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                {menu.price_per_kg && (
                  <div className="rounded-lg border border-green-700/20 bg-green-700/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Restaurante por kg</p>
                    <p className="mt-1 font-display text-2xl font-bold text-green-950">{menu.price_per_kg}</p>
                  </div>
                )}
                {menu.buffet_price && (
                  <div className="rounded-lg border border-red-700/20 bg-red-700/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-800">Buffet livre</p>
                    <p className="mt-1 font-display text-2xl font-bold text-red-950">{menu.buffet_price}</p>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-border bg-card p-4 shadow-card md:p-6">
              {isMenusLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Carregando cardápio...</div>
              ) : menu && hasStructuredMenu ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {menu.categories?.map((category) => {
                    const items = category.items.filter((item) => item.available);
                    if (items.length === 0) return null;

                    return (
                      <div
                        key={category.id}
                        className={
                          isMainDishCategory(category.name)
                            ? "rounded-lg border border-primary/25 bg-primary/5 p-4 md:col-span-2"
                            : "rounded-lg bg-background p-4"
                        }
                      >
                        <div className="flex items-center gap-2">
                          {isMainDishCategory(category.name) && (
                            <span className="rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                              destaque
                            </span>
                          )}
                          <h3 className="font-display text-lg font-semibold text-primary">{category.name}</h3>
                        </div>
                        <div className="mt-3 divide-y divide-border">
                          {items.map((item) => (
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
                    );
                  })}
                </div>
              ) : menu?.pdf_url ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <FileText className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="font-display text-xl font-semibold">{menu.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">O cardápio está disponível em PDF.</p>
                  </div>
                  <Button onClick={() => window.open(menu.pdf_url, "_blank")}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir PDF
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <FileText className="h-10 w-10 text-primary" />
                  <h3 className="font-display text-xl font-semibold">Sem cardapio para hoje</h3>
                  <p className="max-w-md text-sm text-muted-foreground">
                    {getMissingMenuMessage(todayString)}
                  </p>
                  {hasOtherMenus && (
                    <Button asChild variant="outline">
                      <Link to="/cardapio">Ver cardápios de outras datas</Link>
                    </Button>
                  )}
                </div>
              )}

              {menu?.notes && (
                <p className="mt-5 rounded-lg bg-muted p-3 text-sm text-muted-foreground">{menu.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
