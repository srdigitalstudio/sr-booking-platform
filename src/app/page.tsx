import { DashboardPreview } from "@/components/home/DashboardPreview";
import { Testimonials } from "@/components/home/testimonials";
import { Features } from "@/components/common/Features";
import { Hero } from "@/components/common/Hero";
import { Header } from "@/components/layout/Header";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <DashboardPreview />
      <Features />
      <Testimonials />
    </>
  );
}