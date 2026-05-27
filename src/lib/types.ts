export interface Cerveja {
  id: string;
  nome: string;
  marca: string;
  tipo: "lata" | "long-neck" | "litrao" | "garrafa" | "litrinho" | "garrafa-600";
  volume: number;
  preco: number;
  teorAlcoolico: number;
  cor?: string;
}

export interface ResultadoComparacao {
  cerveja: Cerveja;
  custoPorMl: number;
  custoPorAlcool: number;
  custoPorDose: number;
  pontuacao: number;
  badge: "melhor" | "bom" | "caro";
}

export interface EstabelecimentoCatalogo {
  id: string;
  nome: string;
  tipo: "supermercado" | "boteco" | "bar" | "adega" | "aplicativo";
  cervejas: CervejaEstabelecimento[];
  cidade: string;
}

export interface CervejaEstabelecimento {
  id: string;
  nome: string;
  marca: string;
  volume: number;
  preco: number;
  teorAlcoolico: number;
  tipo: Cerveja["tipo"];
}

export interface CalculoRole {
  numeroPessoas: number;
  horasDuracao: number;
  cervezasSelecionadas: Cerveja[];
  orcamento: number;
}
