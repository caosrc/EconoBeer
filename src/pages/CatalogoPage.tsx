import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, ChevronRight, Loader2, ExternalLink,
  X, Truck, AlertCircle, RefreshCw, Search,
  ShoppingBag, Trophy, TrendingDown, Store,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";
import { buscarBebidas, type BuscarResponse, type ProdutoLoja, type LojaResultado } from "@/lib/api";

const CIDADES_ESTADOS: Record<string, string> = {
  "São Paulo - SP": "SP", "Rio de Janeiro - RJ": "RJ", "Belo Horizonte - MG": "MG",
  "Curitiba - PR": "PR", "Porto Alegre - RS": "RS", "Salvador - BA": "BA",
  "Fortaleza - CE": "CE", "Recife - PE": "PE", "Brasília - DF": "DF",
  "Manaus - AM": "AM", "Belém - PA": "PA", "Goiânia - GO": "GO",
  "Florianópolis - SC": "SC", "Campinas - SP": "SP", "Vitória - ES": "ES",
  "Natal - RN": "RN", "Maceió - AL": "AL", "Campo Grande - MS": "MS",
  "Teresina - PI": "PI", "João Pessoa - PB": "PB",
  "Conselheiro Lafaiete - MG": "MG", "Ouro Preto - MG": "MG",
  "Uberlândia - MG": "MG", "Juiz de Fora - MG": "MG",
  "Ribeirão Preto - SP": "SP", "Santos - SP": "SP",
  "São José dos Campos - SP": "SP", "Londrina - PR": "PR",
  "Maringá - PR": "PR", "Joinville - SC": "SC",
};
const TODAS_CIDADES = Object.keys(CIDADES_ESTADOS).sort();

const CIDADES_RAPIDAS = [
  "São Paulo - SP", "Rio de Janeiro - RJ", "Belo Horizonte - MG",
  "Curitiba - PR", "Porto Alegre - RS",
];

const BUSCAS_RAPIDAS = [
  { label: "🍺 Cervejas", q: "cerveja" },
  { label: "🍻 Pilsen", q: "cerveja pilsen" },
  { label: "🟡 Skol", q: "cerveja skol" },
  { label: "🍃 Heineken", q: "heineken" },
  { label: "🎉 Kit/Fardo", q: "fardo cerveja" },
  { label: "🍹 Drinks", q: "bebida alcoolica ready" },
];

function custoPorMl(p: ProdutoLoja): number | null {
  if (!p.volume || p.volume <= 0) return null;
  return p.preco / p.volume;
}

export default function CatalogoPage() {
  const [inputCidade, setInputCidade] = useState("");
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string | null>(null);
  const [buscaAtual, setBuscaAtual] = useState("cerveja");
  const [status, setStatus] = useState<"idle" | "buscando" | "ok" | "erro">("idle");
  const [msgErro, setMsgErro] = useState("");
  const [dados, setDados] = useState<BuscarResponse | null>(null);
  const [lojaAberta, setLojaAberta] = useState<LojaResultado | null>(null);
  const [filtroProduto, setFiltroProduto] = useState("");
  const [comparando, setComparando] = useState<ProdutoLoja[]>([]);
  const [verComparacao, setVerComparacao] = useState(false);
  const [stepMsg, setStepMsg] = useState("");

  const onInput = (v: string) => {
    setInputCidade(v);
    setSugestoes(v.length >= 2
      ? TODAS_CIDADES.filter(c => c.toLowerCase().includes(v.toLowerCase())).slice(0, 7)
      : []);
  };

  const buscar = async (cidade: string, q = buscaAtual) => {
    setSugestoes([]);
    setInputCidade(cidade);
    setCidadeSelecionada(cidade);
    setBuscaAtual(q);
    setStatus("buscando");
    setDados(null);
    setComparando([]);
    setMsgErro("");

    const estado = CIDADES_ESTADOS[cidade] ?? "";
    const steps = [
      `Abrindo catálogos de ${cidade}...`,
      "Entrando no site do Carrefour...",
      "Consultando Pão de Açúcar...",
      "Buscando no Extra...",
      "Comparando preços...",
    ];
    let i = 0;
    setStepMsg(steps[0]);
    const tick = setInterval(() => { i = Math.min(i + 1, steps.length - 1); setStepMsg(steps[i]); }, 1200);

    try {
      const res = await buscarBebidas(cidade, estado, q);
      clearInterval(tick);
      if (res.totalProdutos === 0) {
        setStatus("erro");
        setMsgErro("Nenhum produto encontrado nos sites consultados. Tente outra busca ou cidade.");
        return;
      }
      setDados(res);
      setStatus("ok");
      toast.success(`${res.totalProdutos} produtos em ${res.totalLojas} loja${res.totalLojas !== 1 ? "s" : ""}! 🍺`);
    } catch {
      clearInterval(tick);
      setStatus("erro");
      setMsgErro("Não foi possível conectar ao servidor de busca. Tente novamente em instantes.");
    }
  };

  const limpar = () => {
    setInputCidade(""); setSugestoes([]); setCidadeSelecionada(null);
    setStatus("idle"); setDados(null); setComparando([]);
  };

  const toggleComparando = (p: ProdutoLoja) => {
    setComparando(prev => {
      if (prev.find(x => x.id === p.id)) return prev.filter(x => x.id !== p.id);
      if (prev.length >= 6) { toast.warning("Máximo 6 produtos pra comparar!"); return prev; }
      return [...prev, p];
    });
  };

  const produtosLoja = lojaAberta
    ? lojaAberta.produtos.filter(p =>
        filtroProduto === "" || p.nome.toLowerCase().includes(filtroProduto.toLowerCase())
      )
    : [];

  const comparadosOrdenados = [...comparando].sort((a, b) => a.preco - b.preco);

  return (
    <Layout titulo="Catálogo" subtitulo="Busca preços reais nos sites dos supermercados" emoji="🏪" accentColor="from-blue-500 to-cyan-400">
      <div className="space-y-4">

        {/* ── Campo de cidade ── */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <MapPin size={14} className="text-blue-400" /> Qual é a sua cidade?
          </label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Digite a cidade... ex: Belo Horizonte - MG"
              value={inputCidade}
              onChange={e => onInput(e.target.value)}
              disabled={status === "buscando"}
              className="w-full bg-secondary border border-border rounded-xl pl-9 pr-9 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              data-testid="input-cidade"
            />
            {inputCidade && status !== "buscando" && (
              <button onClick={limpar} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" data-testid="btn-limpar">
                <X size={15} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {sugestoes.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-2 bg-secondary border border-border rounded-xl overflow-hidden shadow-xl z-10 relative">
                {sugestoes.map(c => (
                  <button key={c} onClick={() => buscar(c)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-border/60 transition-colors text-left"
                    data-testid={`sug-${c}`}>
                    <MapPin size={13} className="text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-foreground flex-1">{c}</span>
                    <ChevronRight size={13} className="text-muted-foreground" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {status === "idle" && !inputCidade && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground">Cidades populares:</p>
              <div className="flex flex-wrap gap-1.5">
                {CIDADES_RAPIDAS.map(c => (
                  <button key={c} onClick={() => buscar(c)}
                    className="text-xs bg-secondary hover:bg-border px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`cidade-${c}`}>{c}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Filtros de busca rápida ── */}
        {status !== "buscando" && cidadeSelecionada && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {BUSCAS_RAPIDAS.map(b => (
              <button key={b.q} onClick={() => buscar(cidadeSelecionada, b.q)}
                className={cn("flex-shrink-0 text-xs px-3 py-2 rounded-full font-medium transition-colors",
                  buscaAtual === b.q ? "bg-blue-500 text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}
                data-testid={`busca-${b.q}`}>
                {b.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        <AnimatePresence>
          {status === "buscando" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-card border border-blue-500/30 rounded-2xl p-8 text-center space-y-4">
              <Loader2 size={40} className="text-blue-400 animate-spin mx-auto" />
              <div>
                <div className="font-display text-2xl text-foreground">Acessando os sites...</div>
                <motion.p key={stepMsg} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="text-blue-300 text-sm mt-1">{stepMsg}</motion.p>
              </div>
              <p className="text-muted-foreground text-xs">
                Entrando nos catálogos online de <strong className="text-foreground">{cidadeSelecionada}</strong> e buscando: <strong className="text-blue-300">"{buscaAtual}"</strong>
              </p>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Erro ── */}
        <AnimatePresence>
          {status === "erro" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-500/40 rounded-2xl p-5 text-center space-y-2">
              <AlertCircle size={28} className="text-red-400 mx-auto" />
              <p className="text-red-300 text-sm">{msgErro}</p>
              {cidadeSelecionada && (
                <button onClick={() => buscar(cidadeSelecionada)}
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mt-1"
                  data-testid="btn-tentar-novamente">
                  <RefreshCw size={14} /> Tentar novamente
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Resultados ── */}
        <AnimatePresence>
          {status === "ok" && dados && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Cabeçalho */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <span className="font-display text-xl text-foreground">📍 {dados.cidade}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {dados.totalProdutos} produtos em {dados.totalLojas} loja{dados.totalLojas !== 1 ? "s" : ""} •{" "}
                    {dados.lojasFalha.length > 0 && (
                      <span className="text-yellow-500">{dados.lojasFalha.length} site{dados.lojasFalha.length !== 1 ? "s" : ""} indisponível{dados.lojasFalha.length !== 1 ? "eis" : ""}</span>
                    )}
                  </p>
                </div>
                {comparando.length > 0 && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setVerComparacao(true)}
                    className="bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-full flex items-center gap-1.5"
                    data-testid="btn-comparar-flutuante">
                    <TrendingDown size={12} /> Comparar {comparando.length}
                  </motion.button>
                )}
              </div>

              {/* Sites que não responderam */}
              {dados.lojasFalha.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl px-4 py-2.5">
                  <p className="text-xs text-yellow-400">
                    ⚠️ Sites sem resposta: {dados.lojasFalha.map(l => l.nome).join(", ")}
                  </p>
                </div>
              )}

              {/* Melhores preços */}
              {dados.melhoresPrecos.length > 0 && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy size={16} className="text-yellow-400" />
                    <span className="text-green-400 font-bold text-sm">Melhores preços agora em {dados.cidade}</span>
                  </div>
                  <div className="space-y-2">
                    {dados.melhoresPrecos.slice(0, 5).map((p, i) => {
                      const cpm = custoPorMl(p);
                      return (
                        <div key={p.id + i} className="flex items-center gap-3">
                          <span className="text-muted-foreground text-xs w-4">{i + 1}.</span>
                          <span className="text-foreground text-xs flex-1 truncate">{p.nome.slice(0, 42)}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-green-400 font-bold text-sm">R${p.preco.toFixed(2)}</span>
                            {cpm && <span className="text-muted-foreground text-xs hidden sm:inline">R${(cpm * 100).toFixed(2)}/100ml</span>}
                            <span className="text-xs text-muted-foreground">{p.logoLoja}</span>
                            <a href={p.link} target="_blank" rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300">
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cards das lojas */}
              <div className="space-y-3">
                <h3 className="font-display text-xl text-foreground">Lojas encontradas</h3>
                {dados.lojas.map((loja, idx) => {
                  const menorPreco = Math.min(...loja.produtos.map(p => p.preco));
                  const maiorPreco = Math.max(...loja.produtos.map(p => p.preco));
                  return (
                    <motion.div key={loja.loja} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden">
                      <button
                        onClick={() => { setLojaAberta(loja); setFiltroProduto(""); }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left"
                        data-testid={`btn-loja-${idx}`}>
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {loja.logoLoja}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground">{loja.loja}</span>
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground capitalize">{loja.tipoLoja}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {loja.totalEncontrado} produto{loja.totalEncontrado !== 1 ? "s" : ""} encontrado{loja.totalEncontrado !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-green-400 font-medium">A partir de R${menorPreco.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">até R${maiorPreco.toFixed(2)}</span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modal: produtos de uma loja ── */}
      <AnimatePresence>
        {lojaAberta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setLojaAberta(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg h-[88vh] sm:max-h-[85vh] flex flex-col overflow-hidden">

              <div className="p-4 border-b border-border flex-shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lojaAberta.logoLoja}</span>
                    <div>
                      <div className="font-semibold text-foreground">{lojaAberta.loja}</div>
                      <a href={lojaAberta.urlLoja} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        {lojaAberta.urlLoja} <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                  <button onClick={() => setLojaAberta(null)} className="text-muted-foreground hover:text-foreground" data-testid="btn-fechar-loja">
                    <X size={20} />
                  </button>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input type="text" placeholder="Filtrar produtos..." value={filtroProduto}
                    onChange={e => setFiltroProduto(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg pl-8 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                    data-testid="input-filtro-produto" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {produtosLoja.length === 0
                  ? <p className="text-center py-8 text-muted-foreground text-sm">Nenhum produto encontrado</p>
                  : produtosLoja.map(p => {
                    const isSel = comparando.some(x => x.id === p.id);
                    const cpm = custoPorMl(p);
                    return (
                      <motion.div key={p.id} whileTap={{ scale: 0.98 }}
                        className={cn("flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                          isSel ? "border-blue-500 bg-blue-900/20" : "border-border bg-secondary hover:bg-secondary/60")}
                        data-testid={`prod-${p.id}`}>
                        {p.imagem
                          ? <img src={p.imagem} alt="" className="w-14 h-14 object-contain rounded-lg bg-white/5 flex-shrink-0"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          : <div className="w-14 h-14 rounded-lg bg-secondary/50 flex items-center justify-center text-2xl flex-shrink-0">🍺</div>
                        }
                        <div className="flex-1 min-w-0" onClick={() => toggleComparando(p)}>
                          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{p.nome}</p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-primary font-bold">R${p.preco.toFixed(2)}</span>
                            {p.precoOriginal && p.precoOriginal > p.preco && (
                              <span className="text-xs text-muted-foreground line-through">R${p.precoOriginal.toFixed(2)}</span>
                            )}
                            {cpm && <span className="text-xs text-muted-foreground">R${(cpm * 100).toFixed(2)}/100ml</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <a href={p.link} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="w-9 h-9 bg-primary rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                            data-testid={`comprar-${p.id}`}>
                            <ExternalLink size={14} className="text-primary-foreground" />
                          </a>
                          <div onClick={() => toggleComparando(p)}
                            className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              isSel ? "border-blue-500 bg-blue-500" : "border-border")}>
                            {isSel && <span className="text-white text-xs leading-none">✓</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              {comparando.length > 0 && (
                <div className="p-4 border-t border-border flex-shrink-0">
                  <button onClick={() => { setLojaAberta(null); setVerComparacao(true); }}
                    className="w-full bg-blue-500 text-white font-bold rounded-xl py-3 text-sm"
                    data-testid="btn-abrir-comparacao">
                    Comparar {comparando.length} produto{comparando.length !== 1 ? "s" : ""} →
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: comparação ── */}
      <AnimatePresence>
        {verComparacao && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setVerComparacao(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">

              <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="font-display text-2xl text-foreground">Comparação Real</h3>
                  <p className="text-xs text-muted-foreground">Preços coletados agora dos sites</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setComparando([])} className="text-xs text-destructive" data-testid="btn-limpar-comp">Limpar</button>
                  <button onClick={() => setVerComparacao(false)} className="text-muted-foreground hover:text-foreground" data-testid="btn-fechar-comp"><X size={20} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {comparadosOrdenados.map((p, idx) => {
                  const melhor = idx === 0;
                  const piorPreco = comparadosOrdenados[comparadosOrdenados.length - 1]?.preco ?? p.preco;
                  const economia = piorPreco - p.preco;
                  const cpm = custoPorMl(p);
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      className={cn("rounded-2xl border p-4", melhor ? "border-green-500/60 bg-green-900/20" : "border-border bg-secondary")}>
                      {melhor && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Trophy size={13} className="text-yellow-400" />
                          <span className="text-green-400 text-xs font-bold">MELHOR PREÇO</span>
                        </div>
                      )}
                      <div className="flex gap-3 items-start">
                        {p.imagem && (
                          <img src={p.imagem} alt="" className="w-14 h-14 object-contain rounded-lg bg-white/5 flex-shrink-0"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{p.nome}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{p.logoLoja} {p.loja}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className={cn("font-bold text-lg", melhor ? "text-green-400" : "text-foreground")}>
                              R${p.preco.toFixed(2)}
                            </span>
                            {cpm && <span className="text-xs text-muted-foreground">R${(cpm * 100).toFixed(2)}/100ml</span>}
                          </div>
                          {melhor && economia > 0.01 && (
                            <p className="text-green-400 text-xs mt-1 font-medium">
                              💰 Economiza até R${economia.toFixed(2)} vs. o mais caro
                            </p>
                          )}
                        </div>
                        <a href={p.link} target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 bg-primary rounded-full flex items-center justify-center hover:opacity-80 flex-shrink-0 self-center"
                          data-testid={`comprar-comp-${p.id}`}>
                          <ExternalLink size={14} className="text-primary-foreground" />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
