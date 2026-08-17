import Navbar from "@/components/common/Navbar";
import Hero from "@/components/common/Hero";
import Features from "@/components/common/Features";
import HowItWorks from "@/components/common/HowItWorks";
import Footer from "@/components/common/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}