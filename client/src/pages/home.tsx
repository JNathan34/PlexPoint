import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import MembershipSection from "@/components/membership-section";
import RequestsSection from "@/components/requests-section";
import TutorialsSection from "@/components/tutorials-section";
import FaqSection from "@/components/faq-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <MembershipSection />
      <RequestsSection />
      <TutorialsSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
