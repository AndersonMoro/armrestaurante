import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Coffee, UtensilsCrossed, Moon, Sunrise, Sun, Sunset, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  coffee: Coffee,
  utensils: UtensilsCrossed,
  moon: Moon,
  sunrise: Sunrise,
  sun: Sun,
  sunset: Sunset,
};

interface ModuleCardProps {
  title: string;
  description?: string;
  icon?: string;
  className?: string;
  children?: ReactNode;
  variant?: "default" | "highlight" | "outline";
  style?: CSSProperties;
}

export function ModuleCard({
  title,
  description,
  icon,
  className,
  children,
  variant = "default",
  style,
}: ModuleCardProps) {
  const IconComponent = icon ? iconMap[icon] : null;

  return (
    <div
      className={cn(
        "group rounded-xl p-6 transition-all duration-300",
        variant === "default" && "bg-card shadow-card hover:shadow-card-hover",
        variant === "highlight" && "bg-primary text-primary-foreground",
        variant === "outline" && "border-2 border-border hover:border-primary/50",
        className
      )}
      style={style}
    >
      {IconComponent && (
        <div
          className={cn(
            "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
            variant === "default" && "bg-secondary text-secondary-foreground",
            variant === "highlight" && "bg-primary-foreground/20 text-primary-foreground",
            variant === "outline" && "bg-secondary text-secondary-foreground"
          )}
        >
          <IconComponent className="h-6 w-6" />
        </div>
      )}
      <h3
        className={cn(
          "font-display font-semibold text-lg mb-2",
          variant === "highlight" ? "text-primary-foreground" : "text-card-foreground"
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "text-sm",
            variant === "highlight" ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
