const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/html,application/xhtml+xml,*/*;q=0.9",
  "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
};

const LOJAS_NACIONAIS = [
  {
    nome: "Carrefour",
    tipo: "supermercado",
    logo: "🔵",
    url: "https://mercado.carrefour.com.br",
    buscarUrl: (q) => `https://mercado.carrefour.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=29`,
  },
  {
    nome: "Pão de Açúcar",
    tipo: "supermercado",
    logo: "🟢",
    url: "https://www.paodeacucar.com",
    buscarUrl: (q) => `https://www.paodeacucar.com/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=29`,
  },
  {
    nome: "Extra",
    tipo: "supermercado",
    logo: "🔴",
    url: "https://www.extra.com.br",
    buscarUrl: (q) => `https://www.extra.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=29`,
  },
  {
    nome: "Americanas",
    tipo: "supermercado",
    logo: "🔴",
    url: "https://www.americanas.com.br",
    buscarUrl: (q) => `https://www.americanas.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=29`,
  },
];

const LOJAS_POR_ESTADO = {
  MG: [
    ...LOJAS_NACIONAIS,
    {
      nome: "BH Supermercados",
      tipo: "supermercado",
      logo: "🟠",
      url: "https://www.bhsuper.com.br",
      buscarUrl: (q) => `https://www.bhsuper.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`,
    },
    {
      nome: "Epa Supermercados",
      tipo: "supermercado",
      logo: "🟡",
      url: "https://www.epa.com.br",
      buscarUrl: (q) => `https://www.epa.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`,
    },
  ],
  SP: [
    ...LOJAS_NACIONAIS,
    {
      nome: "Hirota Food",
      tipo: "supermercado",
      logo: "🟡",
      url: "https://www.hirota.com.br",
      buscarUrl: (q) => `https://www.hirota.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`,
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
    },
  ],
  PR: [
    ...LOJAS_NACIONAIS,
    {
      nome: "Fort Atacadista",
      tipo: "atacado",
      logo: "📦",
      url: "https://www.fortatacdista.com.br",
      buscarUrl: (q) => `https://www.fortatacdista.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`,
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
    },
  ],
};

function getLojasParaEstado(estado) {
  return LOJAS_POR_ESTADO[estado?.toUpperCase()] ?? LOJAS_NACIONAIS;
}

function extractVolume(nome) {
  const ml = nome.match(/(\d+(?:\.\d+)?)\s*ml/i);
  const l = nome.match(/(\d+(?:[.,]\d+)?)\s*(?:litros?|l\b)/i);
  if (ml) return parseFloat(ml[1]);
  if (l) return parseFloat(l[1].replace(",", ".")) * 1000;
  return null;
}

function parseVTEX(data, loja) {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      try {
        const offer = item?.items?.[0]?.sellers?.[0]?.commertialOffer;
        const preco = offer?.Price ?? offer?.ListPrice;
        if (!preco || preco <= 0) return null;
        const nome = item.productName ?? item.name ?? "";
        const imagem = (item?.items?.[0]?.images?.[0]?.imageUrl ?? "").replace("http://", "https://");
        const link = item.linkText
          ? `${loja.url}/${item.linkText}/p`
          : (item.link ?? loja.url);
        const precoOriginal = offer?.ListPrice && offer.ListPrice !== preco ? offer.ListPrice : null;
        return {
          id: item.productId ?? String(Math.random()),
          nome,
          preco: Number(preco.toFixed(2)),
          precoOriginal: precoOriginal ? Number(precoOriginal.toFixed(2)) : null,
          imagem,
          link,
          volume: extractVolume(nome),
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

async function buscarNaLoja(loja, busca) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(loja.buscarUrl(busca), {
      headers: BROWSER_HEADERS,
      signal: controller.signal,
    });
    if (!res.ok) return { loja: loja.nome, tipoLoja: loja.tipo, logoLoja: loja.logo, urlLoja: loja.url, sucesso: false, erro: `HTTP ${res.status}`, produtos: [] };
    const data = await res.json();
    const produtos = parseVTEX(data, loja);
    return { loja: loja.nome, tipoLoja: loja.tipo, logoLoja: loja.logo, urlLoja: loja.url, sucesso: true, produtos, totalEncontrado: produtos.length };
  } catch (err) {
    return { loja: loja.nome, tipoLoja: loja.tipo, logoLoja: loja.logo, urlLoja: loja.url, sucesso: false, erro: err.name === "AbortError" ? "timeout" : err.message, produtos: [] };
  } finally {
    clearTimeout(timer);
  }
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const cidade = url.searchParams.get("cidade") ?? "";
  const estado = url.searchParams.get("estado") ?? "MG";
  const q = url.searchParams.get("q") ?? "cerveja";

  const lojas = getLojasParaEstado(estado);
  const resultados = await Promise.allSettled(lojas.map((l) => buscarNaLoja(l, q)));
  const lojaResultados = resultados.map((r) => r.status === "fulfilled" ? r.value : null).filter(Boolean);

  const lojasSucesso = lojaResultados.filter((r) => r.sucesso && r.produtos.length > 0);
  const lojasFalha = lojaResultados.filter((r) => !r.sucesso || r.produtos.length === 0);

  const todosOsProdutos = lojasSucesso.flatMap((l) => l.produtos);
  const melhoresPorNome = {};
  for (const p of todosOsProdutos) {
    const chave = p.nome.slice(0, 45).trim().toLowerCase();
    if (!melhoresPorNome[chave] || p.preco < melhoresPorNome[chave].preco) {
      melhoresPorNome[chave] = p;
    }
  }
  const melhoresPrecos = Object.values(melhoresPorNome).sort((a, b) => a.preco - b.preco).slice(0, 8);

  const body = JSON.stringify({
    cidade,
    estado,
    busca: q,
    totalLojas: lojasSucesso.length,
    totalProdutos: todosOsProdutos.length,
    lojas: lojasSucesso,
    lojasFalha: lojasFalha.map((l) => ({ nome: l.loja, erro: l.erro })),
    melhoresPrecos,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "s-maxage=120, stale-while-revalidate=60",
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
