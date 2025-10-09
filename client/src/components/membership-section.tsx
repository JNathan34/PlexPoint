import { useQuery } from "@tanstack/react-query";
import { User, Crown, Gem, Diamond, Zap, Award, Check, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MembershipTier } from "@shared/schema";

const tierIcons = {
  "Bronze Tier": User,
  "Silver Tier": Award,
  "Gold Tier": Crown,
  "Diamond Tier": Diamond,
  "Ruby Tier": Gem,
  "Platinum Tier": Zap,
};

const tierColors = {
  "Bronze Tier": "text-amber-600",
  "Silver Tier": "text-gray-500",
  "Gold Tier": "text-yellow-500",
  "Diamond Tier": "text-blue-500",
  "Ruby Tier": "text-red-500",
  "Platinum Tier": "text-purple-500",
};

export default function MembershipSection() {
  const { data: membershipTiers = [], isLoading } = useQuery<MembershipTier[]>({
    queryKey: ['/api/membership-tiers'],
  });

  const handleBankTransfer = (tier: MembershipTier) => {
    window.open('https://ko-fi.com/jnathan34/tiers', '_blank');
  };

  if (isLoading) {
    return (
      <section id="membership" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading membership tiers...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="membership" className="py-20" data-testid="membership-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Subscription Tiers</h2>
          <p className="text-xl text-muted-foreground">🎬 Request Movies & Shows at the Website</p>
          <div className="mt-6 text-center">
            <p className="text-lg text-muted-foreground mb-2">💳 Preferred Payment: Direct Bank Transfer through me (to avoid third-party fees)</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                📞 Phone: 07481 861478
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                📧 Email: jacobnathan1718@gmail.com
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {membershipTiers.map((tier, index) => {
            const Icon = tierIcons[tier.name as keyof typeof tierIcons] || User;
            const colorClass = tierColors[tier.name as keyof typeof tierColors] || "text-primary";
            const isFeatured = tier.name === "Gold Tier";
            
            return (
              <Card 
                key={tier.id} 
                className={`membership-tier ${isFeatured ? 'featured' : ''} relative`}
                data-testid={`membership-tier-${tier.name.toLowerCase().replace(' ', '-')}`}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="text-center mb-6">
                    <Icon className={`h-10 w-10 ${colorClass} mx-auto mb-4`} />
                    <h4 className="text-xl font-bold mb-2">{tier.name}</h4>
                    <div className="text-2xl font-bold text-primary">
                      £{(tier.price / 100).toFixed(0)}
                      <span className="text-sm text-muted-foreground font-normal">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 flex-grow">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleBankTransfer(tier)}
                    data-testid={`join-button-${tier.name.toLowerCase().replace(' ', '-')}`}
                  >
                    Join
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
