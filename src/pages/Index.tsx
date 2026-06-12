import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/HeroSection";
import { HomeMenuSection } from "@/components/HomeMenuSection";
import { HomeDinnerSection } from "@/components/HomeDinnerSection";
import { HighlightsModule } from "@/components/HighlightsModule";
import { HoursModule } from "@/components/HoursModule";
import { LocationModule } from "@/components/LocationModule";
import { AlertTriangle } from "lucide-react";
import { getBrazilTodayStorage } from "@/lib/date";

function DinnerClosedBanner() {
  if (getBrazilTodayStorage() !== "2026-06-12") return null;

  return (
    <section className="border-y border-amber-300/70 bg-amber-50 py-4">
      <div className="container">
        <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-white p-4 text-amber-950 shadow-card sm:flex-row sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">Restaurante Jantar fechado hoje</p>
            <p className="mt-1 text-sm leading-6 text-amber-900/80">
              Hoje, 12/06/2026, o Restaurante Jantar estará fechado. O aviso será removido automaticamente após a meia-noite.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <DinnerClosedBanner />
      <HomeMenuSection />
      <HomeDinnerSection />
      <HighlightsModule />
      <HoursModule />
      <LocationModule />
    </Layout>
  );
};

export default Index;
