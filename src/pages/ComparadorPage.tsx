import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Trophy, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Cerveja, ResultadoComparacao } from "@/lib/types";
import { cn } from "@/lib/utils";

const TIPOS = [
  { valor: "lata", label: "Lata (350ml)", volume: 350 },
  { valor: "long-neck", label: "Long Neck (355ml)", volume: 355 },
  { valor: "litrinho", label: "Litrinho (473ml)", volume: 473 },
  { valor: "garrafa-600", label: "Garrafa 600ml", volume: 600 },
  { valor: "litrao", label: "Litrão (1000ml)", volume: 1000 },
  { valor: "garrafa", label: "Garrafa (330ml)", volume: 330 },
];

const CORES_BADGE: Record<string, string> = {
  amarelo: "#F59E0B",
  vermelho: "#EF4444",
  preto: "#1F2937",
  verde: "#10B981",
  azul: "#3B82F6",
  branco: "#F9FAFB",
};

let idCounter = 2;

function novaCerveja(): Cerveja {
  idCounter++;
  return {
    id: String(idCounter),
    nome: "",
    marca: "",
    tipo: "lata",
    volume: 350,
    preco: 0,
    teorAlcoolico: 5,
    cor: "amarelo",
  };
}

function calcularResultados(cervejas: Cerveja[]): ResultadoComparacao[] {
  const validas = cervejas.filter((c) => c.preco > 0 && c.volume > 0);
  if (validas.length === 0) return [];

  const resultados = validas.map((c) => {
    const custoPorMl = c.preco / c.volume;
    const mlAlcool = (c.volume * c.teorAlcoolico) / 100;
    const custoPorAlcool = mlAlcool > 0 ? c.preco / mlAlcool : 999;
    const custoPorDose = custoPorMl * 350;
    return {
      cerveja: c,
      custoPorMl,
      custoPorAlcool,
      custoPorDose,
      pontuacao: 0,
      badge: "bom" as const,
    };
  });

  const minCustoPorMl = Math.min(...resultados.map((r) => r.custoPorMl));
  const maxCustoPorMl = Math.max(...resultados.map((r) => r.custoPorMl));

  return resultados
    .map((r) => {
      const range = maxCustoPorMl - minCustoPorMl;
      const pontuacao =
        range > 0 ? ((maxCustoPorMl - r.custoPorMl) / range) * 100 : 50;
      let badge: "melhor" | "bom" | "caro" = "bom";
      if (pontuacao >= 70) badge = "melhor";
      else if (pontuacao <= 30) badge = "caro";
      return { ...r, pontuacao, badge };
    })
    .sort((a, b) => a.custoPorMl - b.custoPorMl);
}

export default function ComparadorPage() {
  const [cervejas, setCervejas] = useState<Cerveja[]>([
    { id: "1", nome: "", marca: "", tipo: "lata", volume: 350, preco: 0, teorAlcoolico: 5, cor: "amarelo" },
    { id: "2", nome: "", marca: "", tipo: "lata", volume: 350, preco: 0, teorAlcoolico: 5, cor: "amarelo" },
  ]);
  const [comparado, setComparado] = useState(false);
  const [resultados, setResultados] = useState<ResultadoComparacao[]>([]);

  const adicionarCerveja = () => {
    if (cervejas.length >= 8) {
      toast.error("Máximo de 8 cervejas! Você já está bêbado demais pra comparar mais.");
      return;
    }
    setCervejas([...cervejas, novaCerveja()]);
    setComparado(false);
  };

  const removerCerveja = (id: string) => {
    if (cervejas.length <= 1) {
      toast.warning("Deixa pelo menos uma cerveja, companheiro!");
      return;
    }
    setCervejas(cervejas.filter((c) => c.id !== id));
    setComparado(false);
  };

  const atualizarCerveja = (id: string, campo: keyof Cerveja, valor: string | number) => {
    setCervejas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (campo === "tipo") {
          const tipoEncontrado = TIPOS.find((t) => t.valor === valor);
          return { ...c, tipo: valor as Cerveja["tipo"], volume: tipoEncontrado?.volume ?? c.volume };
        }
        return { ...c, [campo]: valor };
      })
    );
    setComparado(false);
  };

  const comparar = () => {
    const validas = cervejas.filter((c) => c.preco > 0);
    if (validas.length < 2) {
      toast.error("Bota o preço em pelo menos 2 cervejas pra comparar, meu chapa!");
      return;
    }
    const res = calcularResultados(cervejas);
    setResultados(res);
    setComparado(true);
    toast.success("Análise concluída! 🍺 Confere o resultado lá embaixo!");
  };

  return (
    <Layout
      titulo="Comparador"
      subtitulo="Qual cerveja realmente compensa no seu bolso?"
      emoji="🧮"
      accentColor="from-amber-500 to-yellow-400"
    >
      <div className="space-y-4">
        {cervejas.map((cerveja, index) => (
          <motion.div
            key={cerveja.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: CORES_BADGE[cerveja.cor ?? "amarelo"] }}
                />
                <span className="font-display text-xl text-primary">
                  Cerveja {index + 1}
                </span>
              </div>
              <button
                onClick={() => removerCerveja(cerveja.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                data-testid={`btn-remover-${cerveja.id}`}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-muted-foreground mb-1 block">Nome / Marca</label>
                <input
                  type="text"
                  placeholder="Ex: Skol Lata"
                  value={cerveja.nome}
                  onChange={(e) => atualizarCerveja(cerveja.id, "nome", e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid={`input-nome-${cerveja.id}`}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tipo / Volume</label>
                <select
                  value={cerveja.tipo}
                  onChange={(e) => atualizarCerveja(cerveja.id, "tipo", e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid={`select-tipo-${cerveja.id}`}
                >
                  {TIPOS.map((t) => (
                    <option key={t.valor} value={t.valor}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Volume (ml)</label>
                <input
                  type="number"
                  placeholder="350"
                  value={cerveja.volume || ""}
                  onChange={(e) => atualizarCerveja(cerveja.id, "volume", Number(e.target.value))}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid={`input-volume-${cerveja.id}`}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="3.99"
                  value={cerveja.preco || ""}
                  onChange={(e) => atualizarCerveja(cerveja.id, "preco", Number(e.target.value))}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid={`input-preco-${cerveja.id}`}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Álcool (%)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="5.0"
                  value={cerveja.teorAlcoolico || ""}
                  onChange={(e) => atualizarCerveja(cerveja.id, "teorAlcoolico", Number(e.target.value))}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid={`input-alcool-${cerveja.id}`}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cor da cerveja</label>
                <select
                  value={cerveja.cor ?? "amarelo"}
                  onChange={(e) => atualizarCerveja(cerveja.id, "cor", e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  data-testid={`select-cor-${cerveja.id}`}
                >
                  <option value="amarelo">🟡 Amarela (pilsen)</option>
                  <option value="vermelho">🔴 Rubi/Vienna</option>
                  <option value="preto">⚫ Preta/Stout</option>
                  <option value="verde">🟢 IPA</option>
                  <option value="azul">🔵 Weiss</option>
                </select>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={adicionarCerveja}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary rounded-2xl py-3 transition-colors"
            data-testid="btn-adicionar-cerveja"
          >
            <Plus size={18} />
            <span className="font-medium">Adicionar cerveja</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={comparar}
            className="flex-1 bg-primary text-primary-foreground font-bold rounded-2xl py-3 flex items-center justify-center gap-2"
            data-testid="btn-comparar"
          >
            <Trophy size={18} />
            COMPARAR!
          </motion.button>
        </div>

        <AnimatePresence>
          {comparado && resultados.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-3 mt-6"
            >
              <h2 className="font-display text-3xl text-foreground text-center mb-4">
                🏆 Resultado Final
              </h2>
              {resultados.map((r, index) => (
                <motion.div
                  key={r.cerveja.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative bg-card border rounded-2xl p-4 overflow-hidden",
                    r.badge === "melhor" ? "border-yellow-500 glow-gold" : "",
                    r.badge === "caro" ? "border-red-500/50" : "border-border"
                  )}
                >
                  {r.badge === "melhor" && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                        🏆 MELHOR
                      </span>
                    </div>
                  )}
                  {r.badge === "caro" && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full border border-red-500/30">
                        💸 CARO
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <div className="font-display text-4xl text-primary w-8 text-center">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {r.cerveja.nome || `Cerveja ${index + 1}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.cerveja.volume}ml • {r.cerveja.teorAlcoolico}% álcool
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-secondary rounded-xl p-2">
                      <div className="text-xs text-muted-foreground">Custo/ml</div>
                      <div className="font-bold text-foreground">
                        R${(r.custoPorMl * 100).toFixed(3)}
                        <span className="text-xs text-muted-foreground">/100ml</span>
                      </div>
                    </div>
                    <div className="bg-secondary rounded-xl p-2">
                      <div className="text-xs text-muted-foreground">Preço total</div>
                      <div className="font-bold text-foreground">
                        R${r.cerveja.preco.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-secondary rounded-xl p-2">
                      <div className="text-xs text-muted-foreground">Custo/álcool</div>
                      <div className="font-bold text-accent">
                        R${r.custoPorAlcool.toFixed(2)}
                        <span className="text-xs">/ml</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Custo-benefício</span>
                      <span>{r.pontuacao.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.pontuacao}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                        className={cn(
                          "h-full rounded-full",
                          r.badge === "melhor" ? "bg-yellow-500" : r.badge === "caro" ? "bg-red-500" : "bg-primary"
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}

              {resultados.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-card border border-border rounded-2xl p-4 text-center"
                >
                  <p className="text-muted-foreground text-sm">
                    💡 Comprando{" "}
                    <strong className="text-primary">
                      {resultados[0].cerveja.nome || "a melhor opção"}
                    </strong>{" "}
                    em vez da{" "}
                    <strong className="text-destructive">
                      {resultados[resultados.length - 1].cerveja.nome || "mais cara"}
                    </strong>
                    , você economiza{" "}
                    <strong className="text-green-400">
                      R${((resultados[resultados.length - 1].custoPorMl - resultados[0].custoPorMl) * 1000).toFixed(2)}
                    </strong>{" "}
                    a cada litro bebido! 🎉
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
