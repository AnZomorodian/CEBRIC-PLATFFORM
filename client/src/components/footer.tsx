import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Footer() {
  const { toast } = useToast();

  const handleInfoClick = (title: string) => {
    toast({
      title: title,
      description: `This is a placeholder for the ${title.toLowerCase()}. This section is coming soon in a future update!`,
    });
  };

  return (
    <footer className="mt-16 border-t border-border bg-gradient-to-br from-background via-card to-background">
      <Card className="rounded-none border-0 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Creator Section */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Designed & Developed by</p>
              <p className="text-2xl font-black text-foreground mb-1 tracking-tighter italic font-mono uppercase bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Artin Zomorodian & Hani Bikdeli
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <i className="fas fa-users text-primary text-sm"></i>
                <span className="text-sm font-medium text-primary">Powered by DeepInk Team</span>
              </div>
            </div>
            
            {/* Social Links Section */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">Connect with us</p>
              <div className="flex items-center gap-3">
                <a 
                  href="https://t.me/CEBRICF1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-[#0088cc] hover:to-[#0088cc] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#0088cc]/50"
                  aria-label="Join us on Telegram"
                  title="Telegram"
                >
                  <i className="fab fa-telegram text-2xl text-muted-foreground group-hover:text-white transition-colors"></i>
                </a>
                <a 
                  href="https://www.instagram.com/an.zomorodian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#F77737] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#E1306C]/50"
                  aria-label="Follow us on Instagram"
                  title="Instagram"
                >
                  <i className="fab fa-instagram text-2xl text-muted-foreground group-hover:text-white transition-colors"></i>
                </a>
                <a 
                  href="https://discord.gg/7ft5D8N5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-[#5865F2] hover:to-[#5865F2] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#5865F2]/50"
                  aria-label="Join our Discord"
                  title="Discord"
                >
                  <i className="fab fa-discord text-2xl text-muted-foreground group-hover:text-white transition-colors"></i>
                </a>
                <a 
                  href="https://github.com/CEBRIC" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-[#24292e] hover:to-[#24292e] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#24292e]/50"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <i className="fab fa-github text-2xl text-muted-foreground group-hover:text-white transition-colors"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                © 2026 CEBRIC Platform. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                <button onClick={() => handleInfoClick("Contact")} className="hover:text-primary transition-colors">Contact</button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </footer>
  );
}
