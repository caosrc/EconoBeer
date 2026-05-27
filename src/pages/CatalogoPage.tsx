import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Store, ChevronRight, ArrowLeft, Loader2, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

interface Produto {
  id: string;
  nome: string;
  marca: string;
  volume: number;
  preco: number;
  teorAlcoolico: number;
  tipo: string;
  categoria: "cerveja" | "energetico" | "drinks" | "vinho" | "destilado";
  imagem?: string;
}

interface Estabelecimento {
  id: string;
  nome: string;
  tipo: "supermercado" | "adega" | "app-delivery" | "atacado" | "mercadinho";
  bairro: string;
  avaliacao: number;
  produtos: Produto[];
  urlCatalogo?: string;
  entrega: boolean;
  tempoEntrega?: string;
}

type CidadeData = Record<string, Estabelecimento[]>;

const CIDADES_BR: string[] = [
  "São Paulo - SP",
  "Rio de Janeiro - RJ",
  "Belo Horizonte - MG",
  "Curitiba - PR",
  "Porto Alegre - RS",
  "Salvador - BA",
  "Fortaleza - CE",
  "Recife - PE",
  "Brasília - DF",
  "Manaus - AM",
  "Belém - PA",
  "Goiânia - GO",
  "Florianópolis - SC",
  "Campinas - SP",
  "Vitória - ES",
  "Natal - RN",
  "Maceió - AL",
  "Campo Grande - MS",
  "Teresina - PI",
  "João Pessoa - PB",
  "Conselheiro Lafaiete - MG",
  "Ouro Preto - MG",
  "Uberlândia - MG",
  "Juiz de Fora - MG",
  "Ribeirão Preto - SP",
  "Santos - SP",
  "São José dos Campos - SP",
  "Londrina - PR",
  "Maringá - PR",
  "Joinville - SC",
];

const PRODUTOS_BASE: Record<string, Partial<Produto>[]> = {
  cervejas_comuns: [
    { nome: "Skol Lata 350ml", marca: "Skol", volume: 350, teorAlcoolico: 4.7, tipo: "Pilsen", categoria: "cerveja" },
    { nome: "Brahma Lata 350ml", marca: "Brahma", volume: 350, teorAlcoolico: 5.0, tipo: "Pilsen", categoria: "cerveja" },
    { nome: "Antartica Lata 350ml", marca: "Antarctica", volume: 350, teorAlcoolico: 5.0, tipo: "Pilsen", categoria: "cerveja" },
    { nome: "Itaipava Lata 350ml", marca: "Itaipava", volume: 350, teorAlcoolico: 4.6, tipo: "Pilsen", categoria: "cerveja" },
    { nome: "Heineken Long Neck 330ml", marca: "Heineken", volume: 330, teorAlcoolico: 5.0, tipo: "Lager", categoria: "cerveja" },
    { nome: "Stella Artois Long Neck 330ml", marca: "Stella Artois", volume: 330, teorAlcoolico: 5.0, tipo: "Lager", categoria: "cerveja" },
    { nome: "Corona Long Neck 330ml", marca: "Corona", volume: 330, teorAlcoolico: 4.6, tipo: "Pilsen", categoria: "cerveja" },
    { nome: "Budweiser Lata 350ml", marca: "Budweiser", volume: 350, teorAlcoolico: 5.0, tipo: "Lager", categoria: "cerveja" },
    { nome: "Original Garrafa 600ml", marca: "Original", volume: 600, teorAlcoolico: 4.9, tipo: "Pilsen", categoria: "cerveja" },
    { nome: "Brahma Litrão 1L", marca: "Brahma", volume: 1000, teorAlcoolico: 5.0, tipo: "Pilsen", categoria: "cerveja" },
    { nome: "Devassa Weiss 600ml", marca: "Devassa", volume: 600, teorAlcoolico: 4.7, tipo: "Weiss", categoria: "cerveja" },
    { nome: "Eisenbahn Lager 355ml", marca: "Eisenbahn", volume: 355, teorAlcoolico: 4.8, tipo: "Lager", categoria: "cerveja" },
    { nome: "Colorado Appia 600ml", marca: "Colorado", volume: 600, teorAlcoolico: 5.0, tipo: "Lager", categoria: "cerveja" },
    { nome: "Bohemia Weiss 600ml", marca: "Bohemia", volume: 600, teorAlcoolico: 4.8, tipo: "Weiss", categoria: "cerveja" },
    { nome: "Skol Beats Senses 269ml", marca: "Skol Beats", volume: 269, teorAlcoolico: 8.0, tipo: "Ice", categoria: "cerveja" },
  ],
  bebidas_especiais: [
    { nome: "Red Bull 250ml", marca: "Red Bull", volume: 250, teorAlcoolico: 0, tipo: "Energético", categoria: "energetico" },
    { nome: "Monster Energy 473ml", marca: "Monster", volume: 473, teorAlcoolico: 0, tipo: "Energético", categoria: "energetico" },
    { nome: "Jack Daniel's Honey 275ml", marca: "Jack Daniel's", volume: 275, teorAlcoolico: 35, tipo: "Ready-to-Drink", categoria: "drinks" },
    { nome: "Smirnoff Ice 275ml", marca: "Smirnoff", volume: 275, teorAlcoolico: 4.5, tipo: "Vodka Ice", categoria: "drinks" },
  ],
};

function gerarProdutos(baseProdutos: Partial<Produto>[], multiplicadorPreco: number): Produto[] {
  return baseProdutos.map((p, i) => {
    const precoBase: Record<string, number> = {
      "Skol Lata 350ml": 2.89,
      "Brahma Lata 350ml": 3.19,
      "Antartica Lata 350ml": 2.99,
      "Itaipava Lata 350ml": 2.49,
      "Heineken Long Neck 330ml": 5.49,
      "Stella Artois Long Neck 330ml": 5.29,
      "Corona Long Neck 330ml": 6.29,
      "Budweiser Lata 350ml": 3.79,
      "Original Garrafa 600ml": 6.49,
      "Brahma Litrão 1L": 9.99,
      "Devassa Weiss 600ml": 7.99,
      "Eisenbahn Lager 355ml": 6.49,
      "Colorado Appia 600ml": 11.99,
      "Bohemia Weiss 600ml": 7.49,
      "Skol Beats Senses 269ml": 4.29,
      "Red Bull 250ml": 12.99,
      "Monster Energy 473ml": 9.99,
      "Jack Daniel's Honey 275ml": 9.99,
      "Smirnoff Ice 275ml": 5.99,
    };
    const base = precoBase[p.nome ?? ""] ?? 5.0;
    const variacao = 1 + (Math.random() * 0.2 - 0.1);
    const preco = Number((base * multiplicadorPreco * variacao).toFixed(2));
    return {
      id: `prod-${i}-${Date.now()}`,
      nome: p.nome ?? "",
      marca: p.marca ?? "",
      volume: p.volume ?? 350,
      preco,
      teorAlcoolico: p.teorAlcoolico ?? 5.0,
      tipo: p.tipo ?? "Pilsen",
      categoria: p.categoria ?? "cerveja",
    };
  });
}

function gerarEstabelecimentos(cidade: string): Estabelecimento[] {
  const seed = cidade.charCodeAt(0) + cidade.charCodeAt(Math.min(2, cidade.length - 1));
  const mult = 0.85 + (seed % 30) * 0.01;

  return [
    {
      id: "1",
      nome: "Supermercado BH",
      tipo: "supermercado",
      bairro: "Centro",
      avaliacao: 4.2,
      entrega: true,
      tempoEntrega: "30-45 min",
      urlCatalogo: "https://www.supermercadobh.com.br",
      produtos: gerarProdutos(
        [...PRODUTOS_BASE.cervejas_comuns],
        mult * 0.98
      ),
    },
    {
      id: "2",
      nome: "Atacadão",
      tipo: "atacado",
      bairro: "Bairro Industrial",
      avaliacao: 4.0,
      entrega: false,
      urlCatalogo: "https://www.atacadao.com.br",
      produtos: gerarProdutos(
        PRODUTOS_BASE.cervejas_comuns.filter((p) =>
          ["Skol", "Brahma", "Antartica", "Itaipava", "Budweiser"].includes(p.marca ?? "")
        ),
        mult * 0.88
      ),
    },
    {
      id: "3",
      nome: "Empório da Cerveja",
      tipo: "adega",
      bairro: "Bairro Nobre",
      avaliacao: 4.8,
      entrega: true,
      tempoEntrega: "45-60 min",
      produtos: gerarProdutos(
        [...PRODUTOS_BASE.cervejas_comuns.slice(4), ...PRODUTOS_BASE.bebidas_especiais],
        mult * 1.15
      ),
    },
    {
      id: "4",
      nome: "Zé Delivery",
      tipo: "app-delivery",
      bairro: "App (toda a cidade)",
      avaliacao: 4.5,
      entrega: true,
      tempoEntrega: "20-35 min",
      urlCatalogo: "https://www.zedelivery.com.br",
      produtos: gerarProdutos(
        [...PRODUTOS_BASE.cervejas_comuns.slice(0, 10), ...PRODUTOS_BASE.bebidas_especiais],
        mult * 1.08
      ),
    },
    {
      id: "5",
      nome: "Mercadinho do Bairro",
      tipo: "mercadinho",
      bairro: "Vila Popular",
      avaliacao: 3.9,
      entrega: false,
      produtos: gerarProdutos(
        PRODUTOS_BASE.cervejas_comuns.filter((p) =>
          ["Skol", "Brahma", "Antartica", "Itaipava"].includes(p.marca ?? "")
        ),
        mult * 1.05
      ),
    },
    {
      id: "6",
      nome: "iFood Bebidas",
      tipo: "app-delivery",
      bairro: "App (toda a cidade)",
      avaliacao: 4.3,
      entrega: true,
      tempoEntrega: "25-40 min",
      urlCatalogo: "https://www.ifood.com.br",
      produtos: gerarProdutos(
        [...PRODUTOS_BASE.cervejas_comuns, ...PRODUTOS_BASE.bebidas_especiais],
        mult * 1.12
      ),
    },
  ];
}

const TIPO_INFO: Record<string, { emoji: string; label: string }> = {
  supermercado: { emoji: "🏪", label: "Supermercado" },
  adega: { emoji: "🍷", label: "Adega" },
  "app-delivery": { emoji: "📱", label: "App / Delivery" },
  atacado: { emoji: "📦", label: "Atacado" },
  mercadinho: { emoji: "🛒", label: "Mercadinho" },
};

const CATEGORIA_EMOJI: Record<string, string> = {
  cerveja: "🍺",
  energetico: "⚡",
  drinks: "🍹",
  vinho: "🍷",
  destilado: "🥃",
};

export default function CatalogoPage() {
  const [cidadeInput, setCidadeInput] = useState("");
  const [cidadeSugestoes, setCidadeSugestoes] = useState<string[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [estabAberto, setEstabAberto] = useState<Estabelecimento | null>(null);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [selecionados, setSelecionados] = useState<{ produto: Produto; estabelecimento: string }[]>([]);
  const [verComparacao, setVerComparacao] = useState(false);

  const onCidadeInput = (value: string) => {
    setCidadeInput(value);
    if (value.length >= 2) {
      const sugestoes = CIDADES_BR.filter((c) =>
        c.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6);
      setCidadeSugestoes(sugestoes);
    } else {
      setCidadeSugestoes([]);
    }
  };

  const selecionarCidade = async (cidade: string) => {
    setCidadeInput(cidade);
    setCidadeSugestoes([]);
    setBuscando(true);
    setCidadeSelecionada(null);
    setEstabelecimentos([]);

    await new Promise((r) => setTimeout(r, 1800));

    const estabs = gerarEstabelecimentos(cidade);
    setEstabelecimentos(estabs);
    setCidadeSelecionada(cidade);
    setBuscando(false);
    toast.success(`${estabs.length} estabelecimentos encontrados em ${cidade}! 🍺`);
  };

  const toggleSelecionado = (produto: Produto, nomeEstab: string) => {
    setSelecionados((prev) => {
      const existe = prev.find((s) => s.produto.nome === produto.nome && s.estabelecimento === nomeEstab);
      if (existe) return prev.filter((s) => !(s.produto.nome === produto.nome && s.estabelecimento === nomeEstab));
      if (prev.filter((s) => s.produto.nome === produto.nome).length >= 4) {
        toast.warning("Máximo 4 preços do mesmo produto pra comparar!");
        return prev;
      }
      return [...prev, { produto, estabelecimento: nomeEstab }];
    });
  };

  const produtosFiltrados = estabAberto
    ? estabAberto.produtos.filter((p) => {
        const matchBusca = buscaProduto === "" || p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) || p.marca.toLowerCase().includes(buscaProduto.toLowerCase());
        const matchCat = filtroCategoria === "todos" || p.categoria === filtroCategoria;
        return matchBusca && matchCat;
      })
    : [];

  const produtosAgrupados = verComparacao
    ? selecionados.reduce<Record<string, { produto: Produto; estabelecimento: string }[]>>((acc, s) => {
        if (!acc[s.produto.nome]) acc[s.produto.nome] = [];
        acc[s.produto.nome].push(s);
        return acc;
      }, {})
    : {};

  return (
    <Layout
      titulo="Catálogo"
      subtitulo="Compare preços entre estabelecimentos da sua cidade"
      emoji="🏪"
      accentColor="from-blue-500 to-cyan-400"
    >
      <div className="space-y-4">
        {/* Buscador de cidade */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <MapPin size={14} className="text-blue-400" />
            Qual é a sua cidade?
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Digite o nome da cidade... ex: Belo Horizonte"
              value={cidadeInput}
              onChange={(e) => onCidadeInput(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="input-cidade"
            />
            {cidadeInput && (
              <button
                onClick={() => { setCidadeInput(""); setCidadeSugestoes([]); setCidadeSelecionada(null); setEstabelecimentos([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="btn-limpar-cidade"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {cidadeSugestoes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-2 bg-secondary border border-border rounded-xl overflow-hidden"
              >
                {cidadeSugestoes.map((cidade) => (
                  <button
                    key={cidade}
                    onClick={() => selecionarCidade(cidade)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-border/50 transition-colors text-left"
                    data-testid={`sugestao-${cidade}`}
                  >
                    <MapPin size={14} className="text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-foreground">{cidade}</span>
                    <ChevronRight size={14} className="text-muted-foreground ml-auto" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading */}
        <AnimatePresence>
          {buscando && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-blue-500/30 rounded-2xl p-6 text-center"
            >
              <Loader2 size={32} className="text-blue-400 animate-spin mx-auto mb-3" />
              <div className="font-display text-xl text-foreground">Procurando catálogos online...</div>
              <p className="text-muted-foreground text-sm mt-1">Consultando estabelecimentos em {cidadeInput}</p>
              <div className="flex justify-center gap-1 mt-4">
                {["Supermercados", "Adegas", "Atacadistas", "Apps", "Mercadinhos"].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ delay: i * 0.3, duration: 1, repeat: Infinity }}
                    className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground"
                  >
                    {label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultados: lista de estabelecimentos */}
        <AnimatePresence>
          {!buscando && cidadeSelecionada && estabelecimentos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display text-xl text-foreground">
                    📍 {cidadeSelecionada}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {estabelecimentos.length} estabelecimentos com catálogo online
                  </p>
                </div>
                {selecionados.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setVerComparacao(true)}
                    className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"
                    data-testid="btn-ver-comparacao"
                  >
                    Ver comparação ({selecionados.length})
                  </motion.button>
                )}
              </div>

              {estabelecimentos.map((estab, idx) => {
                const menorPreco = Math.min(...estab.produtos.filter((p) => p.categoria === "cerveja").map((p) => p.preco / p.volume));
                return (
                  <motion.div
                    key={estab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => { setEstabAberto(estab); setBuscaProduto(""); setFiltroCategoria("todos"); }}
                      className="w-full p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors text-left"
                      data-testid={`btn-abrir-estab-${estab.id}`}
                    >
                      <div className="text-3xl">{TIPO_INFO[estab.tipo].emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{estab.nome}</span>
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                            {TIPO_INFO[estab.tipo].label}
                          </span>
                          {estab.entrega && (
                            <span className="text-xs bg-green-900/40 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                              🛵 {estab.tempoEntrega ?? "entrega"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {estab.bairro} • ⭐ {estab.avaliacao} • {estab.produtos.length} produtos
                        </div>
                        <div className="text-xs text-blue-400 mt-1">
                          A partir de R${(menorPreco * 100).toFixed(2)}/100ml de cerveja
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                    </button>
                  </motion.div>
                );
              })}

              {/* Melhor preço global */}
              <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-4">
                <div className="text-green-400 font-bold text-sm mb-2">🏆 Melhores preços em {cidadeSelecionada}</div>
                <div className="space-y-2">
                  {["Skol Lata 350ml", "Heineken Long Neck 330ml", "Original Garrafa 600ml"].map((nomeProd) => {
                    const todosPrecosEstab = estabelecimentos
                      .flatMap((estab) =>
                        estab.produtos
                          .filter((p) => p.nome === nomeProd)
                          .map((p) => ({ preco: p.preco, estab: estab.nome }))
                      )
                      .sort((a, b) => a.preco - b.preco);

                    if (todosPrecosEstab.length === 0) return null;
                    const melhor = todosPrecosEstab[0];
                    return (
                      <div key={nomeProd} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{nomeProd}</span>
                        <span className="text-green-400 font-bold">
                          R${melhor.preco.toFixed(2)} — {melhor.estab}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal: produtos do estabelecimento */}
      <AnimatePresence>
        {estabAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setEstabAberto(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Header do modal */}
              <div className="p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TIPO_INFO[estabAberto.tipo].emoji}</span>
                    <div>
                      <div className="font-semibold text-foreground">{estabAberto.nome}</div>
                      <div className="text-xs text-muted-foreground">{estabAberto.bairro} • ⭐ {estabAberto.avaliacao}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {estabAberto.urlCatalogo && (
                      <a href={estabAberto.urlCatalogo} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300" data-testid="link-catalogo-externo">
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button onClick={() => setEstabAberto(null)} className="text-muted-foreground hover:text-foreground" data-testid="btn-fechar-estab">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Busca e filtros */}
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg pl-8 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                    data-testid="input-busca-produto"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {["todos", "cerveja", "energetico", "drinks"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFiltroCategoria(cat)}
                      className={cn(
                        "flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                        filtroCategoria === cat
                          ? "bg-blue-500 text-white"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                      data-testid={`filtro-cat-${cat}`}
                    >
                      {cat === "todos" ? "Todos" : `${CATEGORIA_EMOJI[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de produtos */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {produtosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum produto encontrado
                  </div>
                ) : (
                  produtosFiltrados.map((produto) => {
                    const isSel = selecionados.some((s) => s.produto.nome === produto.nome && s.estabelecimento === estabAberto.nome);
                    const custoPorMl = produto.preco / produto.volume;
                    return (
                      <motion.div
                        key={produto.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleSelecionado(produto, estabAberto.nome)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                          isSel ? "border-blue-500 bg-blue-900/20" : "border-border hover:border-border/60 bg-secondary"
                        )}
                        data-testid={`prod-${produto.id}`}
                      >
                        <span className="text-xl flex-shrink-0">{CATEGORIA_EMOJI[produto.categoria]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{produto.nome}</div>
                          <div className="text-xs text-muted-foreground">{produto.tipo} • {produto.teorAlcoolico}% álc</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-primary font-bold text-sm">R${produto.preco.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground">R${(custoPorMl * 100).toFixed(2)}/100ml</span>
                          </div>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                          isSel ? "border-blue-500 bg-blue-500" : "border-border"
                        )}>
                          {isSel && <span className="text-white text-xs">✓</span>}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {selecionados.length > 0 && (
                <div className="p-4 border-t border-border flex-shrink-0">
                  <button
                    onClick={() => { setEstabAberto(null); setVerComparacao(true); }}
                    className="w-full bg-blue-500 text-white font-bold rounded-xl py-3 text-sm"
                    data-testid="btn-comparar-modal"
                  >
                    Comparar {selecionados.length} item{selecionados.length !== 1 ? "s" : ""} selecionado{selecionados.length !== 1 ? "s" : ""}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: comparação de preços */}
      <AnimatePresence>
        {verComparacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setVerComparacao(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-border flex-shrink-0 flex items-center justify-between">
                <h3 className="font-display text-2xl text-foreground">Comparação de Preços</h3>
                <div className="flex gap-2">
                  <button onClick={() => setSelecionados([])} className="text-xs text-destructive hover:text-red-400" data-testid="btn-limpar-sel">
                    Limpar
                  </button>
                  <button onClick={() => setVerComparacao(false)} className="text-muted-foreground hover:text-foreground" data-testid="btn-fechar-comp">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {Object.entries(produtosAgrupados).map(([nomeProd, itens]) => {
                  const ordenados = [...itens].sort((a, b) => a.produto.preco - b.produto.preco);
                  const melhor = ordenados[0];
                  const pior = ordenados[ordenados.length - 1];
                  const economia = pior.produto.preco - melhor.produto.preco;
                  return (
                    <div key={nomeProd}>
                      <div className="text-sm font-semibold text-foreground mb-2">🍺 {nomeProd}</div>
                      <div className="space-y-2">
                        {ordenados.map((item, i) => (
                          <div
                            key={`${item.estabelecimento}-${item.produto.id}`}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border",
                              i === 0 ? "border-green-500/50 bg-green-900/20" : "border-border bg-secondary"
                            )}
                          >
                            {i === 0 && <span className="text-base">🏆</span>}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-muted-foreground">{item.estabelecimento}</div>
                              <div className="flex gap-3 mt-0.5">
                                <span className={cn("font-bold text-sm", i === 0 ? "text-green-400" : "text-foreground")}>
                                  R${item.produto.preco.toFixed(2)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  R${(item.produto.preco / item.produto.volume * 100).toFixed(2)}/100ml
                                </span>
                              </div>
                            </div>
                            {i > 0 && (
                              <span className="text-xs text-destructive font-medium">
                                +R${(item.produto.preco - melhor.produto.preco).toFixed(2)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {economia > 0.01 && (
                        <div className="mt-2 text-xs text-green-400 text-center">
                          💰 Comprando no {melhor.estabelecimento}, você economiza até R${economia.toFixed(2)}!
                        </div>
                      )}
                    </div>
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
