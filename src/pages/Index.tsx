import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/HeroSection";
import { HomeMenuSection } from "@/components/HomeMenuSection";
import { HomeDinnerSection } from "@/components/HomeDinnerSection";
import { HighlightsModule } from "@/components/HighlightsModule";
import { HoursModule } from "@/components/HoursModule";
import { LocationModule } from "@/components/LocationModule";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HomeMenuSection />
      <HomeDinnerSection />
      <HighlightsModule />
      <HoursModule />
      <LocationModule />
    </Layout>
  );
};

export default Index;
