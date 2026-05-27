import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, DollarSign, Clock, Beer, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";

interface Pessoa {
  id: string;
  nome: string;
  valorPago: number;
}

interface CervejaSelecionada {
  id: string;
  nome: string;
  volume: number;
  preco: number;
  quantidade: number;
}

export default function RolePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [numeroPessoas, setNumeroPessoas] = useState(4);
  const [horasDuracao, setHorasDuracao] = useState(3);
  const [orcamento, setOrcamento] = useState(100);
  const [pessoas, setPessoas] = useState<Pessoa[]>([
    { id: "1", nome: "Você", valorPago: 0 },
    { id: "2", nome: "Amigo 1", valorPago: 0 },
    { id: "3", nome: "Amigo 2", valorPago: 0 },
    { id: "4", nome: "Amigo 3", valorPago: 0 },
  ]);
  const [cervejas, setCervejas] = useState<CervejaSelecionada[]>([
    { id: "1", nome: "Skol Lata 350ml", volume: 350, preco: 3.0, quantidade: 0 },
    { id: "2", nome: "Brahma 600ml", volume: 600, preco: 6.0, quantidade: 0 },
    { id: "3", nome: "Heineken Long Neck", volume: 330, preco: 6.5, quantidade: 0 },
  ]);
  const [resultado, setResultado] = useState<null | {
    totalGasto: number;
    porPessoa: number;
    totalMl: number;
    totalAlcool: number;
    mlPorPessoa: number;
    aviso: string;
  }>(null);

  const atualizarNumeroPessoas = (n: number) => {
    setNumeroPessoas(n);
    const novasPessoas: Pessoa[] = Array.from({ length: n }, (_, i) => ({
      id: String(i + 1),
      nome: i === 0 ? "Você" : `Amigo ${i}`,
      valorPago: pessoas[i]?.valorPago ?? 0,
    }));
    setPessoas(novasPessoas);
  };

  const atualizarQuantidade = (id: string, delta: number) => {
    setCervejas((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, quantidade: Math.max(0, c.quantidade + delta) } : c
      )
    );
    setResultado(null);
  };

  const totalGasto = cervejas.reduce((sum, c) => sum + c.preco * c.quantidade, 0);
  const totalMl = cervejas.reduce((sum, c) => sum + c.volume * c.quantidade, 0);

  const calcular = () => {
    if (totalGasto === 0) {
      toast.error("Adiciona pelo menos uma cerveja, tio!");
      return;
    }
    const totalAlcool = cervejas.reduce((sum, c) => sum + (c.volume * 0.05 * c.quantidade), 0);
    const mlPorPessoa = totalMl / numeroPessoas;
    const porPessoa = totalGasto / numeroPessoas;
    let aviso = "";
    if (mlPorPessoa > 2000) aviso = "⚠️ Isso é muita cerveja! Certeza que alguém vai chegar em casa com os dois pés no mesmo sapato!";
    else if (mlPorPessoa > 1200) aviso = "🍺 Rolê pesado! Garante o motorista designado!";
    else if (mlPorPessoa > 600) aviso = "😊 Rolê gostoso! Todo mundo vai ficar animado!";
    else aviso = "😇 Rolê tranquilo, só pra socializar!";
    setResultado({ totalGasto, porPessoa, totalMl, totalAlcool, mlPorPessoa, aviso });
    setStep(3);
  };

  const totalPago = pessoas.reduce((sum, p) => sum + p.valorPago, 0);
  const saldo = pessoas.map((p) => ({
    ...p,
    saldo: p.valorPago - (resultado?.porPessoa ?? 0),
  }));

  return (
    <Layout
      titulo="Modo Rolê"
      subtitulo="Calcula pra toda a galera!"
      emoji="🎉"
      accentColor="from-green-500 to-emerald-400"
    >
      <div className="space-y-4">
        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                step >= s ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground"
              )}>
                {s}
              </div>
              {s < 3 && <div className={cn("w-8 h-0.5", step > s ? "bg-green-500" : "bg-border")} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-display text-2xl text-foreground">Detalhes do rolê</h2>

              <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Users size={14} /> Quantas pessoas?
                  </label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => atualizarNumeroPessoas(Math.max(1, numeroPessoas - 1))} className="w-10 h-10 bg-secondary rounded-xl text-foreground font-bold text-xl hover:bg-border transition-colors" data-testid="btn-menos-pessoas">−</button>
                    <span className="font-display text-4xl text-primary flex-1 text-center">{numeroPessoas}</span>
                    <button onClick={() => atualizarNumeroPessoas(Math.min(20, numeroPessoas + 1))} className="w-10 h-10 bg-secondary rounded-xl text-foreground font-bold text-xl hover:bg-border transition-colors" data-testid="btn-mais-pessoas">+</button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock size={14} /> Duração (horas)
                  </label>
                  <input type="range" min="1" max="12" value={horasDuracao} onChange={(e) => setHorasDuracao(Number(e.target.value))}
                    className="w-full accent-green-500" data-testid="slider-duracao" />
                  <div className="text-center text-foreground font-bold">{horasDuracao}h de rolê</div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <DollarSign size={14} /> Orçamento total (R$)
                  </label>
                  <input type="number" value={orcamento} onChange={(e) => setOrcamento(Number(e.target.value))}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-green-500" data-testid="input-orcamento" />
                  <div className="text-xs text-muted-foreground mt-1">
                    R${(orcamento / numeroPessoas).toFixed(2)} por pessoa
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="text-sm text-muted-foreground mb-3">Nome da galera (opcional)</h3>
                <div className="space-y-2">
                  {pessoas.map((p, i) => (
                    <input key={p.id} type="text" value={p.nome} onChange={(e) => setPessoas((prev) => prev.map((x) => x.id === p.id ? { ...x, nome: e.target.value } : x))}
                      placeholder={`Pessoa ${i + 1}`}
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-green-500"
                      data-testid={`input-nome-pessoa-${p.id}`} />
                  ))}
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2"
                data-testid="btn-prox-step2">
                Escolher as cervejas →
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-foreground">Que cerveja vai rolar?</h2>
                <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground" data-testid="btn-voltar-step1">← Voltar</button>
              </div>

              <div className="space-y-3">
                {cervejas.map((c) => (
                  <div key={c.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-foreground text-sm">{c.nome}</div>
                      <div className="text-xs text-muted-foreground">{c.volume}ml • R${c.preco.toFixed(2)} cada</div>
                      {c.quantidade > 0 && (
                        <div className="text-xs text-green-400 mt-0.5">
                          Subtotal: R${(c.preco * c.quantidade).toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => atualizarQuantidade(c.id, -1)} className="w-8 h-8 bg-secondary rounded-full text-foreground font-bold hover:bg-border transition-colors" data-testid={`btn-menos-${c.id}`}>−</button>
                      <span className="font-display text-2xl text-primary w-6 text-center">{c.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(c.id, 1)} className="w-8 h-8 bg-green-500 rounded-full text-white font-bold hover:bg-green-400 transition-colors" data-testid={`btn-mais-${c.id}`}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-green-500/30 rounded-2xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total de cervejas</span>
                  <span className="text-foreground font-bold">{cervejas.reduce((s, c) => s + c.quantidade, 0)} unidades</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Total em ml</span>
                  <span className="text-foreground font-bold">{totalMl.toLocaleString()}ml</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Total gasto</span>
                  <span className={cn("font-bold", totalGasto > orcamento ? "text-destructive" : "text-green-400")}>
                    R${totalGasto.toFixed(2)}
                  </span>
                </div>
                {totalGasto > orcamento && (
                  <div className="text-destructive text-xs mt-2">
                    ⚠️ Passou do orçamento em R${(totalGasto - orcamento).toFixed(2)}!
                  </div>
                )}
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calcular}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-400 text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2"
                data-testid="btn-calcular-role">
                <PartyPopper size={18} />
                BORA CALCULAR! 🎉
              </motion.button>
            </motion.div>
          )}

          {step === 3 && resultado && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-foreground">Resumo do Rolê</h2>
                <button onClick={() => setStep(2)} className="text-sm text-muted-foreground hover:text-foreground" data-testid="btn-voltar-step2">← Voltar</button>
              </div>

              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/50 rounded-2xl p-5 text-center"
              >
                <div className="text-4xl mb-2">🎉</div>
                <div className="font-display text-3xl text-green-300">{resultado.aviso.slice(2)}</div>
                <div className="text-green-400 text-sm mt-1">{resultado.aviso.slice(0, 2)}</div>
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total gasto", valor: `R$${resultado.totalGasto.toFixed(2)}`, icon: "💸" },
                  { label: "Por pessoa", valor: `R$${resultado.porPessoa.toFixed(2)}`, icon: "👤" },
                  { label: "Total em ml", valor: `${resultado.totalMl.toLocaleString()}ml`, icon: "🍺" },
                  { label: "Por pessoa", valor: `${resultado.mlPorPessoa.toFixed(0)}ml`, icon: "🥤" },
                ].map((item) => (
                  <div key={item.label + item.icon} className="bg-card border border-border rounded-xl p-3 text-center">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                    <div className="font-bold text-foreground">{item.valor}</div>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-2xl p-4">
                <h3 className="font-display text-xl text-foreground mb-3">💰 Divisão da conta</h3>
                <div className="space-y-2">
                  {pessoas.map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-sm text-foreground flex-1">{p.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">pagou:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={p.valorPago || ""}
                          onChange={(e) => setPessoas((prev) => prev.map((x) => x.id === p.id ? { ...x, valorPago: Number(e.target.value) } : x))}
                          className="w-20 bg-secondary border border-border rounded-lg px-2 py-1 text-sm text-foreground text-right focus:outline-none focus:ring-1 focus:ring-green-500"
                          placeholder="0.00"
                          data-testid={`input-pagou-${p.id}`}
                        />
                      </div>
                      <span className={cn("text-xs font-bold w-16 text-right",
                        p.valorPago - resultado.porPessoa > 0.01 ? "text-green-400" :
                        p.valorPago - resultado.porPessoa < -0.01 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {p.valorPago - resultado.porPessoa > 0.01 ? `+R$${(p.valorPago - resultado.porPessoa).toFixed(2)}` :
                         p.valorPago - resultado.porPessoa < -0.01 ? `-R$${Math.abs(p.valorPago - resultado.porPessoa).toFixed(2)}` : "✓ ok"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex justify-between">
                  <span>Total pago</span>
                  <span className={cn(Math.abs(totalPago - resultado.totalGasto) < 0.01 ? "text-green-400" : "text-destructive")}>
                    R${totalPago.toFixed(2)} / R${resultado.totalGasto.toFixed(2)}
                  </span>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { setStep(1); setResultado(null); setCervejas((prev) => prev.map((c) => ({ ...c, quantidade: 0 }))); }}
                className="w-full bg-secondary border border-border text-foreground font-medium rounded-2xl py-3"
                data-testid="btn-novo-role">
                Novo rolê 🔄
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
