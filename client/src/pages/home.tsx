import { useEffect } from "react";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import PreviewSection from "@/components/preview-section";
import MembershipSection from "@/components/membership-section";
import RequestsSection from "@/components/requests-section";
import TutorialsSection from "@/components/tutorials-section";
import Footer from "@/components/footer";
import Chatbot from "@/components/chatbot";
import { scrollToSection } from "@/lib/constants";

export default function Home() {
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToSection(id));
    });
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      <Navigation />
      <HeroSection />
      <PreviewSection />
      <MembershipSection />
      <RequestsSection />
      <TutorialsSection />
      <Footer />
      <Chatbot />
    </div>
  );
}
