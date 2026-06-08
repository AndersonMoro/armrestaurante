import { Gift, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { convertGoogleDriveUrl } from "@/lib/utils";
import restaurantLogoWhite from "../../LOGO_BRANCA.png";

export function HeroSection() {
  const { config } = useSiteConfig();
  const logoSrc = convertGoogleDriveUrl(config.logo_url) || restaurantLogoWhite;

  return (
    <>
      <section className="relative overflow-hidden py-4 md:py-5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/lovable-uploads/3f9900cb-788e-435f-ba69-49e8dc9700e7.png')" }}
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="container relative z-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="mb-0 flex h-24 max-w-[72vw] items-center justify-center overflow-hidden md:h-28">
              <img
                src={logoSrc}
                alt={config.brand_name}
                className="h-auto w-[220px] max-w-full object-contain drop-shadow-[0_8px_22px_rgba(0,0,0,0.55)] md:w-[300px]"
              />
            </div>

            <p className="-mt-3 max-w-2xl font-display text-base font-semibold text-primary-foreground drop-shadow md:-mt-4 md:text-xl">
              Restaurante com sabor de tradicao.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="border-y border-primary/15 bg-primary/5 py-4">
        <div className="container">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-lg bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Gift className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Compra antecipada</p>
                <p className="font-display text-lg font-semibold leading-tight">Ganhe desconto reservando pelo site</p>
                <p className="text-sm text-muted-foreground">Vagas limitadas nas datas disponiveis.</p>
              </div>
            </div>

            <Button asChild className="w-full flex-shrink-0 sm:w-auto">
              <a href="#compra-antecipada">
                <Ticket className="mr-2 h-4 w-4" />
                Ganhe desconto
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
