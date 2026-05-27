import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Beer } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  titulo: string;
  subtitulo?: string;
  emoji?: string;
  accentColor?: string;
}

export default function Layout({
  children,
  titulo,
  subtitulo,
  emoji = "🍺",
  accentColor = "from-amber-500 to-yellow-400",
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="btn-voltar"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Voltar</span>
            </motion.button>
          </Link>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <h1 className="font-display text-3xl text-foreground tracking-wide">
                {titulo}
              </h1>
            </div>
            {subtitulo && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitulo}</p>
            )}
          </div>
          <div className="w-20" />
        </div>
        <div className={`h-0.5 bg-gradient-to-r ${accentColor}`} />
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
