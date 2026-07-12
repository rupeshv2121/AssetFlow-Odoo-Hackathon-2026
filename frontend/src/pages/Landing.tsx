import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Workflow from "@/components/Workflow";
import Modules from "@/components/Modules";
import Stats from "@/components/Stats";
import WhyAssetFlow from "@/components/WhyAssetFlow";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <NavBar />

      <main className="mx-auto max-w-7xl px-6 pb-24">
        <Hero />

        <section className="mt-16">
          <Features />
        </section>

        <section className="mt-20">
          <Workflow />
        </section>

        <section className="mt-20">
          <Modules />
        </section>

        <section className="mt-20">
          <Stats />
        </section>

        <section className="mt-20">
          <WhyAssetFlow />
        </section>
      </main>

      <Footer />
    </div>
  );
}
