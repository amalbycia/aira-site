import HeroPreloader from "@/components/HeroPreloader";
import AboutSection from "@/components/AboutSection";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <main style={{ position: "relative", zIndex: 1 }}>
        <HeroPreloader />
        <AboutSection />
        <div
          id="footer-reveal-spacer"
          style={{ height: "100vh" }}
          aria-hidden="true"
        />
      </main>
      <SiteFooter />
    </>
  );
}
