import Preloader from "@/components/Preloader";
import Hero from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import Marquee from "@/components/home/Marquee";
import Testimonials from "@/components/Testimonials";
import SiteFooter from "@/components/SiteFooter";
import { getReviews } from "@/lib/cms/getContent";

// Re-read reviews at most once a minute so admin edits appear without a
// redeploy (ISR), matching the other pages.
export const revalidate = 60;

export default async function Home() {
  // The home page shows the events reviews (the larger, Google-backed set).
  const reviews = await getReviews("events");

  return (
    <>
      <Preloader />
      <main>
        <Hero />
        <Intro />
        <Marquee />
        <Testimonials
          reviews={reviews}
          googleRating={4.9}
          googleReviewCount={148}
          googleUrl="https://www.google.com/maps?cid=10454241291312957415"
        />
      </main>
      <SiteFooter />
    </>
  );
}
