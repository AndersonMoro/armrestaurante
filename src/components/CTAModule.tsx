import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { FileText, ChevronRight } from "lucide-react";
import { defaultCTA } from "@/types";

export function CTAModule() {
  const { config } = useSiteConfig();
  const { cta } = config.modules;

  if (!cta.enabled) return null;

  // Use defaults if not configured
  const title = cta.title || defaultCTA.title;
  const subtitle = cta.subtitle || defaultCTA.subtitle;
  const buttonText = cta.buttonText || defaultCTA.buttonText;
  const buttonLink = cta.buttonLink || defaultCTA.buttonLink;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary to-primary/80">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-foreground/20 text-primary-foreground mb-6">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            {subtitle}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-background text-primary hover:bg-background/90 font-semibold px-8"
          >
            <Link to={buttonLink}>
              {buttonText}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
