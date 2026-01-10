import { Download, Smartphone, Monitor, Tv, Phone, MessageCircle, Mail, BookOpen, ExternalLink } from "lucide-react";
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

const steps = [
  {
    number: 1,
    title: "Download Plex App",
    description: "Choose your device and download the Plex app"
  },
  {
    number: 2,
    title: "Create Plex Account",
    description: "Sign up for a free Plex account and complete setup"
  },
  {
    number: 3,
    title: "Add Jacob's Server",
    description: "Visit Jacob's Plex profile and add him as a friend"
  },
  {
    number: 4,
    title: "Contact Jacob",
    description: "Get in touch to activate your server access"
  },
  {
    number: 5,
    title: "Accept Invitation",
    description: "Check your email and accept the server invitation"
  }
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
    <section id="tutorials" className="py-24 bg-secondary/30 relative overflow-hidden" data-testid="tutorials-section">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-6"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Setup Guide</span>
          </motion.div>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Getting <span className="text-gradient">Started</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            How to install and setup Plex to access Jacob's server
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {step.number}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-medium text-sm">{step.title}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block w-8 h-px bg-border" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass-card h-full">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-8">Step-by-Step Setup Guide</h3>
                  
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-3">Download Plex App</h4>
                        <p className="text-muted-foreground text-sm mb-4">Choose your device and download the Plex app:</p>
                        <div className="grid grid-cols-2 gap-3">
                          {appStoreLinks.map((store, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="justify-start glass hover:border-primary/50"
                              onClick={() => store.url && window.open(store.url, '_blank')}
                              data-testid={`download-${store.name.toLowerCase().replace('/', '-')}`}
                            >
                              <store.icon className="h-4 w-4 mr-2 text-primary" />
                              {store.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                      <div>
                        <h4 className="font-semibold mb-2">Create Plex Account</h4>
                        <p className="text-muted-foreground text-sm">Sign up for a free Plex account and complete the setup process.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                      <div>
                        <h4 className="font-semibold mb-3">Add Jacob's Server</h4>
                        <p className="text-muted-foreground text-sm mb-3">Visit Jacob's Plex profile and add him as a friend:</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass hover:border-primary/50"
                          onClick={handlePlexProfile}
                          data-testid="plex-profile-button"
                        >
                          Visit Plex Profile
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                      <div>
                        <h4 className="font-semibold mb-3">Contact Jacob</h4>
                        <p className="text-muted-foreground text-sm mb-3">Get in touch to activate your server access:</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="glass hover:border-green-500/50 hover:text-green-400"
                            onClick={handleWhatsApp}
                            data-testid="whatsapp-button"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            WhatsApp
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="glass hover:border-primary/50"
                            onClick={handleCall}
                            data-testid="call-button"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="glass hover:border-primary/50"
                            onClick={handleEmail}
                            data-testid="email-button"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</div>
                      <div>
                        <h4 className="font-semibold mb-2">Accept Server Invitation</h4>
                        <p className="text-muted-foreground text-sm">You'll receive an email saying "JNathan34 has given you access to his server" - click the link to accept and start streaming!</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-card h-full">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-8">Video Tutorial</h3>
                  <div className="aspect-video bg-background/50 rounded-2xl flex items-center justify-center border border-dashed border-border overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                    <div className="text-center relative z-10">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center mb-4 shadow-lg"
                      >
                        <Download className="h-10 w-10 text-white" />
                      </motion.div>
                      <div className="text-lg font-medium mb-2">plex.mp4</div>
                      <div className="text-sm text-muted-foreground">Setup Tutorial Video</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center glass-card rounded-2xl p-8"
          >
            <p className="text-muted-foreground mb-6">Need help? Contact Jacob Nathan</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="outline"
                className="glass hover:border-green-500/50 hover:text-green-400"
                onClick={handleWhatsApp}
                data-testid="footer-whatsapp-button"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp: 07481 861478
              </Button>
              <Button
                variant="outline"
                className="glass hover:border-primary/50"
                onClick={handleCall}
                data-testid="footer-call-button"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call: 07481 861478
              </Button>
              <Button
                variant="outline"
                className="glass hover:border-primary/50"
                onClick={handleEmail}
                data-testid="footer-email-button"
              >
                <Mail className="h-4 w-4 mr-2" />
                jacobnathan1718@gmail.com
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
