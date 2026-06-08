import { useSiteConfig } from "@/context/SiteConfigContext";
import { Clock } from "lucide-react";
import { defaultHours } from "@/types";

export function HoursModule() {
  const { config } = useSiteConfig();
  const { hours } = config.modules;

  if (!hours.enabled) return null;

  // Use default items if no items configured, then filter by enabled
  const allItems = hours.items?.length > 0 ? hours.items : defaultHours.items;
  const items = allItems.filter(item => item.enabled);

  // Don't render if no items are enabled
  if (items.length === 0) return null;

  // Dynamic grid columns based on number of items
  const gridCols = items.length === 1 ? "md:grid-cols-1" : items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Horários de Funcionamento
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>
        <div className={`grid gap-6 ${gridCols} max-w-4xl mx-auto`}>
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-xl shadow-card p-6 text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
            >
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {item.label}
              </h3>
              <p className="text-primary font-medium text-xl">
                {item.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
