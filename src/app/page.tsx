import { CallToAction } from "@/components/home/CallToAction";
import { Faq } from "@/components/home/Faq";
import { Pricing } from "@/components/home/Pricing";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/common/Hero";
import { Features } from "@/components/common/Features";
import { Testimonials } from "@/components/home/Testimonials";
import { DashboardPreview } from "@/components/home/DashboardPreview";

export default function HomePage() {
  return (
    <>
  <Header />

  <main>
    <Hero />
    <Features />
    <DashboardPreview />
    <Testimonials />
    <Pricing />
    <Faq />
  </main>
<CallToAction />
  <Footer />
</>
  );
}