import { useQuery } from "@tanstack/react-query";
import { Server, Users, HardDrive, Activity, TrendingUp, UserCog, FolderPlus, RotateCcw, Download, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ServerStats } from "@shared/schema";

const adminTools = [
  {
    icon: TrendingUp,
    title: "Performance Monitor",
    description: "Real-time server performance metrics and resource usage.",
    action: "View Dashboard",
  },
  {
    icon: UserCog,
    title: "User Management",
    description: "Manage user accounts, permissions, and subscription status.",
    action: "Manage Users",
  },
  {
    icon: FolderPlus,
    title: "Content Management",
    description: "Add new content, manage libraries, and handle requests.",
    action: "Manage Content",
  },
];

const quickActions = [
  {
    icon: RotateCcw,
    title: "Restart Server",
    variant: "outline" as const,
  },
  {
    icon: Download,
    title: "Backup Data",
    variant: "outline" as const,
  },
  {
    icon: RefreshCw,
    title: "Update Server",
    variant: "outline" as const,
  },
  {
    icon: FileText,
    title: "View Logs",
    variant: "outline" as const,
  },
];

export default function AdminSection() {
  const { data: serverStats, isLoading } = useQuery<ServerStats>({
    queryKey: ['/api/server-stats'],
  });

  const handleToolClick = (title: string) => {
    // In a real implementation, these would link to actual admin interfaces
    alert(`${title} would be implemented here`);
  };

  const handleQuickAction = (title: string) => {
    // In a real implementation, these would perform actual server actions
    alert(`${title} action would be performed here`);
  };

  return (
    <section id="admin" className="py-20" data-testid="admin-section">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Admin Dashboard</h2>
          <p className="text-xl text-muted-foreground">Server management and statistics</p>
        </div>

        {/* Server Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="stats-card">
            <CardContent className="p-6 text-center">
              <Server className="h-8 w-8 text-primary mx-auto mb-4" />
              <div className="text-2xl font-bold mb-2" data-testid="uptime-stat">
                {isLoading ? "..." : serverStats?.uptime || "99.9%"}
              </div>
              <p className="text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-4" />
              <div className="text-2xl font-bold mb-2" data-testid="active-users-stat">
                {isLoading ? "..." : serverStats?.activeUsers || "47"}
              </div>
              <p className="text-muted-foreground">Active Users</p>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6 text-center">
              <HardDrive className="h-8 w-8 text-primary mx-auto mb-4" />
              <div className="text-2xl font-bold mb-2" data-testid="storage-stat">
                {isLoading ? "..." : serverStats?.storageUsed || "12.5TB"}
              </div>
              <p className="text-muted-foreground">Storage Used</p>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 text-primary mx-auto mb-4" />
              <div className="text-2xl font-bold mb-2" data-testid="active-streams-stat">
                {isLoading ? "..." : serverStats?.activeStreams || "8"}
              </div>
              <p className="text-muted-foreground">Active Streams</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tools */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {adminTools.map((tool, index) => {
            const Icon = tool.icon;
            
            return (
              <Card key={index} className="stats-card h-full" data-testid={`admin-tool-${tool.title.toLowerCase().replace(' ', '-')}`}>
                <CardContent className="p-8 h-full flex flex-col">
                  <div className="flex items-center mb-6">
                    <Icon className="h-8 w-8 text-primary mr-4" />
                    <h4 className="text-xl font-bold">{tool.title}</h4>
                  </div>
                  
                  <p className="text-muted-foreground mb-8 flex-grow">
                    {tool.description}
                  </p>
                  
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleToolClick(tool.title)}
                    data-testid={`admin-tool-button-${tool.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tool.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={index}
                variant={action.variant}
                className="p-4 h-auto flex flex-col items-center space-y-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleQuickAction(action.title)}
                data-testid={`quick-action-${action.title.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{action.title}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
