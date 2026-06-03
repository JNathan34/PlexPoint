import Navigation from "@/components/navigation";
import PlexCollectionSection from "@/components/plex-collection-section";
import Footer from "@/components/footer";
import Chatbot from "@/components/chatbot";

export default function MoviesPage() {
  return (
    <div className="min-h-screen text-foreground">
      <Navigation />
      <main>
        <PlexCollectionSection />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
