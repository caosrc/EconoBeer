import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Store, TrendingDown, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

interface CervejaLoja {
  id: string;
  nome: string;
  marca: string;
  volume: number;
  preco: number;
  teorAlcoolico: number;
  loja: string;
  tipoLoja: string;
}

const CATALOGO_MOCK: CervejaLoja[] = [
  { id: "1", nome: "Skol Lata 350ml", marca: "Skol", volume: 350, preco: 2.99, teorAlcoolico: 4.7, loja: "Supermercado BH", tipoLoja: "supermercado" },
  { id: "2", nome: "Brahma Lata 350ml", marca: "Brahma", volume: 350, preco: 3.29, teorAlcoolico: 5.0, loja: "Supermercado BH", tipoLoja: "supermercado" },
  { id: "3", nome: "Heineken Long Neck 330ml", marca: "Heineken", volume: 330, preco: 5.99, teorAlcoolico: 5.0, loja: "Supermercado BH", tipoLoja: "supermercado" },
  { id: "4", nome: "Corona Long Neck 330ml", marca: "Corona", volume: 330, preco: 6.49, teorAlcoolico: 4.6, loja: "Empório da Cerveja", tipoLoja: "adega" },
  { id: "5", nome: "Original Garrafa 600ml", marca: "Original", volume: 600, preco: 6.99, teorAlcoolico: 4.9, loja: "Boteco do Zé", tipoLoja: "boteco" },
  { id: "6", nome: "Bohemia Weiss 600ml", marca: "Bohemia", volume: 600, preco: 7.99, teorAlcoolico: 4.8, loja: "Bar do Zequinha", tipoLoja: "bar" },
  { id: "7", nome: "Devassa Litrão 1L", marca: "Devassa", volume: 1000, preco: 10.99, teorAlcoolico: 4.7, loja: "Supermercado BH", tipoLoja: "supermercado" },
  { id: "8", nome: "Stella Artois Long Neck 330ml", marca: "Stella Artois", volume: 330, preco: 5.49, teorAlcoolico: 5.0, loja: "Mercado Express", tipoLoja: "supermercado" },
  { id: "9", nome: "Budweiser Lata 350ml", marca: "Budweiser", volume: 350, preco: 3.89, teorAlcoolico: 5.0, loja: "Mercado Express", tipoLoja: "supermercado" },
  { id: "10", nome: "Eisenbahn Dark Lager 500ml", marca: "Eisenbahn", volume: 500, preco: 9.99, teorAlcoolico: 5.4, loja: "Empório da Cerveja", tipoLoja: "adega" },
  { id: "11", nome: "Colorado Appia 600ml", marca: "Colorado", volume: 600, preco: 11.99, teorAlcoolico: 5.0, loja: "Empório da Cerveja", tipoLoja: "adega" },
  { id: "12", nome: "Skol Beats Senses Lata 269ml", marca: "Skol Beats", volume: 269, preco: 4.49, teorAlcoolico: 8.0, loja: "Boteco do Zé", tipoLoja: "boteco" },
];

const TIPO_ICONE: Record<string, string> = {
  supermercado: "🏪",
  adega: "🍷",
  boteco: "🍻",
  bar: "🍹",
  aplicativo: "📱",
};

export default function CatalogoPage() {
  const [busca, setBusca] = useState("");
  const [filtroLoja, setFiltroLoja] = useState("todos");
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [comparando, setComparando] = useState(false);

  const lojas = ["todos", ...Array.from(new Set(CATALOGO_MOCK.map((c) => c.tipoLoja)))];

  const filtradas = CATALOGO_MOCK.filter((c) => {
    const matchBusca = busca === "" || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.marca.toLowerCase().includes(busca.toLowerCase());
    const matchLoja = filtroLoja === "todos" || c.tipoLoja === filtroLoja;
    return matchBusca && matchLoja;
  });

  const toggleSelecionada = (id: string) => {
    setSelecionadas((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 5) {
        toast.warning("Máximo 5 cervejas pra comparar!");
        return prev;
      }
      return [...prev, id];
    });
  };

  const cervejasSelecionadas = CATALOGO_MOCK.filter((c) => selecionadas.includes(c.id));

  const custoPorMl = (c: CervejaLoja) => c.preco / c.volume;
  const custoPorAlcool = (c: CervejaLoja) => {
    const mlAlcool = (c.volume * c.teorAlcoolico) / 100;
    return mlAlcool > 0 ? c.preco / mlAlcool : 999;
  };

  const maisBarata = cervejasSelecionadas.length > 0
    ? cervejasSelecionadas.reduce((a, b) => custoPorMl(a) < custoPorMl(b) ? a : b)
    : null;

  return (
    <Layout
      titulo="Catálogo"
      subtitulo="Compare preços entre estabelecimentos"
      emoji="🏪"
      accentColor="from-blue-500 to-cyan-400"
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cerveja ou marca..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              data-testid="input-busca-catalogo"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {lojas.map((loja) => (
            <button
              key={loja}
              onClick={() => setFiltroLoja(loja)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                filtroLoja === loja
                  ? "bg-blue-500 text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
              data-testid={`filtro-loja-${loja}`}
            >
              {TIPO_ICONE[loja] ?? "🏷️"} {loja.charAt(0).toUpperCase() + loja.slice(1)}
            </button>
          ))}
        </div>

        {selecionadas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/30 border border-blue-500/40 rounded-2xl p-3 flex items-center justify-between"
          >
            <span className="text-blue-300 text-sm font-medium">
              {selecionadas.length} cerveja{selecionadas.length > 1 ? "s" : ""} selecionada{selecionadas.length > 1 ? "s" : ""}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setComparando(true)}
              className="bg-blue-500 text-white text-sm font-bold px-4 py-1.5 rounded-full"
              data-testid="btn-comparar-catalogo"
            >
              Comparar!
            </motion.button>
          </motion.div>
        )}

        <div className="text-xs text-muted-foreground">
          {filtradas.length} resultado{filtradas.length !== 1 ? "s" : ""} • Toca pra selecionar e comparar
        </div>

        <div className="space-y-2">
          {filtradas.map((c) => {
            const selecionada = selecionadas.includes(c.id);
            const cpm = custoPorMl(c);
            const cpa = custoPorAlcool(c);
            const minimoNaLista = Math.min(...CATALOGO_MOCK.filter(x => x.marca === c.marca).map(x => custoPorMl(x)));
            const eBomPreco = cpm <= minimoNaLista * 1.05;
            return (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleSelecionada(c.id)}
                className={cn(
                  "bg-card border rounded-xl p-3 cursor-pointer transition-all",
                  selecionada ? "border-blue-500 bg-blue-900/20" : "border-border hover:border-border/80"
                )}
                data-testid={`card-cerveja-${c.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{TIPO_ICONE[c.tipoLoja]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{c.nome}</span>
                      {eBomPreco && (
                        <span className="bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded-full border border-green-500/30">
                          bom preço
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {c.loja} • {c.teorAlcoolico}% álc
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-primary font-bold">R${c.preco.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        R${(cpm * 100).toFixed(2)}/100ml
                      </span>
                      <span className="text-xs text-purple-400">
                        R${cpa.toFixed(3)}/ml álc
                      </span>
                    </div>
                  </div>
                  <div className={cn("w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center",
                    selecionada ? "border-blue-500 bg-blue-500" : "border-border"
                  )}>
                    {selecionada && <span className="text-white text-xs">✓</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {comparando && cervejasSelecionadas.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
              onClick={() => setComparando(false)}
            >
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-2xl text-foreground">Comparação</h3>
                  <button onClick={() => setComparando(false)} className="text-muted-foreground hover:text-foreground" data-testid="btn-fechar-comparacao">
                    ✕
                  </button>
                </div>

                {maisBarata && (
                  <div className="bg-green-900/30 border border-green-500/40 rounded-xl p-3 mb-4 text-center">
                    <div className="text-green-400 font-bold">🏆 Melhor custo-benefício</div>
                    <div className="text-white font-semibold mt-1">{maisBarata.nome}</div>
                    <div className="text-green-300 text-sm">{maisBarata.loja}</div>
                  </div>
                )}

                <div className="space-y-3">
                  {[...cervejasSelecionadas]
                    .sort((a, b) => custoPorMl(a) - custoPorMl(b))
                    .map((c, idx) => (
                      <div key={c.id} className={cn("rounded-xl p-3 border", idx === 0 ? "border-green-500/50 bg-green-900/20" : "border-border bg-secondary")}>
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground text-sm">{c.nome}</span>
                          <span className="text-primary font-bold">R${c.preco.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{c.loja}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div className="text-center bg-background rounded-lg p-1.5">
                            <div className="text-muted-foreground">R$/100ml</div>
                            <div className="font-bold text-foreground">R${(custoPorMl(c) * 100).toFixed(3)}</div>
                          </div>
                          <div className="text-center bg-background rounded-lg p-1.5">
                            <div className="text-muted-foreground">R$/ml álcool</div>
                            <div className="font-bold text-purple-400">R${custoPorAlcool(c).toFixed(3)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
