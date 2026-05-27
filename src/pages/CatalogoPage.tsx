import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, ChevronRight, Loader2, ExternalLink,
  X, ShoppingCart, Truck, Star, AlertCircle, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";
import {
  buscarCervejasMercadoLivre,
  melhorPrecoPorProduto,
  type VendedorAgrupado,
  type MLProdutoFormatado,
} from "@/lib/mercadolivre";

/* ─── Mapeamento cidade → estado ─────────────────────────────────── */
const CIDADES_ESTADOS: Record<string, string> = {
  "São Paulo - SP": "SP", "Rio de Janeiro - RJ": "RJ", "Belo Horizonte - MG": "MG",
  "Curitiba - PR": "PR", "Porto Alegre - RS": "RS", "Salvador - BA": "BA",
  "Fortaleza - CE": "CE", "Recife - PE": "PE", "Brasília - DF": "DF",
  "Manaus - AM": "AM", "Belém - PA": "PA", "Goiânia - GO": "GO",
  "Florianópolis - SC": "SC", "Campinas - SP": "SP", "Vitória - ES": "ES",
  "Natal - RN": "RN", "Maceió - AL": "AL", "Campo Grande - MS": "MS",
  "Teresina - PI": "PI", "João Pessoa - PB": "PB", "Conselheiro Lafaiete - MG": "MG",
  "Ouro Preto - MG": "MG", "Uberlândia - MG": "MG", "Juiz de Fora - MG": "MG",
  "Ribeirão Preto - SP": "SP", "Santos - SP": "SP", "São José dos Campos - SP": "SP",
  "Londrina - PR": "PR", "Maringá - PR": "PR", "Joinville - SC": "SC",
  "Sorocaba - SP": "SP", "Niterói - RJ": "RJ", "Duque de Caxias - RJ": "RJ",
  "Pelotas - RS": "RS", "Caxias do Sul - RS": "RS", "Contagem - MG": "MG",
  "Aracaju - SE": "SE", "Porto Velho - RO": "RO", "Macapá - AP": "AP",
  "Rio Branco - AC": "AC", "Palmas - TO": "TO", "São Luís - MA": "MA",
  "Cuiabá - MT": "MT", "Boa Vista - RR": "RR",
};

const TODAS_CIDADES = Object.keys(CIDADES_ESTADOS).sort();

/* ─── Ícone por tipo de loja ─────────────────────────────────────── */
function labelVendedor(nome: string): { emoji: string; tipo: string } {
  const n = nome.toLowerCase();
  if (n.includes("mercado") || n.includes("super") || n.includes("hipermercado")) return { emoji: "🏪", tipo: "Supermercado" };
  if (n.includes("adega") || n.includes("empório") || n.includes("emporio")) return { emoji: "🍷", tipo: "Adega" };
  if (n.includes("atac") || n.includes("distribuidora") || n.includes("distrib")) return { emoji: "📦", tipo: "Atacado" };
  if (n.includes("bar") || n.includes("boteco") || n.includes("botequim")) return { emoji: "🍻", tipo: "Bar/Boteco" };
  return { emoji: "🛒", tipo: "Loja Online" };
}

/* ─── Componente principal ───────────────────────────────────────── */
export default function CatalogoPage() {
  const [inputCidade, setInputCidade] = useState("");
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "buscando" | "ok" | "erro">("idle");
  const [msgErro, setMsgErro] = useState("");
  const [vendedores, setVendedores] = useState<VendedorAgrupado[]>([]);
  const [vendedorAberto, setVendedorAberto] = useState<VendedorAgrupado | null>(null);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [selecionados, setSelecionados] = useState<{ produto: MLProdutoFormatado; vendedor: string }[]>([]);
  const [verComparacao, setVerComparacao] = useState(false);
  const [stepBusca, setStepBusca] = useState("");

  /* ── autocomplete ────────────────────────────────────────────── */
  const onInput = (v: string) => {
    setInputCidade(v);
    if (v.length >= 2) {
      setSugestoes(TODAS_CIDADES.filter((c) => c.toLowerCase().includes(v.toLowerCase())).slice(0, 7));
    } else {
      setSugestoes([]);
    }
  };

  /* ── busca real ──────────────────────────────────────────────── */
  const buscar = async (cidade: string) => {
    setSugestoes([]);
    setInputCidade(cidade);
    setCidadeSelecionada(cidade);
    setStatus("buscando");
    setVendedores([]);
    setSelecionados([]);
    setMsgErro("");

    const estado = CIDADES_ESTADOS[cidade] ?? "";

    const steps = [
      "Conectando ao Mercado Livre...",
      "Buscando cervejas e bebidas...",
      "Filtrando vendedores...",
      "Organizando resultados...",
    ];
    let s = 0;
    setStepBusca(steps[0]);
    const tick = setInterval(() => {
      s = (s + 1) % steps.length;
      setStepBusca(steps[s]);
    }, 900);

    try {
      const resultado = await buscarCervejasMercadoLivre(cidade, estado);
      clearInterval(tick);
      if (resultado.length === 0) {
        setStatus("erro");
        setMsgErro("Nenhum resultado encontrado para essa cidade. Tente outra cidade ou verifique sua conexão.");
        return;
      }
      setVendedores(resultado);
      setStatus("ok");
      toast.success(`${resultado.length} vendedores encontrados com preços reais! 🍺`);
    } catch (e: unknown) {
      clearInterval(tick);
      const msg = e instanceof Error ? e.message : "";
      if (msg === "nenhum_resultado") {
        setStatus("erro");
        setMsgErro("Nenhuma cerveja encontrada. Tente outra cidade.");
      } else {
        setStatus("erro");
        setMsgErro("Não foi possível conectar ao Mercado Livre. Verifique sua conexão e tente novamente.");
      }
    }
  };

  const limpar = () => {
    setInputCidade(""); setSugestoes([]); setCidadeSelecionada(null);
    setStatus("idle"); setVendedores([]); setSelecionados([]);
  };

  const toggleSel = (produto: MLProdutoFormatado, vendedor: string) => {
    setSelecionados((prev) => {
      const existe = prev.find((s) => s.produto.id === produto.id);
      if (existe) return prev.filter((s) => s.produto.id !== produto.id);
      if (prev.filter((s) => s.produto.nome.slice(0, 20) === produto.nome.slice(0, 20)).length >= 5) {
        toast.warning("Máximo 5 itens do mesmo produto pra comparar!");
        return prev;
      }
      return [...prev, { produto, vendedor }];
    });
  };

  const produtosFiltrados = vendedorAberto
    ? vendedorAberto.produtos.filter(
        (p) => buscaProduto === "" || p.nome.toLowerCase().includes(buscaProduto.toLowerCase())
      )
    : [];

  const melhores = status === "ok" ? melhorPrecoPorProduto(vendedores) : [];

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <Layout
      titulo="Catálogo"
      subtitulo="Preços reais do Mercado Livre na sua cidade"
      emoji="🏪"
      accentColor="from-blue-500 to-cyan-400"
    >
      <div className="space-y-4">

        {/* ── Busca de cidade ───────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <MapPin size={14} className="text-blue-400" />
            Qual é a sua cidade?
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Digite a cidade... ex: Belo Horizonte - MG"
              value={inputCidade}
              onChange={(e) => onInput(e.target.value)}
              disabled={status === "buscando"}
              className="w-full bg-secondary border border-border rounded-xl pl-9 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              data-testid="input-cidade"
            />
            {inputCidade && status !== "buscando" && (
              <button onClick={limpar} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" data-testid="btn-limpar">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sugestões */}
          <AnimatePresence>
            {sugestoes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="mt-2 bg-secondary border border-border rounded-xl overflow-hidden shadow-lg">
                {sugestoes.map((c) => (
                  <button key={c} onClick={() => buscar(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-border/50 transition-colors text-left"
                    data-testid={`sugestao-${c}`}>
                    <MapPin size={13} className="text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-foreground flex-1">{c}</span>
                    <ChevronRight size={13} className="text-muted-foreground" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cidades populares */}
          {status === "idle" && !inputCidade && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Cidades populares:</p>
              <div className="flex flex-wrap gap-2">
                {["São Paulo - SP", "Rio de Janeiro - RJ", "Belo Horizonte - MG", "Curitiba - PR", "Porto Alegre - RS"].map((c) => (
                  <button key={c} onClick={() => buscar(c)}
                    className="text-xs bg-secondary hover:bg-border px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`cidade-rapida-${c}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Loading ───────────────────────────────────────── */}
        <AnimatePresence>
          {status === "buscando" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-card border border-blue-500/30 rounded-2xl p-8 text-center">
              <Loader2 size={36} className="text-blue-400 animate-spin mx-auto mb-4" />
              <div className="font-display text-2xl text-foreground mb-1">Buscando preços reais...</div>
              <p className="text-blue-300 text-sm">{stepBusca}</p>
              <p className="text-muted-foreground text-xs mt-3">
                Consultando o Mercado Livre em tempo real para <strong className="text-foreground">{cidadeSelecionada}</strong>
              </p>
              <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Erro ─────────────────────────────────────────── */}
        <AnimatePresence>
          {status === "erro" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-500/40 rounded-2xl p-5 text-center">
              <AlertCircle size={28} className="text-red-400 mx-auto mb-2" />
              <p className="text-red-300 text-sm">{msgErro}</p>
              <button onClick={() => cidadeSelecionada && buscar(cidadeSelecionada)}
                className="mt-3 flex items-center gap-2 mx-auto text-sm text-blue-400 hover:text-blue-300"
                data-testid="btn-tentar-novamente">
                <RefreshCw size={14} /> Tentar novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Resultados ───────────────────────────────────── */}
        <AnimatePresence>
          {status === "ok" && vendedores.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

              {/* Cabeçalho */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-display text-xl text-foreground">📍 {cidadeSelecionada}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {vendedores.length} vendedores • dados ao vivo do Mercado Livre
                  </p>
                </div>
                {selecionados.length > 0 && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setVerComparacao(true)}
                    className="bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-full flex items-center gap-1.5"
                    data-testid="btn-ver-comparacao">
                    Comparar {selecionados.length} item{selecionados.length !== 1 ? "s" : ""}
                  </motion.button>
                )}
              </div>

              {/* Aviso de origem dos dados */}
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <ShoppingCart size={14} className="text-blue-400 flex-shrink-0" />
                <p className="text-xs text-blue-300">
                  Preços reais do Mercado Livre — clique no produto para comprar direto no site.
                </p>
              </div>

              {/* Melhores preços do momento */}
              {melhores.length > 0 && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-4">
                  <div className="text-green-400 font-bold text-sm mb-2">🏆 Melhores preços agora em {cidadeSelecionada}</div>
                  <div className="space-y-1.5">
                    {melhores.map((m) => m.melhor && (
                      <div key={m.nome} className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-xs truncate flex-1">{m.nome.slice(0, 45)}</span>
                        <a href={m.melhor.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-400 font-bold text-xs hover:text-green-300 flex-shrink-0">
                          R${m.melhor.preco.toFixed(2)}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cards de vendedores */}
              {vendedores.map((v, idx) => {
                const { emoji, tipo } = labelVendedor(v.nome);
                const menorPreco = Math.min(...v.produtos.map((p) => p.preco));
                const temFrete = v.fretesGratis > 0;
                return (
                  <motion.div key={v.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden">
                    <button
                      onClick={() => { setVendedorAberto(v); setBuscaProduto(""); }}
                      className="w-full p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left"
                      data-testid={`btn-vendedor-${v.id}`}>
                      <div className="text-3xl">{emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground text-sm truncate max-w-[160px]">{v.nome}</span>
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{tipo}</span>
                          {temFrete && (
                            <span className="text-xs flex items-center gap-1 bg-green-900/40 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                              <Truck size={10} /> frete grátis
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {v.cidade || cidadeSelecionada} • {v.totalProdutos} produto{v.totalProdutos !== 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-blue-400 mt-1 font-medium">
                          A partir de R${menorPreco.toFixed(2)}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modal: produtos do vendedor ──────────────────────────── */}
      <AnimatePresence>
        {vendedorAberto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setVendedorAberto(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg h-[88vh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden">

              {/* Header */}
              <div className="p-4 border-b border-border flex-shrink-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{labelVendedor(vendedorAberto.nome).emoji}</span>
                    <div>
                      <div className="font-semibold text-foreground leading-tight">{vendedorAberto.nome}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {vendedorAberto.cidade || cidadeSelecionada} • {vendedorAberto.totalProdutos} produtos
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setVendedorAberto(null)} className="text-muted-foreground hover:text-foreground p-1" data-testid="btn-fechar-vendedor">
                    <X size={20} />
                  </button>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input type="text" placeholder="Buscar produto..." value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg pl-8 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                    data-testid="input-busca-produto" />
                </div>
              </div>

              {/* Lista */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {produtosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Nenhum produto encontrado</div>
                ) : (
                  produtosFiltrados.map((p) => {
                    const isSel = selecionados.some((s) => s.produto.id === p.id);
                    const custoPorMl = p.volume ? p.preco / p.volume : null;
                    return (
                      <motion.div key={p.id} whileTap={{ scale: 0.98 }}
                        className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                          isSel ? "border-blue-500 bg-blue-900/20" : "border-border bg-secondary hover:bg-secondary/60")}
                        data-testid={`produto-${p.id}`}>
                        {/* Imagem */}
                        {p.imagem ? (
                          <img src={p.imagem} alt={p.nome} className="w-14 h-14 object-contain rounded-lg bg-white/5 flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center text-2xl flex-shrink-0">🍺</div>
                        )}
                        {/* Info */}
                        <div className="flex-1 min-w-0" onClick={() => toggleSel(p, vendedorAberto.nome)}>
                          <div className="text-sm font-medium text-foreground leading-tight line-clamp-2">{p.nome}</div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-primary font-bold">R${p.preco.toFixed(2)}</span>
                            {p.precoOriginal && p.precoOriginal > p.preco && (
                              <span className="text-xs text-muted-foreground line-through">R${p.precoOriginal.toFixed(2)}</span>
                            )}
                            {custoPorMl && (
                              <span className="text-xs text-muted-foreground">R${(custoPorMl * 100).toFixed(2)}/100ml</span>
                            )}
                          </div>
                          {p.fretesGratis && (
                            <span className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                              <Truck size={10} /> Frete grátis
                            </span>
                          )}
                        </div>
                        {/* Ações */}
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <a href={p.link} target="_blank" rel="noopener noreferrer"
                            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`link-comprar-${p.id}`}>
                            <ExternalLink size={14} className="text-primary-foreground" />
                          </a>
                          <div onClick={() => toggleSel(p, vendedorAberto.nome)}
                            className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              isSel ? "border-blue-500 bg-blue-500" : "border-border")}>
                            {isSel && <span className="text-white text-xs leading-none">✓</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {selecionados.length > 0 && (
                <div className="p-4 border-t border-border flex-shrink-0">
                  <button onClick={() => { setVendedorAberto(null); setVerComparacao(true); }}
                    className="w-full bg-blue-500 text-white font-bold rounded-xl py-3 text-sm"
                    data-testid="btn-comparar-modal">
                    Comparar {selecionados.length} item{selecionados.length !== 1 ? "s" : ""} selecionado{selecionados.length !== 1 ? "s" : ""}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: comparação ────────────────────────────────────── */}
      <AnimatePresence>
        {verComparacao && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setVerComparacao(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                <h3 className="font-display text-2xl text-foreground">Comparação de Preços</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelecionados([])} className="text-xs text-destructive hover:text-red-400" data-testid="btn-limpar-sel">Limpar</button>
                  <button onClick={() => setVerComparacao(false)} className="text-muted-foreground hover:text-foreground" data-testid="btn-fechar-comp"><X size={20} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selecionados.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">Nenhum produto selecionado</p>
                ) : (
                  [...selecionados]
                    .sort((a, b) => a.produto.preco - b.produto.preco)
                    .map((s, idx) => {
                      const custoPorMl = s.produto.volume ? s.produto.preco / s.produto.volume : null;
                      const melhorItem = idx === 0;
                      const economia = selecionados.length > 1
                        ? Math.max(...selecionados.map((x) => x.produto.preco)) - s.produto.preco
                        : 0;
                      return (
                        <motion.div key={s.produto.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          className={cn("rounded-2xl border p-4", melhorItem ? "border-green-500/60 bg-green-900/20" : "border-border bg-secondary")}>
                          {melhorItem && (
                            <div className="text-green-400 text-xs font-bold mb-2 flex items-center gap-1">
                              🏆 MELHOR PREÇO
                            </div>
                          )}
                          <div className="flex gap-3">
                            {s.produto.imagem && (
                              <img src={s.produto.imagem} alt="" className="w-14 h-14 object-contain rounded-lg bg-white/5 flex-shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground line-clamp-2">{s.produto.nome}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{s.vendedor}</div>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={cn("font-bold text-lg", melhorItem ? "text-green-400" : "text-foreground")}>
                                  R${s.produto.preco.toFixed(2)}
                                </span>
                                {custoPorMl && (
                                  <span className="text-xs text-muted-foreground">R${(custoPorMl * 100).toFixed(2)}/100ml</span>
                                )}
                              </div>
                              {melhorItem && economia > 0.01 && (
                                <div className="text-green-400 text-xs mt-1">💰 Economiza até R${economia.toFixed(2)}</div>
                              )}
                            </div>
                            <a href={s.produto.link} target="_blank" rel="noopener noreferrer"
                              className="flex-shrink-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center hover:opacity-80 self-center"
                              data-testid={`link-comp-${s.produto.id}`}>
                              <ExternalLink size={15} className="text-primary-foreground" />
                            </a>
                          </div>
                        </motion.div>
                      );
                    })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
