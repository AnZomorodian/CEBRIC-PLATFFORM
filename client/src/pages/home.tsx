
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Trophy, Activity, Info, Users, Shield, Zap, Globe } from "lucide-react";
import f1CarAsset from "@assets/image_1771088682703.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-primary/20 via-background to-background">
        <div className="container px-4 mx-auto relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent italic">
              CEBRIC PLATFORM
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed font-light">
              The next generation of Formula 1 telemetry and performance intelligence. 
              Engineering-grade insights for the modern racing enthusiast.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Button size="lg" asChild className="hover-elevate min-h-[3.5rem] px-10 text-lg rounded-full">
                <Link href="/telemetry">Launch Telemetry</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="hover-elevate min-h-[3.5rem] px-10 text-lg rounded-full bg-background/50 backdrop-blur-sm">
                <a href="#about">Our Vision</a>
              </Button>
            </div>
          </div>
        </div>
        {/* Abstract background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      </section>

      {/* Who We Are Section */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Who We Are</h2>
              <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-8"></div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Born from a passion for precision and a love for the pinnacle of motorsport, 
                we are a collective of developers and racing analysts who believe that 
                advanced telemetry shouldn't be locked behind pit wall barriers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all group hover-elevate">
                <Shield className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4 italic">Integrity</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We use verified FastF1 datasets to ensure every millisecond of data 
                  reflects the actual performance on track.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-secondary/50 transition-all group hover-elevate">
                <Zap className="w-12 h-12 text-secondary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4 italic">Innovation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our custom analysis algorithms translate raw sensor logs into 
                  actionable performance metrics.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all group hover-elevate">
                <Globe className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4 italic">Accessibility</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built to be the ultimate companion for fans globally, 
                  demystifying the technical complexities of F1.
                </p>
              </div>
            </div>

            <div className="mt-20 p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 backdrop-blur-sm text-center">
              <h3 className="text-2xl font-bold mb-6 italic tracking-wider uppercase">Why We Built This</h3>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed italic">
                "Modern Formula 1 broadcasts provide a surface-level view of a deeply technical sport. 
                We built CEBRIC Platform to bridge that gap, giving fans the tools to see exactly how 
                lap times are found, where mistakes happen, and how championships are won in the data."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Excellence */}
      <section className="py-24 bg-muted/20 overflow-hidden">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                <Zap className="w-3 h-3" />
                Advanced Analytics
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 italic tracking-tight leading-tight">
                Engineering <span className="text-primary">Excellence</span> at the Pinnacle
              </h2>
              <div className="space-y-8">
                <div className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover-elevate">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                      <Trophy className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Championship Analysis</h4>
                      <p className="text-muted-foreground leading-relaxed">Compare teammates and title rivals with side-by-side telemetry overlays across any session since 2018. Identify exactly where time is gained or lost.</p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-secondary/30 transition-all hover-elevate">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-secondary/20">
                      <Activity className="w-7 h-7 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors">High-Fidelity Telemetry</h4>
                      <p className="text-muted-foreground leading-relaxed">Visualize brake points, throttle application, and gear shifts with millisecond precision using our high-performance canvas rendering engine.</p>
                    </div>
                  </div>
                </div>

                <div className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all hover-elevate">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                      <Globe className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Global Race Intelligence</h4>
                      <p className="text-muted-foreground leading-relaxed">Stay updated with the latest F1 news and deep-dive strategy insights. Our platform bridges the gap between raw data and racing logic.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative lg:pl-10">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-muted to-card border border-border/50 overflow-hidden group shadow-2xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                  style={{ backgroundImage: `url(${f1CarAsset})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                <div className="p-12 h-full flex flex-col justify-end relative z-10">
                   <div className="p-4 rounded-xl bg-background/80 backdrop-blur-md border border-white/10 mb-6">
                     <div className="flex items-center gap-4 mb-3">
                       <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                       <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Live Telemetry Link</span>
                     </div>
                     <div className="space-y-2">
                       <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-[75%]"></div>
                       </div>
                       <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                         <div className="h-full bg-secondary w-[45%]"></div>
                       </div>
                     </div>
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-2 italic">Data Driven Performance</h3>
                   <p className="text-muted-foreground text-sm">Professional grade tools for the ultimate racing analysis experience.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
