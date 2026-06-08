import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Clock } from "lucide-react";

const Contato = () => {
  const { config } = useSiteConfig();
  const enabledHours = config.modules.hours.enabled
    ? config.modules.hours.items?.filter((item) => item.enabled) ?? []
    : [];

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Olá! Gostaria de mais informações sobre o ${config.brand_name}.`);
    window.open(`https://wa.me/${config.contact.whatsapp}?text=${message}`, "_blank");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/80 py-12 md:py-16">
        <div className="container">
          <div className="text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Contato
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Entre em contato conosco, teremos prazer em atendê-lo
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Contact Info */}
              <div className="bg-card rounded-xl shadow-card p-6 md:p-8">
                <h2 className="font-display text-xl font-semibold mb-6">Informações de Contato</h2>
                <div className="space-y-5">
                  <a
                    href={`tel:${config.contact.phone}`}
                    className="flex items-start gap-4 group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-muted-foreground">{config.contact.phone}</p>
                    </div>
                  </a>
                  <a
                    href={`mailto:${config.contact.email}`}
                    className="flex items-start gap-4 group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">E-mail</p>
                      <p className="text-muted-foreground">{config.contact.email}</p>
                    </div>
                  </a>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-muted-foreground">{config.contact.address}</p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="font-medium mb-4">Redes Sociais</h3>
                  <div className="flex gap-3">
                    {config.contact.instagram && (
                      <a
                        href={`https://instagram.com/${config.contact.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
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
                        className="h-10 w-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA & Hours */}
              <div className="space-y-6">
                {/* WhatsApp */}
                <div className="bg-card rounded-xl shadow-card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">WhatsApp</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Atendimento rápido pelo WhatsApp. Clique no botão abaixo para iniciar uma conversa.
                  </p>
                  <Button
                    onClick={handleWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chamar no WhatsApp
                  </Button>
                </div>

                {enabledHours.length > 0 && (
                <div className="bg-card rounded-xl shadow-card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">Horários</h2>
                  </div>
                  <div className="space-y-3">
                    {enabledHours.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-border last:border-0"
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contato;
