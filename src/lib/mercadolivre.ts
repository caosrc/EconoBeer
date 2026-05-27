export interface MLProduto {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  currency_id: string;
  available_quantity: number;
  thumbnail: string;
  permalink: string;
  condition: string;
  seller: {
    id: number;
    nickname: string;
  };
  seller_address?: {
    city?: { name: string };
    state?: { name: string };
  };
  shipping?: {
    free_shipping: boolean;
  };
  attributes?: { id: string; name: string; value_name: string }[];
}

interface MLSearchResponse {
  results: MLProduto[];
  paging: { total: number; offset: number; limit: number };
}

export interface VendedorAgrupado {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  produtos: MLProdutoFormatado[];
  fretesGratis: number;
  totalProdutos: number;
}

export interface MLProdutoFormatado {
  id: string;
  nome: string;
  preco: number;
  precoOriginal: number | null;
  imagem: string;
  link: string;
  vendedor: string;
  fretesGratis: boolean;
  volume?: number;
  marca?: string;
  tipo?: string;
}

const QUERIES_CERVEJA = [
  "cerveja lata 350ml",
  "cerveja long neck",
  "cerveja garrafa 600ml",
  "cerveja litrão",
  "kit cerveja",
];

function extrairVolume(titulo: string): number | undefined {
  const match = titulo.match(/(\d+)\s*ml/i) || titulo.match(/(\d+)\s*litro?s?/i);
  if (!match) return undefined;
  if (titulo.toLowerCase().includes("litro")) return Number(match[1]) * 1000;
  return Number(match[1]);
}

function extrairMarca(titulo: string): string {
  const marcas = ["Skol", "Brahma", "Antarctica", "Heineken", "Stella Artois", "Corona",
    "Budweiser", "Original", "Devassa", "Eisenbahn", "Colorado", "Bohemia",
    "Itaipava", "Petra", "Spaten", "Amstel", "Beck", "Modelo"];
  for (const marca of marcas) {
    if (titulo.toLowerCase().includes(marca.toLowerCase())) return marca;
  }
  return "";
}

export async function buscarCervejasMercadoLivre(
  cidade: string,
  estado: string
): Promise<VendedorAgrupado[]> {
  const queryComEstado = `cerveja ${estado}`;
  const queries = [queryComEstado, ...QUERIES_CERVEJA];

  const resultados: MLProduto[] = [];
  const ids = new Set<string>();

  await Promise.allSettled(
    queries.slice(0, 4).map(async (q) => {
      try {
        const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q)}&limit=20&category=MLB1132`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          // Tenta sem categoria
          const url2 = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q + " cerveja bebida")}&limit=15`;
          const res2 = await fetch(url2, { headers: { Accept: "application/json" } });
          if (!res2.ok) return;
          const data2: MLSearchResponse = await res2.json();
          data2.results?.forEach((p) => {
            if (!ids.has(p.id)) { ids.add(p.id); resultados.push(p); }
          });
          return;
        }
        const data: MLSearchResponse = await res.json();
        data.results?.forEach((p) => {
          if (!ids.has(p.id)) { ids.add(p.id); resultados.push(p); }
        });
      } catch {
        // ignora erros individuais
      }
    })
  );

  if (resultados.length === 0) throw new Error("nenhum_resultado");

  // Agrupa por vendedor
  const porVendedor: Record<string, MLProduto[]> = {};
  for (const p of resultados) {
    const chave = p.seller.nickname;
    if (!porVendedor[chave]) porVendedor[chave] = [];
    porVendedor[chave].push(p);
  }

  const vendedores: VendedorAgrupado[] = Object.entries(porVendedor)
    .filter(([, prods]) => prods.length >= 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 12)
    .map(([nome, prods], idx) => {
      const cidadeVend = prods[0]?.seller_address?.city?.name ?? cidade;
      const estadoVend = prods[0]?.seller_address?.state?.name ?? estado;
      const produtosFormatados: MLProdutoFormatado[] = prods.map((p) => ({
        id: p.id,
        nome: p.title,
        preco: p.price,
        precoOriginal: p.original_price,
        imagem: p.thumbnail?.replace("http://", "https://"),
        link: p.permalink,
        vendedor: nome,
        fretesGratis: p.shipping?.free_shipping ?? false,
        volume: extrairVolume(p.title),
        marca: extrairMarca(p.title),
      }));
      return {
        id: `v-${idx}`,
        nome,
        cidade: cidadeVend,
        estado: estadoVend,
        produtos: produtosFormatados,
        fretesGratis: prods.filter((p) => p.shipping?.free_shipping).length,
        totalProdutos: prods.length,
      };
    });

  return vendedores;
}

export function melhorPrecoPorProduto(
  vendedores: VendedorAgrupado[]
): { nome: string; melhor: { preco: number; vendedor: string; link: string } | null }[] {
  const todosProdutos: Record<string, { preco: number; vendedor: string; link: string }[]> = {};

  for (const v of vendedores) {
    for (const p of v.produtos) {
      const chave = p.nome.slice(0, 40);
      if (!todosProdutos[chave]) todosProdutos[chave] = [];
      todosProdutos[chave].push({ preco: p.preco, vendedor: v.nome, link: p.link });
    }
  }

  return Object.entries(todosProdutos)
    .filter(([, itens]) => itens.length >= 2)
    .map(([nome, itens]) => ({
      nome,
      melhor: itens.sort((a, b) => a.preco - b.preco)[0] ?? null,
    }))
    .slice(0, 5);
}
