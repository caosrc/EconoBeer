export interface ProdutoLoja {
  id: string;
  nome: string;
  preco: number;
  precoOriginal: number | null;
  imagem: string;
  link: string;
  volume: number | null;
  loja: string;
  tipoLoja: string;
  logoLoja: string;
  urlLoja: string;
}

export interface LojaResultado {
  loja: string;
  tipoLoja: string;
  logoLoja: string;
  urlLoja: string;
  sucesso: boolean;
  produtos: ProdutoLoja[];
  totalEncontrado: number;
}

export interface BuscarResponse {
  cidade: string;
  estado: string;
  busca: string;
  totalLojas: number;
  totalProdutos: number;
  lojas: LojaResultado[];
  lojasFalha: { nome: string; erro: string }[];
  melhoresPrecos: ProdutoLoja[];
}

export async function buscarBebidas(
  cidade: string,
  estado: string,
  q = "cerveja"
): Promise<BuscarResponse> {
  const params = new URLSearchParams({ cidade, estado, q });
  const res = await fetch(`/api/buscar?${params}`);
  if (!res.ok) throw new Error(`Erro do servidor: ${res.status}`);
  return res.json();
}

export async function verificarBackend(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
