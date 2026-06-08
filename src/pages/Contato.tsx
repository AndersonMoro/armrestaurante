import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { buildWhatsAppUrl } from "@/lib/utils";
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Clock } from "lucide-react";

const Contato = () => {
  const { config } = useSiteConfig();
  const enabledHours = config.modules.hours.enabled
    ? config.modules.hours.items?.filter((item) => item.enabled) ?? []
    : [];

  const handleWhatsApp = () => {
    const message = `Ola! Gostaria de mais informacoes sobre o ${config.brand_name}.`;
    window.open(buildWhatsAppUrl(config.contact.whatsapp, message), "_blank");
  };

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary via-primary to-primary/80 py-12 md:py-16">
        <div className="container">
          <div className="text-center">
            <h1 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Contato
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Entre em contato conosco, teremos prazer em atende-lo
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-card p-6 shadow-card md:p-8">
                <h2 className="mb-6 font-display text-xl font-semibold">Informacoes de Contato</h2>
                <div className="space-y-5">
                  <a href={`tel:${config.contact.phone}`} className="group flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-muted-foreground">{config.contact.phone}</p>
                    </div>
                  </a>

                  <a href={`mailto:${config.contact.email}`} className="group flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">E-mail</p>
                      <p className="text-muted-foreground">{config.contact.email}</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Endereco</p>
                      <p className="text-muted-foreground">{config.contact.address}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="mb-4 font-medium">Redes Sociais</h3>
                  <div className="flex gap-3">
                    {config.contact.instagram && (
                      <a
                        href={`https://instagram.com/${config.contact.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
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
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl bg-card p-6 shadow-card md:p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-xl font-semibold">WhatsApp</h2>
                  </div>
                  <p className="mb-6 text-muted-foreground">
                    Atendimento rapido pelo WhatsApp. Clique no botao abaixo para iniciar uma conversa.
                  </p>
                  <Button onClick={handleWhatsApp} className="w-full bg-green-600 text-white hover:bg-green-700">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chamar no WhatsApp
                  </Button>
                </div>

                {enabledHours.length > 0 && (
                  <div className="rounded-xl bg-card p-6 shadow-card md:p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Clock className="h-5 w-5" />
                      </div>
                      <h2 className="font-display text-xl font-semibold">Horarios</h2>
                    </div>
                    <div className="space-y-3">
                      {enabledHours.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b border-border py-2 last:border-0"
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
