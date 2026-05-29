import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Zap, Users, HeadphonesIcon, Download, Share2, Wifi, X } from "lucide-react";
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
  const [showChoice, setShowChoice] = useState(false);
  const [iosInstructions, setIosInstructions] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = !!localStorage.getItem("pwa-choice-made");

    setIsIOS(ios);
    setIsInstalled(standalone);

    if (!standalone && !dismissed) {
      setTimeout(() => setShowChoice(true), 800);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (isIOS) {
      setIosInstructions(true);
      return;
    }
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setShowChoice(false);
        localStorage.setItem("pwa-choice-made", "1");
      }
    } else {
      // Chrome ainda não disparou o evento — mostra instrução genérica
      setIosInstructions(true);
    }
  };

  const useOnline = () => {
    localStorage.setItem("pwa-choice-made", "1");
    setShowChoice(false);
  };

  const closeIos = () => {
    setIosInstructions(false);
    localStorage.setItem("pwa-choice-made", "1");
    setShowChoice(false);
  };

  return { install, useOnline, closeIos, isIOS, showChoice, iosInstructions, isInstalled };
}

export default function HomePage() {
  const { install, useOnline, closeIos, isIOS, showChoice, iosInstructions } = useInstallPrompt();

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
            Beba mais, gaste menos.{" "}
            <span className="text-primary">Cientificamente.</span>
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

      {/* Modal de escolha: instalar ou usar online */}
      <AnimatePresence>
        {showChoice && !iosInstructions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={useOnline}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl p-6 pb-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/icon-72.png"
                  alt="EconoBeer"
                  className="w-14 h-14 rounded-2xl flex-shrink-0"
                />
                <div>
                  <h2 className="font-display text-2xl text-foreground">EconoBeer</h2>
                  <p className="text-muted-foreground text-sm">Como você quer usar?</p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={install}
                  data-testid="button-install-app"
                  className="w-full bg-primary text-primary-foreground rounded-2xl p-4 flex items-center gap-4 text-left"
                >
                  <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
                    <Download size={22} />
                  </div>
                  <div>
                    <div className="font-bold text-base">Instalar o app</div>
                    <div className="text-sm opacity-80">
                      Funciona offline, ícone na tela inicial, mais rápido
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={useOnline}
                  data-testid="button-use-online"
                  className="w-full bg-secondary border border-border text-foreground rounded-2xl p-4 flex items-center gap-4 text-left"
                >
                  <div className="bg-primary/10 p-2 rounded-xl flex-shrink-0 text-primary">
                    <Wifi size={22} />
                  </div>
                  <div>
                    <div className="font-bold text-base">Usar online</div>
                    <div className="text-sm text-muted-foreground">
                      Continuar pelo navegador, sem instalar
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Instruções para iOS / Chrome sem prompt */}
      <AnimatePresence>
        {iosInstructions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={closeIos}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl p-6 pb-10"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="font-display text-2xl text-foreground">Instalar EconoBeer</h2>
                  <p className="text-muted-foreground text-sm">Siga os passos abaixo</p>
                </div>
                <button onClick={closeIos} className="text-muted-foreground p-1" data-testid="button-close-ios">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-foreground font-medium">
                      {isIOS ? "Toque no botão Compartilhar" : "Abra o menu do navegador"}
                    </p>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {isIOS
                        ? <>O ícone <Share2 size={12} className="inline" /> na barra inferior do Safari</>
                        : "Toque nos 3 pontos no canto do Chrome"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-foreground font-medium">
                      {isIOS ? "Toque em "Adicionar à Tela Inicial"" : "Toque em "Adicionar à tela inicial""}
                    </p>
                    <p className="text-muted-foreground text-sm mt-0.5">Role a lista até encontrar a opção</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="text-foreground font-medium">Toque em "Adicionar"</p>
                    <p className="text-muted-foreground text-sm mt-0.5">O ícone do EconoBeer vai aparecer na sua tela inicial 🍺</p>
                  </div>
                </div>
              </div>

              <button
                onClick={closeIos}
                data-testid="button-entendi"
                className="w-full mt-6 bg-primary text-primary-foreground font-bold rounded-2xl py-3"
              >
                Entendi!
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
