import { Layout } from "@/components/Layout";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Heart, ChefHat } from "lucide-react";
import { convertGoogleDriveUrl } from "@/lib/utils";

const Sobre = () => {
  const { config } = useSiteConfig();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/80 py-12 md:py-16">
        <div className="container">
          <div className="text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Sobre Nós
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Conheça nossa história e nossa paixão pela gastronomia
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Main About */}
            <div className="bg-card rounded-xl shadow-card p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Heart className="h-5 w-5" />
                </div>
                <h2 className="font-display text-xl font-semibold">Nossa História</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {config.about_text}
              </p>
              {config.about_image && (
                <div className="mt-6 rounded-lg overflow-hidden">
                  <img
                    src={convertGoogleDriveUrl(config.about_image) || ""}
                    alt="Sobre nós"
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Our Kitchen */}
            <div className="bg-card rounded-xl shadow-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                  <ChefHat className="h-5 w-5" />
                </div>
                <h2 className="font-display text-xl font-semibold">Nossa Cozinha</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {config.kitchen_text}
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {config.stats.map((stat, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="font-display text-3xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Sobre;
