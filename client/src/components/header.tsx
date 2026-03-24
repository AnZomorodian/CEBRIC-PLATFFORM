
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "HOME", path: "/" },
    { name: "NEWS", path: "/news" },
    { name: "SCHEDULE", path: "/schedule" },
    { name: "TELEMETRY", path: "/telemetry" },
    { name: "FANTASY", path: "/fantasy", disabled: true },
    { name: "BLOG", path: "/blog", disabled: true },
    { name: "STREAM", path: "/stream", disabled: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-black text-xl italic">C</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.disabled ? "#" : item.path}
                className={`transition-colors hover:text-primary ${
                  location === item.path ? "text-primary" : "text-muted-foreground"
                } ${item.disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border p-4 bg-background">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.disabled ? "#" : item.path}
                onClick={() => !item.disabled && setIsMenuOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.path ? "text-primary" : "text-muted-foreground"
                } ${item.disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
