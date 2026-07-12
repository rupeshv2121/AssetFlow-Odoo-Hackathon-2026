import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import FeatureBand from "@/components/FeatureBand";
import SolutionsGrid from "@/components/SolutionsGrid";
import Workflow from "@/components/Workflow";
import Modules from "@/components/Modules";
import Stats from "@/components/Stats";
import WhyAssetFlow from "@/components/WhyAssetFlow";
import Resources from "@/components/Resources";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavBar />
      <Hero />
      <FeatureBand />

      <main className="mx-auto max-w-7xl px-6 pb-24">
        <section className="mt-20">
          <SolutionsGrid />
        </section>

        <section className="mt-20">
          <Workflow />
        </section>

        <section id="modules" className="mt-20">
          <Modules />
        </section>

        <section className="mt-20">
          <Stats />
        </section>

        <section className="mt-20">
          <WhyAssetFlow />
        </section>

        <section className="mt-20">
          <Resources />
        </section>
      </main>

      <Footer />
    </div>
  );
}
