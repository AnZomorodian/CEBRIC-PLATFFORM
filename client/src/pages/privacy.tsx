
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Lock, Eye, FileText, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 hover:bg-primary/10 hover:text-primary">
          <Link href="/">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">Last updated: February 14, 2026</p>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>
              At CEBRIC Platform, we take your privacy seriously. This policy explains how we handle your data and our commitment to transparency in our telemetry analysis and news services.
            </p>
          </CardContent>
        </Card>

        <section className="space-y-6">
          <div className="flex gap-4">
            <div className="mt-1 p-2 rounded-lg bg-secondary/10 text-secondary h-fit">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Data Collection</h3>
              <p className="text-muted-foreground">
                We do not require user accounts or personal information to access our platform. We collect anonymous technical data such as browser type and session duration to improve our site's performance and user experience.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary h-fit">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Data Security</h3>
              <p className="text-muted-foreground">
                All data transmitted through CEBRIC Platform is encrypted using industry-standard SSL/TLS protocols. Our telemetry data is sourced from official FIA timing feeds via the FastF1 library and is processed securely on our servers.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 p-2 rounded-lg bg-muted text-muted-foreground h-fit">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Third-Party Links</h3>
              <p className="text-muted-foreground">
                Our news section contains links to external sites like Motorsport.com and Autosport.com. We are not responsible for the privacy practices or content of these external websites.
              </p>
            </div>
          </div>
        </section>

        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-6">
            <h3 className="text-lg font-medium mb-2">Contact Us</h3>
            <p className="text-sm text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact our team via the social links provided in the footer.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
