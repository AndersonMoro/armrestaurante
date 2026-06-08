import { useSiteConfig } from "@/context/SiteConfigContext";
import { MapPin, ExternalLink } from "lucide-react";
import { defaultLocation } from "@/types";
import { Button } from "@/components/ui/button";

const extractEmbedUrl = (value: string) => {
  const srcMatch = value.match(/src=["']([^"']+)["']/i);
  if (srcMatch?.[1]) return srcMatch[1].trim();

  const urlMatch = value.match(/https:\/\/(?:www\.)?(?:google\.com\/maps\/embed|maps\.google\.com\/maps)[^\s"']*/i);
  if (urlMatch?.[0]) return urlMatch[0].trim();

  return value.trim().replace(/^["']|["']$/g, "");
};

const isValidEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    return (
      (host === "google.com" && parsed.pathname.startsWith("/maps/embed")) ||
      (host === "maps.google.com" && parsed.pathname.startsWith("/maps"))
    );
  } catch {
    return false;
  }
};

export function LocationModule() {
  const { config } = useSiteConfig();
  const { location } = config.modules;

  if (!location.enabled) return null;

  // Use default address if not configured
  const address = location.address || defaultLocation.address;
  const mapEmbedUrl = location.mapEmbedUrl ? extractEmbedUrl(location.mapEmbedUrl) : "";

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
            <MapPin className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Localização
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl shadow-card p-8 text-center">
            <div className="flex items-center justify-center gap-3 text-lg text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <span>{address}</span>
            </div>
            <div className="mt-6 aspect-video rounded-lg bg-muted overflow-hidden">
              {mapEmbedUrl && isValidEmbedUrl(mapEmbedUrl) ? (
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa de localização"
                />
              ) : mapEmbedUrl ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-primary opacity-70" />
                    <p className="text-muted-foreground mb-4">
                      O link configurado não é um link de embed válido
                    </p>
                    <Button asChild>
                    <a href={mapEmbedUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver no Google Maps
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center p-4">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Configure o link do mapa no painel admin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
