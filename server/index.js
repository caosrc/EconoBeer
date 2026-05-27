import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Headers que imitam um browser real
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/html,application/xhtml+xml,*/*;q=0.9",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
};

// ─────────────────────────────────────────────────────────────
// LOJAS: mapeamento cidade → lojas disponíveis
// ─────────────────────────────────────────────────────────────
const LOJAS_NACIONAIS = [
  {
    nome: "Carrefour",
    tipo: "supermercado",
    logo: "🔵",
    url: "https://mercado.carrefour.com.br",
    buscarUrl: (q) => `https://mercado.carrefour.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=29`,
    tipo_api: "vtex",
  },
  {
    nome: "Pão de Açúcar",
    tipo: "supermercado",
    logo: "🟢",
    url: "https://www.paodeacucar.com",
    buscarUrl: (q) => `https://www.paodeacucar.com/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=29`,
    tipo_api: "vtex",
  },
  {
    nome: "Extra",
    tipo: "supermercado",
    logo: "🔴",
    url: "https://www.extra.com.br",
    buscarUrl: (q) => `https://www.extra.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=29`,
    tipo_api: "vtex",
  },
  {
    nome: "Americanas",
    tipo: "supermercado",
    logo: "🔴",
    url: "https://www.americanas.com.br",
    buscarUrl: (q) => `https://www.americanas.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=29`,
    tipo_api: "vtex",
  },
];

const LOJAS_POR_ESTADO = {
  SP: [
    ...LOJAS_NACIONAIS,
    {
      nome: "Hirota Food",
      tipo: "supermercado",
      logo: "🟡",
      url: "https://www.hirota.com.br",
      buscarUrl: (q) => `https://www.hirota.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`,
      tipo_api: "vtex",
    },
  ],
  RJ: [
    ...LOJAS_NACIONAIS,
    {
      nome: "Prezunic",
      tipo: "supermercado",
      logo: "🟠",
      url: "https://www.prezunic.com.br",
      buscarUrl: (q) => `https://www.prezunic.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`,
      tipo_api: "vtex",
    },
  ],
  MG: [...LOJAS_NACIONAIS],
  PR: [
    ...LOJAS_NACIONAIS,
    {
      nome: "Fort Atacadista",
      tipo: "atacado",
      logo: "📦",
      url: "https://www.fortatacdista.com.br",
      buscarUrl: (q) => `https://www.fortatacdista.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`,
      tipo_api: "vtex",
    },
  ],
  RS: [
    ...LOJAS_NACIONAIS,
    {
      nome: "Zaffari",
      tipo: "supermercado",
      logo: "🔵",
      url: "https://www.zaffari.com.br",
      buscarUrl: (q) => `https://www.zaffari.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`,
      tipo_api: "vtex",
    },
  ],
  SC: [
    ...LOJAS_NACIONAIS,
    {
      nome: "Bistek",
      tipo: "supermercado",
      logo: "🟢",
      url: "https://www.bistek.com.br",
      buscarUrl: (q) => `https://www.bistek.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`,
      tipo_api: "vtex",
    },
  ],
};

function getLojasParaEstado(estado) {
  return LOJAS_POR_ESTADO[estado] ?? LOJAS_NACIONAIS;
}

// ─────────────────────────────────────────────────────────────
// Parser VTEX — formato padrão do Pão de Açúcar, Carrefour, etc.
// ─────────────────────────────────────────────────────────────
function parseVTEX(data, loja) {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      try {
        const offer = item?.items?.[0]?.sellers?.[0]?.commertialOffer;
        const preco = offer?.Price ?? offer?.ListPrice;
        if (!preco || preco <= 0) return null;

        const nome = item.productName ?? item.name ?? "";
        const imagem = item?.items?.[0]?.images?.[0]?.imageUrl ?? "";
        const link = item.link ?? item.linkText
          ? `${loja.url}/${item.linkText}/p`
          : loja.url;
        const precoOriginal = offer?.ListPrice !== preco ? offer?.ListPrice : null;

        // Extrai volume do nome
        let volume = null;
        const matchMl = nome.match(/(\d+(?:\.\d+)?)\s*ml/i);
        const matchL = nome.match(/(\d+(?:[.,]\d+)?)\s*(?:litros?|l\b)/i);
        if (matchMl) volume = parseFloat(matchMl[1]);
        else if (matchL) volume = parseFloat(matchL[1].replace(",", ".")) * 1000;

        return {
          id: item.productId ?? String(Math.random()),
          nome,
          preco: Number(preco.toFixed(2)),
          precoOriginal: precoOriginal ? Number(precoOriginal.toFixed(2)) : null,
          imagem: imagem.replace("http://", "https://"),
          link,
          volume,
          loja: loja.nome,
          tipoLoja: loja.tipo,
          logoLoja: loja.logo,
          urlLoja: loja.url,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────────────
// Busca em uma loja com timeout
// ─────────────────────────────────────────────────────────────
async function buscarNaLoja(loja, busca) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const url = loja.buscarUrl(busca);
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: controller.signal,
    });

    if (!res.ok) {
      return { loja: loja.nome, sucesso: false, erro: `HTTP ${res.status}`, produtos: [] };
    }

    const data = await res.json();
    const produtos = parseVTEX(data, loja);

    return {
      loja: loja.nome,
      tipoLoja: loja.tipo,
      logoLoja: loja.logo,
      urlLoja: loja.url,
      sucesso: true,
      produtos,
      totalEncontrado: produtos.length,
    };
  } catch (err) {
    return {
      loja: loja.nome,
      sucesso: false,
      erro: err.name === "AbortError" ? "timeout" : err.message,
      produtos: [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ─────────────────────────────────────────────────────────────
// Endpoint principal: GET /api/buscar?cidade=X&estado=Y&q=cerveja
// ─────────────────────────────────────────────────────────────
app.get("/api/buscar", async (req, res) => {
  const { cidade = "", estado = "", q = "cerveja" } = req.query;

  const lojas = getLojasParaEstado(estado.toUpperCase());

  // Faz todas as buscas em paralelo
  const resultados = await Promise.allSettled(
    lojas.map((loja) => buscarNaLoja(loja, q))
  );

  const lojaResultados = resultados
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter(Boolean);

  const lojasSucesso = lojaResultados.filter((r) => r.sucesso && r.produtos.length > 0);
  const lojasFalha = lojaResultados.filter((r) => !r.sucesso || r.produtos.length === 0);

  // Melhor preço por produto (comparação entre lojas)
  const todosOsProdutos = lojasSucesso.flatMap((l) => l.produtos);
  const melhoresPorNome = {};
  for (const p of todosOsProdutos) {
    const chave = p.nome.slice(0, 45).trim().toLowerCase();
    if (!melhoresPorNome[chave] || p.preco < melhoresPorNome[chave].preco) {
      melhoresPorNome[chave] = p;
    }
  }
  const melhoresPrecos = Object.values(melhoresPorNome)
    .sort((a, b) => a.preco - b.preco)
    .slice(0, 8);

  res.json({
    cidade,
    estado,
    busca: q,
    totalLojas: lojasSucesso.length,
    totalProdutos: todosOsProdutos.length,
    lojas: lojasSucesso,
    lojasFalha: lojasFalha.map((l) => ({ nome: l.loja, erro: l.erro })),
    melhoresPrecos,
  });
});

// Endpoint de saúde
app.get("/api/health", (_, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🍺 EconoBeer Backend rodando em http://localhost:${PORT}`);
});
