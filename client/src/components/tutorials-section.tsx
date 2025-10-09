import { Download, Smartphone, Monitor, Tv, Phone, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const appStoreLinks = [
  {
    name: "iPhone/iPad",
    icon: Smartphone,
    url: "https://apps.apple.com/app/plex/id383457673",
    platform: "iOS App Store"
  },
  {
    name: "Android",
    icon: Smartphone,
    url: "https://play.google.com/store/apps/details?id=com.plexapp.android",
    platform: "Google Play Store"
  },
  {
    name: "Windows/Mac",
    icon: Monitor,
    url: "",
    platform: "Desktop App"
  },
  {
    name: "Smart TV",
    icon: Tv,
    url: "",
    platform: "TV Apps"
  },
];

export default function TutorialsSection() {
  const handleWhatsApp = () => {
    window.open('https://wa.me/447481861478', '_blank');
  };

  const handleCall = () => {
    window.open('tel:+447481861478', '_blank');
  };

  const handleEmail = () => {
    window.open('mailto:jacobnathan1718@gmail.com', '_blank');
  };

  const handlePlexProfile = () => {
    window.open('https://l.plex.tv/B8NDphP', '_blank');
  };

  return (
    <section id="tutorials" className="py-20 bg-secondary" data-testid="tutorials-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Getting Started</h2>
          <p className="text-xl text-muted-foreground">How to install and setup Plex to access Jacob's server</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Instructions Side */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-6">Step-by-Step Setup Guide</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                      <h4 className="font-semibold mb-2">Download Plex App</h4>
                      <p className="text-muted-foreground text-sm mb-3">Choose your device and download the Plex app:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {appStoreLinks.map((store, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => store.url && window.open(store.url, '_blank')}
                            data-testid={`download-${store.name.toLowerCase().replace('/', '-')}`}
                          >
                            <store.icon className="h-4 w-4 mr-2" />
                            {store.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                      <h4 className="font-semibold mb-2">Create Plex Account</h4>
                      <p className="text-muted-foreground text-sm">Sign up for a free Plex account and complete the setup process.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                    <div>
                      <h4 className="font-semibold mb-2">Add Jacob's Server</h4>
                      <p className="text-muted-foreground text-sm mb-3">Visit Jacob's Plex profile and add him as a friend:</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePlexProfile}
                        data-testid="plex-profile-button"
                      >
                        Visit Plex Profile
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                    <div>
                      <h4 className="font-semibold mb-2">Contact Jacob</h4>
                      <p className="text-muted-foreground text-sm mb-3">Get in touch to activate your server access:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleWhatsApp}
                          data-testid="whatsapp-button"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCall}
                          data-testid="call-button"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEmail}
                          data-testid="email-button"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Accept Server Invitation</h4>
                      <p className="text-muted-foreground text-sm">You'll receive an email saying "JNathan34 has given you access to his server" - click the link to accept and start streaming!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Side */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6">Video Tutorial</h3>
              <div className="aspect-video bg-background rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-4">🎥</div>
                  <div className="text-lg font-medium mb-2">plex.mp4</div>
                  <div className="text-sm">Setup Tutorial Video</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">Need help? Contact Jacob Nathan</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                data-testid="footer-whatsapp-button"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp: 07481 861478
              </Button>
              <Button
                variant="outline"
                onClick={handleCall}
                data-testid="footer-call-button"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call: 07481 861478
              </Button>
              <Button
                variant="outline"
                onClick={handleEmail}
                data-testid="footer-email-button"
              >
                <Mail className="h-4 w-4 mr-2" />
                jacobnathan1718@gmail.com
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
