import { motion } from "framer-motion";
import { Mail, Phone, Code2, Heart } from "lucide-react";
import Layout from "@/components/Layout";

export default function SuportePage() {
  return (
    <Layout
      titulo="Suporte"
      subtitulo="Informações do desenvolvedor"
      emoji="🛠️"
      accentColor="from-slate-500 to-slate-400"
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-3xl p-8 w-full max-w-md text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            className="text-6xl"
          >
            🍺
          </motion.div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Code2 size={18} className="text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                Software desenvolvido por
              </p>
            </div>
            <h2 className="font-display text-4xl text-primary tracking-wide">
              Sócrates Resende
            </h2>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-4">
            <motion.a
              href="mailto:socrates.resende@gmail.com"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-4 bg-secondary hover:bg-border/60 rounded-2xl px-5 py-4 transition-colors group"
              data-testid="link-email"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Mail size={18} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground mb-0.5">E-mail</p>
                <p className="text-sm font-medium text-foreground">
                  socrates.resende@gmail.com
                </p>
              </div>
            </motion.a>

            <motion.a
              href="tel:+5531999943956"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-4 bg-secondary hover:bg-border/60 rounded-2xl px-5 py-4 transition-colors group"
              data-testid="link-telefone"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Phone size={18} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground mb-0.5">Telefone</p>
                <p className="text-sm font-medium text-foreground">
                  31-999943956
                </p>
              </div>
            </motion.a>
          </div>

          <div className="h-px bg-border" />

          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            Feito com <Heart size={11} className="text-red-400 fill-red-400" /> para quem ama uma boa cerveja gelada
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground text-center"
        >
          EconoBeer v1.0 · Beba com responsabilidade
        </motion.p>
      </div>
    </Layout>
  );
}
