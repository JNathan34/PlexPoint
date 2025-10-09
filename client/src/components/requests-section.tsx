import { Search, Clock, Bell, Star, PlusCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RequestsSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMakeRequest = () => {
    window.open('https://overseerr.movierequest.work/', '_blank');
  };

  return (
    <section id="requests" className="py-20" data-testid="requests-section">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold">Request New Content</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Can't find what you're looking for? Use our integrated Overseerr system to request movies and TV shows.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary rounded-full p-3 flex-shrink-0">
                  <Search className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h5 className="font-bold mb-2">Easy Search</h5>
                  <p className="text-muted-foreground text-sm">
                    Search for any movie or TV show using our intuitive interface
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary rounded-full p-3 flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h5 className="font-bold mb-2">Quick Processing</h5>
                  <p className="text-muted-foreground text-sm">
                    Most requests are fulfilled within 24-48 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary rounded-full p-3 flex-shrink-0">
                  <Bell className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h5 className="font-bold mb-2">Auto Notifications</h5>
                  <p className="text-muted-foreground text-sm">
                    Get notified when your requested content is available
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary rounded-full p-3 flex-shrink-0">
                  <Star className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h5 className="font-bold mb-2">Quality Assured</h5>
                  <p className="text-muted-foreground text-sm">
                    All content is verified for quality before adding
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 px-8"
                onClick={handleMakeRequest}
                data-testid="make-request-button"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Make a Request
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8"
                onClick={() => scrollToSection('tutorials')}
                data-testid="how-it-works-button"
              >
                <HelpCircle className="mr-2 h-5 w-5" />
                How It Works
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Media request interface" 
                className="w-full h-auto rounded-lg"
                data-testid="request-interface-image"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary rounded-full p-6 shadow-2xl">
                  <PlusCircle className="h-12 w-12 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
