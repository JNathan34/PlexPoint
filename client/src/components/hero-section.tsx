import { useQuery } from "@tanstack/react-query";
import { Film, Tv, Users, Coffee, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ServerStats } from "@shared/schema";

export default function HeroSection() {
  const { data: serverStats } = useQuery<ServerStats>({
    queryKey: ['/api/server-stats'],
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home" 
      className="hero-section min-h-screen flex items-center relative overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}
      />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Welcome to My <span className="text-primary">Plex Media Server</span> 🎬✨
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Enjoy unlimited entertainment with movies 🍿 and shows 📺 available right at your fingertips. This server is subscription-based, offering different tiers to suit your viewing needs.
              </p>
              <div className="bg-card/50 rounded-lg p-6 border border-border">
                <p className="text-lg font-semibold mb-4">💳 Preferred Payment: Direct Bank Transfer through me (to avoid third-party fees)</p>
                <div className="space-y-2 text-muted-foreground">
                  <p>- Name: Jacob Nathan</p>
                  <p>- Account Number: 58925008</p>
                  <p>- Sort Code: 09-01-28</p>
                </div>
                <p className="text-lg font-semibold mt-4">Join today and start streaming with ease 🚀🔥</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="stats-card">
                <CardContent className="p-4 text-center">
                  <Film className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold" data-testid="movies-count">
                    {serverStats?.totalMovies || '800+'}
                  </div>
                  <p className="text-sm text-muted-foreground">Movies</p>
                </CardContent>
              </Card>
              
              <Card className="stats-card">
                <CardContent className="p-4 text-center">
                  <Tv className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold" data-testid="shows-count">
                    {serverStats?.totalTvShows || '100+'}
                  </div>
                  <p className="text-sm text-muted-foreground">TV Shows</p>
                </CardContent>
              </Card>
              
              <Card className="stats-card">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">24/7</div>
                  <p className="text-sm text-muted-foreground">Access</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg font-semibold"
                onClick={() => scrollToSection('membership')}
                data-testid="view-subscriptions-button"
              >
                <Users className="mr-2 h-5 w-5" />
                View Subscriptions
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => scrollToSection('requests')}
                data-testid="browse-library-button"
              >
                <Library className="mr-2 h-5 w-5" />
                Request Content
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="https://pixabay.com/get/g51446dcced23c673424ac0f58cf8e5e31cc610c75cdecb4b9307cd1906c7e61554adea6933dc2f887c5614e22287c5bb1329aea28f5d5f57fc15ea890e63eed3_1280.jpg" 
                alt="Modern media server setup" 
                className="w-full h-auto rounded-lg"
                data-testid="hero-image"
              />
              <div className="absolute inset-0 bg-black bg-opacity-25 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
