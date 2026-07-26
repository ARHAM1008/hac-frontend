import Navbar from "@/components/Navbar";
import HeroWithAnimation from "@/components/HeroWithAnimation";
import HowItWorks from "@/components/HowItWorks";
import Categories from "@/components/Categories";
import FAQAccordion from "@/components/FAQAccordion";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    // Animated mesh gradient — uses the existing tailwind token + keyframe
    <div className="min-h-screen bg-void bg-mesh-gradient bg-[length:200%_200%] animate-gradient-shift">
      <Navbar />
      <main>
        <HeroWithAnimation />
        <HowItWorks />
        <Categories />
        <FAQAccordion />
      </main>
      <Footer />
    </div>
  );
}
