import { Smartphone, Monitor, Tv, Phone, MessageCircle, Mail, BookOpen, ExternalLink, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

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
    url: "https://www.plex.tv/media-server-downloads/#plex-app",
    platform: "Desktop App"
  },
  {
    name: "Smart TV",
    icon: Tv,
    url: "https://www.plex.tv/apps-devices/",
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
    <section id="tutorials" className="py-10 md:py-24 bg-secondary/30 relative overflow-hidden" data-testid="tutorials-section">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] md:w-[800px] h-[200px] md:h-[400px] rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass text-xs md:text-sm font-medium mb-4 md:mb-6"
          >
            <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            <span>Setup Guide</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
            Getting <span className="text-gradient">Started</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Follow these steps to get access to Jacob's Plex server
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card">
              <CardContent className="p-4 md:p-8">
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">1</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Download the Plex App</h4>
                      <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
                        First, download the Plex app on your device. Plex is available on phones, tablets, computers, smart TVs, and streaming devices.
                      </p>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        {appStoreLinks.map((store, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="justify-start glass hover:border-primary/50 active:bg-primary/20 min-h-[40px] text-xs md:text-sm px-2 md:px-3"
                            onClick={() => store.url && window.open(store.url, '_blank')}
                            data-testid={`download-${store.name.toLowerCase().replace('/', '-')}`}
                          >
                            <store.icon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-primary flex-shrink-0" />
                            <span className="truncate">{store.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Create a Free Plex Account</h4>
                      <p className="text-muted-foreground text-xs md:text-sm mb-2">
                        Open the Plex app and create a free account. You can sign up with your email address or use Google/Apple sign-in.
                      </p>
                      <ul className="text-muted-foreground text-xs md:text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>Use a valid email address you can access</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>Remember your username - you'll need it later</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>Complete the initial setup wizard</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Send Jacob a Friend Request on Plex</h4>
                      <p className="text-muted-foreground text-xs md:text-sm mb-3">
                        Click the button below to visit Jacob's Plex profile page. On the profile page, click the <strong>"Add Friend"</strong> button.
                      </p>
                      <div className="glass rounded-xl p-3 mb-3 border border-amber-500/30 bg-amber-500/5">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs md:text-sm text-amber-200">
                            <strong>Important:</strong> Make sure you click <strong>"Add Friend"</strong> not "Follow". You need to send a friend request for server access to work.
                          </p>
                        </div>
                      </div>
                      <Button
                        className="btn-primary-gradient min-h-[44px] text-xs md:text-sm"
                        onClick={handlePlexProfile}
                        data-testid="plex-profile-button"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Visit Jacob's Plex Profile
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Message Jacob on WhatsApp</h4>
                      <p className="text-muted-foreground text-xs md:text-sm mb-3">
                        After sending the friend request, message Jacob on WhatsApp to let him know your Plex username so he can accept your request and share the server with you.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="bg-green-600 hover:bg-green-700 active:bg-green-800 min-h-[44px] text-xs md:text-sm"
                          onClick={handleWhatsApp}
                          data-testid="whatsapp-button"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp Jacob
                        </Button>
                        <Button
                          variant="outline"
                          className="glass hover:border-primary/50 active:bg-primary/20 min-h-[44px] text-xs md:text-sm"
                          onClick={handleCall}
                          data-testid="call-button"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          className="glass hover:border-primary/50 active:bg-primary/20 min-h-[44px] text-xs md:text-sm"
                          onClick={handleEmail}
                          data-testid="email-button"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">5</div>
                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Accept the Server Invitation</h4>
                      <p className="text-muted-foreground text-xs md:text-sm mb-2">
                        Once Jacob shares his server with you, you'll receive an email from Plex saying <strong>"JNathan34 has given you access to his server"</strong>.
                      </p>
                      <ul className="text-muted-foreground text-xs md:text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>Check your email inbox (and spam folder)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>Click the link in the email to accept</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>Open the Plex app - the server will appear automatically</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>Start streaming and enjoy!</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
