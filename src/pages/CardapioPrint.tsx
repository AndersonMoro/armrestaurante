import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { formatDateDisplay } from "@/lib/date";
import { ArrowLeft, Printer } from "lucide-react";

const CardapioPrint = () => {
  const { id } = useParams();
  const { menus, config } = useSiteConfig();
  const menu = menus.find((item) => item.id === id);

  useEffect(() => {
    document.title = menu ? `${menu.title} - Impressão` : "Cardápio";
  }, [menu]);

  if (!menu) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-2xl rounded-lg bg-card p-6 shadow-card">
          <h1 className="font-display text-2xl font-bold">Cardápio não encontrado</h1>
          <Button asChild className="mt-6">
            <Link to="/cardapio">Voltar ao cardápio</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40 p-4 text-foreground print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-3 print:hidden">
        <Button asChild variant="outline">
          <Link to="/cardapio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </div>

      <article className="mx-auto max-w-3xl bg-white p-8 shadow-card print:max-w-none print:shadow-none">
        <header className="border-b border-gray-200 pb-6 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-gray-500">{config.brand_name}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-gray-950">{menu.title}</h1>
          <p className="mt-2 text-gray-600">{formatDateDisplay(menu.date)}</p>
          {(menu.price_per_kg || menu.buffet_price) && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {menu.price_per_kg && (
                <div className="rounded border border-gray-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Por kg</p>
                  <p className="font-display text-xl font-bold text-gray-950">{menu.price_per_kg}</p>
                </div>
              )}
              {menu.buffet_price && (
                <div className="rounded border border-gray-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Buffet livre</p>
                  <p className="font-display text-xl font-bold text-gray-950">{menu.buffet_price}</p>
                </div>
              )}
            </div>
          )}
        </header>

        <section className="mt-8 space-y-8">
          {menu.categories?.map((category) => (
            <div key={category.id}>
              <h2 className="border-b border-gray-200 pb-2 font-display text-xl font-semibold text-gray-950">
                {category.name}
              </h2>
              <div className="divide-y divide-gray-100">
                {category.items.filter((item) => item.available).map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 py-4">
                    <div>
                      <h3 className="font-semibold text-gray-950">{item.name}</h3>
                      {item.description && <p className="mt-1 text-sm text-gray-600">{item.description}</p>}
                    </div>
                    {item.price && <p className="font-semibold text-gray-950">{item.price}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {menu.notes && (
          <footer className="mt-8 border-t border-gray-200 pt-4 text-sm text-gray-600">
            {menu.notes}
          </footer>
        )}
      </article>
    </main>
  );
};

export default CardapioPrint;
