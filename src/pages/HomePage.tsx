import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Zap, Users, HeadphonesIcon, Download, Share, X } from "lucide-react";
import { useState, useEffect } from "react";

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
    href: "/role",
    icon: Users,
    emoji: "🎉",
    titulo: "Modo Rolê",
    subtitulo: "Calcula pra toda a galera",
    cor: "from-green-500 to-emerald-400",
    delay: 0.3,
  },
];

function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;

    setIsIOS(ios);
    setIsInstalled(standalone);
    setDismissed(!!localStorage.getItem("pwa-dismissed"));

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem("pwa-dismissed", "1");
    setDismissed(true);
  };

  const showBanner = !isInstalled && !dismissed && (installPrompt || isIOS);

  return { install, dismiss, isIOS, showBanner };
}

export default function HomePage() {
  const { install, dismiss, isIOS, showBanner } = useInstallPrompt();

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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full max-w-2xl mt-4"
        >
          <Link href="/suporte">
            <div
              className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 cursor-pointer group"
              data-testid="menu-card-suporte"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="flex items-center gap-4">
                <div className="text-3xl p-2 rounded-xl bg-gradient-to-br from-slate-500 to-slate-400 bg-opacity-10">
                  🛠️
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-2xl text-foreground tracking-wide">
                    Suporte
                  </h2>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    Contato do desenvolvedor
                  </p>
                </div>
                <HeadphonesIcon size={18} className="text-muted-foreground flex-shrink-0" />
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-slate-500 to-slate-400 transition-all duration-300" />
            </div>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground text-xs mt-8 text-center max-w-sm"
        >
          ⚠️ Beba com responsabilidade. O EconoBeer não se responsabiliza por
          decisões tomadas após o 3º copo.
        </motion.p>
      </div>

      {/* Banner de instalação PWA */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 right-4 z-50"
          >
            <div className="bg-card border border-primary/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
              <img src="/icon-72.png" alt="EconoBeer" className="w-12 h-12 rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm">Instalar EconoBeer</p>
                {isIOS ? (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Toque em <Share size={10} className="inline" /> e depois <strong>"Adicionar à Tela Inicial"</strong>
                  </p>
                ) : (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Funciona offline, rápido como app nativo
                  </p>
                )}
              </div>
              {!isIOS && (
                <button
                  onClick={install}
                  data-testid="button-install-pwa"
                  className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
                >
                  <Download size={14} />
                  Instalar
                </button>
              )}
              <button
                onClick={dismiss}
                data-testid="button-dismiss-pwa"
                className="flex-shrink-0 text-muted-foreground p-1"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
