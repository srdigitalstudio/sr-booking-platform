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
        <Testimonials />
        <DashboardPreview />
      </main>
    </>
  );
}