import { Link } from "wouter";
import { motion } from "framer-motion";
import { Beer, Calculator, Zap, BookOpen, Users } from "lucide-react";

const menuItems = [
  {
    href: "/comparador",
    icon: Calculator,
    emoji: "🧮",
    titulo: "Comparador",
    subtitulo: "Qual lata compensa mais?",
    cor: "from-amber-500 to-yellow-400",
    delay: 0.1,
  },
  {
    href: "/tonturometro",
    icon: Zap,
    emoji: "🥴",
    titulo: "Tonturômetro",
    subtitulo: "Qual deixa mais tonto por real?",
    cor: "from-purple-600 to-pink-500",
    delay: 0.2,
  },
  {
    href: "/catalogo",
    icon: BookOpen,
    emoji: "🏪",
    titulo: "Catálogo",
    subtitulo: "Compare preços do mercado",
    cor: "from-blue-500 to-cyan-400",
    delay: 0.3,
  },
  {
    href: "/role",
    icon: Users,
    emoji: "🎉",
    titulo: "Modo Rolê",
    subtitulo: "Calcula pra toda a galera",
    cor: "from-green-500 to-emerald-400",
    delay: 0.4,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-8xl mb-4"
          >
            🍺
          </motion.div>
          <h1 className="font-display text-7xl md:text-9xl text-primary tracking-wider mb-2">
            EconoBeer
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            Beba mais, gaste menos. <span className="text-primary">Cientificamente.</span>
          </p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mt-4 max-w-xs mx-auto"
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
          {menuItems.map((item) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: item.delay, duration: 0.4 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link href={item.href}>
                <div
                  className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 cursor-pointer group"
                  data-testid={`menu-card-${item.href.slice(1)}`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.cor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />
                  <div className="flex items-start gap-4">
                    <div
                      className={`text-4xl p-2 rounded-xl bg-gradient-to-br ${item.cor} bg-opacity-10`}
                    >
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-3xl text-foreground tracking-wide">
                        {item.titulo}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        {item.subtitulo}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${item.cor} transition-all duration-300`}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground text-xs mt-10 text-center max-w-sm"
        >
          ⚠️ Beba com responsabilidade. O EconoBeer não se responsabiliza por
          decisões tomadas após o 3º copo.
        </motion.p>
      </div>
    </div>
  );
}
