import HeroPreloader from "@/components/HeroPreloader";
import AboutSection from "@/components/AboutSection";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings, footerPropsFromSettings } from "@/lib/cms/getContent";

export const revalidate = 60;

export default async function Home() {
  const settings = await getSiteSettings();
  return (
    <>
      <main style={{ position: "relative", zIndex: 1 }}>
        <HeroPreloader />
        <AboutSection />
      </main>
      <SiteFooter {...footerPropsFromSettings(settings)} />
    </>
  );
}
