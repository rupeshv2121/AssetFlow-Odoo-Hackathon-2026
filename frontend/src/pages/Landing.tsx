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
      <section id="modules" className="mt-25">
        <Modules />
      </section>

      <main className="max-w-7xl px-6 flex flex-col gap-6 mx-auto">
        <section id="workflow" className="mt-20">
          <Workflow />
        </section>

        <section className="mt-20">
          <Stats />
        </section>

        <section id="assetflow" className="mt-20">
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
