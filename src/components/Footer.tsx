import { Link } from "react-router-dom";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { convertGoogleDriveUrl } from "@/lib/utils";
import restaurantLogo from "../../LOGO.png";

export function Footer() {
  const { config } = useSiteConfig();
  const logoSrc = convertGoogleDriveUrl(config.logo_url) || restaurantLogo;

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt={config.brand_name}
                className="h-14 w-auto max-w-[170px] object-contain"
              />
              <span className="font-display font-semibold text-lg">
                {config.brand_name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {config.hero_subtitle}
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold">Navegação</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Início
              </Link>
              <Link to="/cardapio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cardápio
              </Link>
              <Link to="/sobre" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sobre
              </Link>
              <Link to="/contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold">Contato</h3>
            <div className="flex flex-col gap-3">
              <a
                href={`tel:${config.contact.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                {config.contact.phone}
              </a>
              <a
                href={`mailto:${config.contact.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                {config.contact.email}
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{config.contact.address}</span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                {config.contact.instagram && (
                  <a
                    href={`https://instagram.com/${config.contact.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {config.contact.facebook && (
                  <a
                    href={`https://facebook.com/${config.contact.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {config.brand_name}. Todos os direitos reservados.</p>
          <p className="opacity-60">
            Powered by <span className="font-medium">ARMeCardápio</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
