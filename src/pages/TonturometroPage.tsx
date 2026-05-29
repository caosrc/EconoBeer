import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

interface EntradaCerveja {
  id: string;
  nome: string;
  volume: number;
  preco: number;
  teorAlcoolico: number;
}

interface ResultadoTontura {
  entrada: EntradaCerveja;
  mlAlcoolPuro: number;
  custoPorMlAlcool: number;
  dosesEquivalentes: number;
  indiceEbrieza: number;
  nivel: "leve" | "animado" | "tontinho" | "voando" | "ja-era";
  fraseEngraçada: string;
}

const FRASES_POR_NIVEL: Record<string, string[]> = {
  leve: ["Você mal vai sentir...", "Dá pra fazer mais, né?", "Isso é suco com álcool"],
  animado: ["Você vai ficar na conversa!", "Serve pra começar o rolê", "Bom pra aquecer"],
  tontinho: ["Aí sim! Você vai ficar bem animado 😄", "Já dá uma leve virada", "Tá ficando bom!"],
  voando: ["Cuidado! Esse vai te derrubar! 🌀", "Segura as pontas!", "Você vai ter memórias seletivas"],
  "ja-era": ["SOCORRO! Chama o Uber AGORA! 🚨", "Você vai amar isso... até amanhã", "Parabéns, você encontrou o buraco negro do álcool"],
};

function frasePorNivel(nivel: string): string {
  const frases = FRASES_POR_NIVEL[nivel] ?? ["Interessante..."];
  return frases[Math.floor(Math.random() * frases.length)];
}

function calcularNivel(indice: number): ResultadoTontura["nivel"] {
  if (indice < 2) return "leve";
  if (indice < 5) return "animado";
  if (indice < 10) return "tontinho";
  if (indice < 20) return "voando";
  return "ja-era";
}

const COR_NIVEL: Record<string, string> = {
  leve: "text-blue-400",
  animado: "text-green-400",
  tontinho: "text-yellow-400",
  voando: "text-orange-400",
  "ja-era": "text-red-400",
};

const EMOJI_NIVEL: Record<string, string> = {
  leve: "😐",
  animado: "😊",
  tontinho: "😄",
  voando: "🥴",
  "ja-era": "💀",
};

const BARRA_NIVEL_COR: Record<string, string> = {
  leve: "bg-blue-400",
  animado: "bg-green-400",
  tontinho: "bg-yellow-400",
  voando: "bg-orange-400",
  "ja-era": "bg-red-500",
};

let counter = 1;

export default function TonturometroPage() {
  const [cervejas, setCervejas] = useState<EntradaCerveja[]>([
    { id: "1", nome: "", volume: 350, preco: 0, teorAlcoolico: 5 },
  ]);
  const [resultados, setResultados] = useState<ResultadoTontura[]>([]);
  const [calculado, setCalculado] = useState(false);

  const adicionar = () => {
    counter++;
    setCervejas([...cervejas, { id: String(counter), nome: "", volume: 350, preco: 0, teorAlcoolico: 5 }]);
    setCalculado(false);
  };

  const remover = (id: string) => {
    if (cervejas.length <= 1) return;
    setCervejas(cervejas.filter((c) => c.id !== id));
    setCalculado(false);
  };

  const atualizar = (id: string, campo: keyof EntradaCerveja, valor: string | number) => {
    setCervejas((prev) => prev.map((c) => c.id === id ? { ...c, [campo]: valor } : c));
    setCalculado(false);
  };

  const calcular = () => {
    const validas = cervejas.filter((c) => c.preco > 0 && c.volume > 0 && c.teorAlcoolico > 0);
    if (validas.length < 1) {
      toast.error("Preenche os dados de pelo menos uma cerveja!");
      return;
    }

    const res: ResultadoTontura[] = validas.map((c) => {
      const mlAlcoolPuro = (c.volume * c.teorAlcoolico) / 100;
      const custoPorMlAlcool = c.preco / mlAlcoolPuro;
      const dosesEquivalentes = mlAlcoolPuro / 14;
      const indiceEbrieza = mlAlcoolPuro / c.preco;
      const nivel = calcularNivel(indiceEbrieza);
      return {
        entrada: c,
        mlAlcoolPuro,
        custoPorMlAlcool,
        dosesEquivalentes,
        indiceEbrieza,
        nivel,
        fraseEngraçada: frasePorNivel(nivel),
      };
    }).sort((a, b) => b.indiceEbrieza - a.indiceEbrieza);

    setResultados(res);
    setCalculado(true);
    toast.success("Tonturômetro calculado! 🥴");
  };

  const melhor = resultados[0];

  return (
    <Layout
      titulo="Tonturômetro"
      subtitulo="Qual cerveja te deixa mais tonto por real gasto?"
      emoji="🥴"
      accentColor="from-purple-600 to-pink-500"
    >
      <div className="space-y-4">
        <div className="bg-card border border-purple-500/30 rounded-2xl p-4 text-sm text-muted-foreground">
          <strong className="text-purple-400">Como funciona:</strong> Calculamos quantos ml de álcool
          puro você recebe por real gasto. Quanto maior o índice, mais "eficiente" a cerveja é em deixar
          você animado. <span className="text-xs opacity-70">(Use com responsabilidade!)</span>
        </div>

        {cervejas.map((c, index) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-display text-xl text-purple-400">Cerveja {index + 1}</span>
              <button onClick={() => remover(c.id)} className="text-muted-foreground hover:text-destructive transition-colors text-xs" data-testid={`btn-remover-tont-${c.id}`}>
                remover
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Nome da cerveja (ex: Heineken Long Neck)"
                  value={c.nome}
                  onChange={(e) => atualizar(c.id, "nome", e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                  data-testid={`input-nome-tont-${c.id}`}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Volume (ml)</label>
                <input type="number" placeholder="350" value={c.volume || ""} onChange={(e) => atualizar(c.id, "volume", Number(e.target.value))}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500" data-testid={`input-vol-tont-${c.id}`} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Preço (R$)</label>
                <input type="number" step="0.01" placeholder="3.99" value={c.preco || ""} onChange={(e) => atualizar(c.id, "preco", Number(e.target.value))}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500" data-testid={`input-preco-tont-${c.id}`} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Teor alcoólico (%)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="0.5" max="15" step="0.1" value={c.teorAlcoolico}
                    onChange={(e) => atualizar(c.id, "teorAlcoolico", Number(e.target.value))}
                    className="flex-1 accent-purple-500" data-testid={`slider-alcool-tont-${c.id}`} />
                  <span className="text-foreground font-bold w-12 text-right">{c.teorAlcoolico}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="flex gap-3">
          <button onClick={adicionar} className="flex-1 border-2 border-dashed border-border hover:border-purple-500 text-muted-foreground hover:text-purple-400 rounded-2xl py-3 text-sm font-medium transition-colors" data-testid="btn-adicionar-tont">
            + Adicionar cerveja
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calcular}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-2xl py-3 flex items-center justify-center gap-2"
            data-testid="btn-calcular-tont"
          >
            <Zap size={18} />
            CALCULAR!
          </motion.button>
        </div>

        <AnimatePresence>
          {calculado && resultados.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="text-center py-2">
                <h2 className="font-display text-3xl text-foreground">🥴 Ranking do Tonturômetro</h2>
                <p className="text-muted-foreground text-sm mt-1">Quem deixa mais tonto por real</p>
              </div>

              {melhor && (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-2xl p-5 text-center"
                >
                  <div className="text-5xl mb-2">{EMOJI_NIVEL[melhor.nivel]}</div>
                  <div className="font-display text-2xl text-purple-300 mb-1">Campeã do Tonturômetro</div>
                  <div className="text-xl font-bold text-white">{melhor.entrada.nome || "Cerveja 1"}</div>
                  <div className="text-purple-300 mt-2 text-sm italic">"{melhor.fraseEngraçada}"</div>
                  <div className="mt-3 text-muted-foreground text-xs">
                    {melhor.mlAlcoolPuro.toFixed(1)}ml de álcool puro • {melhor.indiceEbrieza.toFixed(2)} ml álcool/R$
                  </div>
                </motion.div>
              )}

              {resultados.map((r, index) => (
                <motion.div
                  key={r.entrada.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-3xl text-muted-foreground w-7">
                      {index + 1}
                    </span>
                    <div className="text-2xl">{EMOJI_NIVEL[r.nivel]}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">
                          {r.entrada.nome || `Cerveja ${index + 1}`}
                        </span>
                        <span className={cn("font-bold text-sm", COR_NIVEL[r.nivel])}>
                          {r.nivel.toUpperCase().replace("-", " ")}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {r.mlAlcoolPuro.toFixed(1)}ml álcool puro •
                        R${r.custoPorMlAlcool.toFixed(3)}/ml álcool •
                        {r.dosesEquivalentes.toFixed(1)} doses
                      </div>
                      <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((r.indiceEbrieza / (resultados[0].indiceEbrieza || 1)) * 100, 100)}%` }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.7 }}
                          className={cn("h-full rounded-full", BARRA_NIVEL_COR[r.nivel])}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
