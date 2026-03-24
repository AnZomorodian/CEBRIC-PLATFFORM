
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale, Gavel, AlertCircle, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-muted-foreground">Last updated: February 14, 2026</p>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Scale className="w-6 h-6" />
            </div>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>
              By accessing or using CEBRIC Platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
            </p>
          </CardContent>
        </Card>

        <section className="space-y-6">
          <div className="flex gap-4">
            <div className="mt-1 p-2 rounded-lg bg-secondary/10 text-secondary h-fit">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Acceptable Use</h3>
              <p className="text-muted-foreground">
                CEBRIC Platform is provided for personal, non-commercial use only. You agree not to use the service for any illegal purposes or to attempt to disrupt the service through automated means.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary h-fit">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Intellectual Property</h3>
              <p className="text-muted-foreground">
                All content, features, and functionality on the platform, including but not limited to software, text, graphics, and logos, are the property of CEBRIC Platform or its licensors.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="mt-1 p-2 rounded-lg bg-muted text-muted-foreground h-fit">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Disclaimer of Warranties</h3>
              <p className="text-muted-foreground">
                The service is provided "as is" and "as available" without any warranties. We do not guarantee the accuracy of the telemetry data or the availability of the service at all times.
              </p>
            </div>
          </div>
        </section>

        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-6">
            <h3 className="text-lg font-medium mb-2">Limitation of Liability</h3>
            <p className="text-sm text-muted-foreground">
              In no event shall CEBRIC Platform or its creators be liable for any indirect, incidental, or consequential damages arising out of your use of the service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
