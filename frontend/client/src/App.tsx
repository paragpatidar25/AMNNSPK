import { Switch, Route, Router, Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Catalog from "@/pages/Catalog";
import Orders from "@/pages/Orders";
import Pricing from "@/pages/Pricing";
import Identity from "@/pages/Identity";
import Issues from "@/pages/Issues";
import NotFound from "@/pages/not-found";
import {
  LayoutDashboard, Package, ShoppingCart, Percent,
  Users, GitBranch, Menu, X, Moon, Sun
} from "lucide-react";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <div>
      {children}
      <button
        onClick={() => setDark(d => !d)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-primary text-primary-foreground p-2.5 shadow-lg hover:opacity-90 transition"
        data-testid="toggle-theme"
        title="Toggle theme"
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/catalog", label: "Catalog", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/pricing", label: "Pricing", icon: Percent },
  { href: "/identity", label: "Identity", icon: Users },
  { href: "/issues", label: "Test Issues", icon: GitBranch },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`sidebar fixed top-0 left-0 h-screen w-60 z-40 flex flex-col transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-label="GOE logo">
            <rect width="32" height="32" rx="7" fill="#3B82F6"/>
            <path d="M8 16 Q8 9 16 9 Q20 9 22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M16 14 L22 14 L22 20 L16 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="16" cy="23" r="2" fill="white"/>
          </svg>
          <div>
            <div className="text-white font-semibold text-sm leading-none">GOE Admin</div>
            <div className="text-white/40 text-xs mt-0.5">Global Order Engine</div>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-white/40 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">
            Platform
          </div>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${active ? "active" : ""}`}
                data-testid={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/30">
          <div>Branch: <span className="text-white/50">copilot/ecommerce</span></div>
          <div className="mt-0.5">v0.1.0 — AMNNSPK</div>
        </div>
      </aside>
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const pageTitle = navItems.find(n => n.href === "/" ? location === "/" : location.startsWith(n.href))?.label ?? "GOE";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-60">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-card border-b border-border h-14 flex items-center px-4 gap-4">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
            data-testid="btn-open-sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://github.com/paragpatidar25/AMNNSPK"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 border border-border rounded-md px-2.5 py-1"
              data-testid="link-github"
            >
              <GitBranch size={13} />
              AMNNSPK
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router hook={useHashLocation}>
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/catalog" component={Catalog} />
              <Route path="/orders" component={Orders} />
              <Route path="/pricing" component={Pricing} />
              <Route path="/identity" component={Identity} />
              <Route path="/issues" component={Issues} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
