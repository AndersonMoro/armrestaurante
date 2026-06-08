import { useSiteConfig } from "@/context/SiteConfigContext";
import { ModuleCard } from "./ModuleCard";
import { defaultHighlights } from "@/types";

export function HighlightsModule() {
  const { config } = useSiteConfig();
  const { highlights } = config.modules;

  if (!highlights.enabled) return null;

  // Use default items if no items configured, then filter by enabled
  const allItems = highlights.items?.length > 0 ? highlights.items : defaultHighlights.items;
  const items = allItems.filter(item => item.enabled);

  // Don't render if no items are enabled
  if (items.length === 0) return null;

  // Dynamic grid columns based on number of items
  const gridCols = items.length === 1 ? "md:grid-cols-1" : items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nossas Refeições
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
        </div>
        <div className={`grid gap-6 ${gridCols} max-w-4xl mx-auto`}>
          {items.map((item, index) => (
            <ModuleCard
              key={index}
              title={item.title}
              description={item.description}
              icon={item.icon}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
