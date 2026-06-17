import { useState, useMemo } from 'react'
import { Droplets, Zap, DollarSign, Thermometer, Wind, FlaskConical, BookOpen, ChevronDown, ChevronUp, Calculator, Beaker, BarChart3, Layers, Info } from 'lucide-react'
import {
  getDewPoint,
  getAbsoluteHumidity,
  calculateSimulation,
  AIRFLOW_M3_H,
  PELTIER_POWER_W,
  PELTIER_DELTA_T,
  PASSIVE_DELTA_T,
  ENERGY_COST_KWH_GRID_RJ,
  BATTERY_VOLTAGE_V,
  BATTERY_CAPACITY_MAH,
  BATTERY_ENERGY_WH,
  BATTERY_DURATION_S,
} from '../lib/psychrometrics'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend, ReferenceLine } from 'recharts'

const fmt = (v, d = 2) => (typeof v === 'number' && isFinite(v) ? v.toFixed(d) : '—')

// ─── Seção expansível ────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-cyan-400" />
          <span className="font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2">{children}</div>}
    </div>
  )
}

// ─── Fração matemática visual ────────────────────────────────────────────────
function Frac({ top, bot }) {
  return (
    <span className="inline-flex flex-col items-center align-middle mx-1 text-sm leading-none">
      <span className="border-b border-current px-1 pb-0.5 whitespace-nowrap">{top}</span>
      <span className="pt-0.5 px-1 whitespace-nowrap">{bot}</span>
    </span>
  )
}

// ─── Caixa de fórmula com resultado ─────────────────────────────────────────
function FormulaBox({ label, children, result, unit, note }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-cyan-300 text-base leading-loose flex flex-wrap items-center gap-y-1">
        {children}
      </div>
      {result !== undefined && (
        <div className="flex items-baseline gap-1 border-t border-gray-700 pt-2">
          <span className="text-white font-bold text-lg">{result}</span>
          {unit && <span className="text-gray-400 text-sm">{unit}</span>}
        </div>
      )}
      {note && <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">{note}</div>}
    </div>
  )
}

// ─── Linha de parâmetro com nome legível ─────────────────────────────────────
function ParamRow({ label, value, unit, desc }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-700 last:border-0">
      <div className="flex-1 mr-4">
        <div className="text-white text-sm font-medium">{label}</div>
        <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
      </div>
      <span className="text-cyan-400 font-bold text-sm whitespace-nowrap">
        {value} <span className="text-gray-500 font-normal">{unit}</span>
      </span>
    </div>
  )
}

// ─── Dica explicativa ────────────────────────────────────────────────────────
function Dica({ children }) {
  return (
    <div className="flex gap-2 bg-gray-700/40 border border-gray-600 rounded-lg p-3 text-xs text-gray-300 leading-relaxed">
      <Info size={13} className="text-cyan-400 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

// ─── Calculadora Interativa ──────────────────────────────────────────────────
function CalculadoraInterativa() {
  const [T, setT] = useState(28)
  const [RH, setRH] = useState(75)
  const [mode, setMode] = useState('peltier')

  const res = useMemo(() => calculateSimulation(T, RH, mode), [T, RH, mode])
  const umidadeEntrada = useMemo(() => getAbsoluteHumidity(T, RH), [T, RH])
  const umidadeSaida = useMemo(() => getAbsoluteHumidity(res.tDissipador, 100), [res.tDissipador])
  const aguaExtraida = Math.max(0, umidadeEntrada - umidadeSaida)

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Temperatura do Ar</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={-10} max={60} value={T}
              onChange={e => setT(Number(e.target.value))}
              className="flex-1 accent-cyan-400"
            />
            <span className="text-white font-mono w-14 text-right font-bold">{T} °C</span>
          </div>
          <p className="text-gray-600 text-xs">Quanto mais quente o ar, mais vapor ele carrega</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Umidade do Ar</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={10} max={100} value={RH}
              onChange={e => setRH(Number(e.target.value))}
              className="flex-1 accent-cyan-400"
            />
            <span className="text-white font-mono w-14 text-right font-bold">{RH}%</span>
          </div>
          <p className="text-gray-600 text-xs">100% = ar completamente saturado de vapor</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider">Forma de Resfriamento</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('peltier')}
              className={`flex-1 py-2 rounded text-xs font-semibold border transition-all ${
                mode === 'peltier'
                  ? 'bg-cyan-900/60 border-cyan-600 text-cyan-300'
                  : 'bg-gray-700 border-gray-600 text-gray-400 hover:text-gray-200'
              }`}
            >
              Pastilha Peltier<br /><span className="font-normal opacity-70">resfria −15 °C</span>
            </button>
            <button
              onClick={() => setMode('ambiente')}
              className={`flex-1 py-2 rounded text-xs font-semibold border transition-all ${
                mode === 'ambiente'
                  ? 'bg-cyan-900/60 border-cyan-600 text-cyan-300'
                  : 'bg-gray-700 border-gray-600 text-gray-400 hover:text-gray-200'
              }`}
            >
              Irradiação noturna<br /><span className="font-normal opacity-70">resfria −4 °C</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resultados passo a passo */}
      <div>
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Cálculo passo a passo com os valores acima</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <FormulaBox
            label="Ponto de Orvalho"
            result={fmt(res.dewPoint, 1)}
            unit="°C"
            note="Temperatura mínima para o vapor virar gota"
          >
            <span>T<sub>d</sub> =</span>
            <Frac top={<>243,5 · α</>} bot={<>17,67 − α</>} />
            <span className="text-gray-500 text-xs w-full mt-1 block">
              onde α = ln(<Frac top="UR" bot="100" />) +
              <Frac top={<>{T} · 17,67</>} bot={<>{T} + 243,5</>} />
            </span>
          </FormulaBox>

          <FormulaBox
            label="Temperatura da Superfície Fria"
            result={fmt(res.tDissipador, 1)}
            unit="°C"
            note={res.hasCondensation
              ? '✓ Mais fria que o ponto de orvalho — condensa!'
              : '✗ Ainda mais quente que o ponto de orvalho — não condensa'}
          >
            <span>T<sub>superfície</sub> = {T} − {mode === 'peltier' ? PELTIER_DELTA_T : PASSIVE_DELTA_T}</span>
          </FormulaBox>

          <FormulaBox
            label="Vapor Extraído do Ar"
            result={fmt(aguaExtraida, 3)}
            unit="g/m³"
            note="Gramas de água retiradas de cada m³ de ar"
          >
            <span>ΔU = U<sub>entrada</sub> − U<sub>saída</sub></span>
            <span className="text-gray-500 text-xs w-full mt-1 block">= {fmt(umidadeEntrada, 2)} − {fmt(umidadeSaida, 2)}</span>
          </FormulaBox>

          <FormulaBox
            label="Água Produzida"
            result={fmt(res.waterYield_ml_h, 1)}
            unit="ml/h"
            note={!res.hasCondensation ? 'Nenhuma — condições insuficientes para condensar' : `≈ ${fmt(res.waterYield_ml_h * 24 / 1000, 2)} litros em 24 h contínuas`}
          >
            <span>Q = ΔU · {AIRFLOW_M3_H} m³/h</span>
          </FormulaBox>

        </div>
      </div>

      {/* Resultado final */}
      <div className={`rounded-lg border px-5 py-4 text-sm font-medium ${
        res.hasCondensation
          ? 'bg-green-900/30 border-green-700 text-green-300'
          : 'bg-red-900/30 border-red-800 text-red-400'
      }`}>
        {res.hasCondensation ? (
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>✓ Condensação ativa</span>
            <span>Produção: <strong>{fmt(res.waterYield_ml_h, 1)} ml/h</strong></span>
            {mode === 'peltier' && <>
              <span>Eficiência: <strong>{fmt(res.efficiency_L_kWh, 4)} L/kWh</strong></span>
              <span>Custo: <strong>R$ {fmt(res.costPerLiter_BRL, 2)}/litro</strong></span>
            </>}
          </div>
        ) : (
          <span>
            ✗ Sem condensação — a superfície fria ({fmt(res.tDissipador, 1)} °C) ainda está mais quente
            que o ponto de orvalho ({fmt(res.dewPoint, 1)} °C). Tente aumentar a umidade ou diminuir a temperatura.
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Gráfico produção × umidade ──────────────────────────────────────────────
function GraficoProducaoUmidade() {
  const [T, setT] = useState(28)
  const data = useMemo(() =>
    Array.from({ length: 19 }, (_, i) => {
      const rh = 15 + i * 5
      const r = calculateSimulation(T, rh, 'peltier')
      return {
        rh,
        peltier: r.hasCondensation ? parseFloat(r.waterYield_ml_h.toFixed(1)) : 0,
        passivo: (() => {
          const rp = calculateSimulation(T, rh, 'ambiente')
          return rp.hasCondensation ? parseFloat(rp.waterYield_ml_h.toFixed(1)) : 0
        })(),
      }
    }),
    [T]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-xs text-gray-400 uppercase tracking-wider whitespace-nowrap">Temperatura fixada em</label>
        <input type="range" min={10} max={60} value={T} onChange={e => setT(Number(e.target.value))} className="flex-1 accent-cyan-400" />
        <span className="text-white font-mono w-16 text-right font-bold">{T} °C</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="rh"
            tickFormatter={v => `${v}%`}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            label={{ value: 'Umidade do ar', position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            label={{ value: 'ml/h', angle: -90, position: 'insideLeft', fill: '#6B7280', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
            labelFormatter={v => `Umidade: ${v}%`}
            formatter={(v, n) => [`${v} ml/h`, n === 'peltier' ? 'Pastilha Peltier (−15°C)' : 'Irradiação noturna (−4°C)']}
          />
          <Legend
            formatter={v => v === 'peltier' ? 'Pastilha Peltier (−15°C)' : 'Irradiação noturna (−4°C)'}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Line type="monotone" dataKey="peltier" stroke="#06B6D4" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="passivo" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Gráfico custo × umidade ─────────────────────────────────────────────────
function GraficoCusto() {
  const scenarios = useMemo(() => {
    const pts = []
    for (let rh = 50; rh <= 100; rh += 5) {
      const r = calculateSimulation(28, rh, 'peltier')
      if (r.hasCondensation && r.costPerLiter_BRL > 0) {
        pts.push({
          rh,
          custo: parseFloat(r.costPerLiter_BRL.toFixed(2)),
        })
      }
    }
    return pts
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Ar a 28 °C com a pastilha Peltier ligada. Quanto mais úmido o ar, mais água é produzida e menor fica o custo por litro.
        As linhas tracejadas mostram o preço de outras fontes de água no mercado — quanto mais baixo o custo do AWG, mais competitivo ele se torna.
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={scenarios} margin={{ top: 10, right: 90, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="rh"
            tickFormatter={v => `${v}%`}
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            label={{ value: 'Umidade do ar', position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 11 }}
          />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={v => `R$${v}`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
            labelFormatter={v => `Umidade: ${v}%`}
            formatter={v => [`R$ ${v} por litro`, 'Custo do AWG']}
          />
          <ReferenceLine y={0.05} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Filtrada R$0,05/L', fill: '#10B981', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={0.80} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Mineral R$0,80/L', fill: '#F59E0B', fontSize: 10, position: 'right' }} />
          <ReferenceLine y={1.20} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Dessaliniz. R$1,20/L', fill: '#EF4444', fontSize: 10, position: 'right' }} />
          <Line type="monotone" dataKey="custo" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 4, fill: '#06B6D4' }} name="custo" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function PesquisaPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-900 px-6 py-6 space-y-5">

      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FlaskConical size={24} className="text-cyan-400" />
            Pesquisa
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Como o protótipo funciona, as fórmulas por trás dos cálculos e a análise de custo e viabilidade
          </p>
        </div>
        <span className="text-xs bg-gray-800 border border-gray-700 px-2 py-1 rounded text-gray-400">
          Geração Atmosférica de Água — AWG
        </span>
      </div>

      {/* 1. O que é o projeto */}
      <Section icon={BookOpen} title="1. O que é o Projeto Orvalho?">
        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p>
            O <strong className="text-white">Projeto Orvalho</strong> é um protótipo universitário que captura água diretamente
            do ar atmosférico. A ideia central é simples: o ar que nos rodeia sempre carrega vapor d'água invisível.
            Ao resfriar uma superfície metálica abaixo de certa temperatura, esse vapor se transforma em gotículas de água
            — o mesmo fenômeno que forma orvalho nas plantas de madrugada ou embaça um copo gelado no verão.
          </p>
          <p>
            O simulador permite testar diferentes condições de temperatura e umidade do ar para descobrir quando
            a captura de água é viável e quanto ela custaria em comparação com outras fontes, como água mineral ou filtrada.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {[
              {
                icon: Droplets,
                label: 'O Princípio',
                text: "O vapor d'água do ar se transforma em líquido ao tocar uma superfície fria o suficiente — igual ao orvalho na grama de madrugada.",
              },
              {
                icon: Zap,
                label: 'Como Resfria (Modo Elétrico)',
                text: 'Uma pastilha Peltier (componente eletrônico) usa energia elétrica para criar frio em um lado e calor no outro, como uma mini geladeira.',
              },
              {
                icon: Wind,
                label: 'Como Resfria (Sem Energia)',
                text: 'À noite, superfícies metálicas expostas ao céu perdem calor naturalmente por irradiação, ficando alguns graus mais frias que o ar — sem gastar energia.',
              },
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={15} className="text-cyan-400" />
                  <span className="font-semibold text-white text-xs uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 2. Parâmetros do protótipo */}
      <Section icon={Layers} title="2. Especificações do Protótipo">
        <div className="space-y-5">
          <p className="text-sm text-gray-400 leading-relaxed">
            Estes são os valores físicos do hardware construído. Todos os cálculos partem dessas medidas reais —
            mudar qualquer peça do protótipo significa atualizar esses números.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-cyan-400 uppercase tracking-wider mb-3 font-semibold">Desempenho Térmico</div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <ParamRow
                  label="Fluxo de Ar pelo Duto"
                  value={AIRFLOW_M3_H}
                  unit="m³/h"
                  desc="Volume de ar processado pelo mini cooler a cada hora"
                />
                <ParamRow
                  label="Queda de Temperatura — Pastilha Peltier"
                  value={PELTIER_DELTA_T}
                  unit="°C"
                  desc="O dissipador fica 15 graus mais frio que o ar ambiente quando a pastilha está ligada"
                />
                <ParamRow
                  label="Queda de Temperatura — Resfriamento Noturno"
                  value={PASSIVE_DELTA_T}
                  unit="°C"
                  desc="À noite, sem energia, a superfície metálica irradia calor e fica ~4 graus abaixo do ar"
                />
                <ParamRow
                  label="Consumo Elétrico da Pastilha"
                  value={PELTIER_POWER_W}
                  unit="Watts"
                  desc="Energia consumida quando a pastilha Peltier está em operação — equivale a uma lâmpada incandescente de 60 W"
                />
              </div>
            </div>
            <div>
              <div className="text-xs text-cyan-400 uppercase tracking-wider mb-3 font-semibold">Bateria e Custo de Energia</div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <ParamRow
                  label="Tensão da Bateria"
                  value={BATTERY_VOLTAGE_V}
                  unit="Volts"
                  desc="Pack de pilhas Li-Ion 18650 ligadas em série (mesmo tipo de pilha de notebooks)"
                />
                <ParamRow
                  label="Capacidade da Bateria"
                  value={BATTERY_CAPACITY_MAH}
                  unit="mAh"
                  desc="Quanto de carga elétrica a bateria armazena"
                />
                <ParamRow
                  label="Energia Total da Bateria"
                  value={BATTERY_ENERGY_WH.toFixed(1)}
                  unit="Wh"
                  desc="Equivalente a deixar uma lâmpada de 29 W acesa por 1 hora"
                />
                <ParamRow
                  label="Tempo de Duração da Bateria"
                  value={`${Math.round(BATTERY_DURATION_S / 60)} min`}
                  unit=""
                  desc={`A bateria alimenta a pastilha por ~${(BATTERY_DURATION_S / 60).toFixed(0)} minutos antes de esgotar`}
                />
                <ParamRow
                  label="Tarifa de Energia (Rio de Janeiro)"
                  value={`R$ ${ENERGY_COST_KWH_GRID_RJ}`}
                  unit="por kWh"
                  desc="Tarifa residencial da Light — bandeira verde, aprovada pela ANEEL em junho de 2025"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. As fórmulas */}
      <Section icon={Calculator} title="3. Como os Cálculos Funcionam">
        <div className="space-y-8">

          {/* 3.1 Ponto de orvalho */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-cyan-400 rounded" />
              <span className="font-semibold text-white">3.1 Ponto de Orvalho — quando o vapor vira água?</span>
            </div>
            <p className="text-sm text-gray-400 mb-1 leading-relaxed">
              O <strong className="text-gray-200">ponto de orvalho</strong> é a temperatura crítica: se a superfície fria
              ficar <em>abaixo</em> dessa temperatura, o vapor do ar começa a condensar. Acima dela, nada acontece.
              Calculamos esse valor usando a <strong className="text-gray-200">Fórmula de Magnus-Tetens</strong>,
              padrão internacional em meteorologia.
            </p>
            <Dica>
              Analogia: é como apertar uma esponja molhada. O ponto de orvalho diz o quanto você precisa "apertar" o ar
              (resfriar) para a água começar a escorrer.
            </Dica>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <FormulaBox
                label="Passo 1 — calcular o coeficiente α"
                note="UR = umidade relativa do ar (0 a 100%);  T = temperatura do ar em °C"
              >
                <span>α = ln</span>
                <span className="mx-1">(</span>
                <Frac top="UR" bot="100" />
                <span className="mx-1">) +</span>
                <Frac top={<>17,67 · T</>} bot={<>T + 243,5</>} />
              </FormulaBox>
              <FormulaBox
                label="Passo 2 — calcular o ponto de orvalho"
                note="Resultado em °C — válido entre −40 °C e +60 °C"
              >
                <span>T<sub>orvalho</sub> =</span>
                <Frac top={<>243,5 · α</>} bot={<>17,67 − α</>} />
              </FormulaBox>
            </div>
            <div className="mt-3 bg-amber-900/20 border border-amber-700/40 rounded-lg p-3 text-xs text-amber-300">
              <strong>Regra de ouro:</strong> a condensação só acontece quando a temperatura da superfície fria
              é <em>menor ou igual</em> ao ponto de orvalho. Se a superfície ainda estiver mais quente,
              o vapor passa pelo ar sem virar gota.
            </div>
          </div>

          {/* 3.2 Umidade absoluta */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-cyan-400 rounded" />
              <span className="font-semibold text-white">3.2 Quanto vapor de água há no ar?</span>
            </div>
            <p className="text-sm text-gray-400 mb-1 leading-relaxed">
              A umidade relativa (ex.: "70%") diz <em>quão cheio</em> o ar está de vapor, mas não diz <em>quanto</em>
              vapor em gramas existe de fato. Para calcular a produção real de água, precisamos saber a
              <strong className="text-gray-200"> quantidade absoluta</strong> — quantos gramas de vapor existem
              em cada metro cúbico de ar. Fazemos isso em três passos:
            </p>
            <Dica>
              Analogia: a umidade relativa é como dizer "a mochila está 70% cheia". A umidade absoluta diz
              exatamente "há 8 gramas de água nessa mochila de ar".
            </Dica>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <FormulaBox
                label="Passo 1 — pressão de saturação"
                note="Quanto vapor o ar consegue carregar no máximo àquela temperatura — em hPa"
              >
                <span>P<sub>sat</sub> = 6,112 · e</span>
                <sup className="text-xs ml-0.5 leading-none">
                  <Frac top={<>17,67 · T</>} bot={<>T + 243,5</>} />
                </sup>
              </FormulaBox>
              <FormulaBox
                label="Passo 2 — pressão real do vapor"
                note="Quanto vapor existe de fato, considerando a umidade relativa medida"
              >
                <span>P<sub>vapor</sub> = P<sub>sat</sub> ·</span>
                <Frac top="UR" bot="100" />
              </FormulaBox>
              <FormulaBox
                label="Passo 3 — gramas de vapor por m³"
                note="Quantidade absoluta de água no ar — base do cálculo de produção"
              >
                <span>U =</span>
                <Frac top={<>2,16679 · P<sub>vapor</sub> · 100</>} bot={<>T + 273,15</>} />
              </FormulaBox>
            </div>
          </div>

          {/* 3.3 Produção de água */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-cyan-400 rounded" />
              <span className="font-semibold text-white">3.3 Quanto água é produzida por hora?</span>
            </div>
            <p className="text-sm text-gray-400 mb-1 leading-relaxed">
              O ar entra quente e úmido, passa pela superfície fria e sai mais seco — porque parte do vapor
              condensou e virou água líquida. A diferença entre o vapor que <em>entrou</em> e o que <em>saiu</em>
              é a água coletada. Multiplicamos essa diferença pelo volume de ar que passa pelo duto a cada hora.
            </p>
            <Dica>
              Analogia: é como torcer uma toalha molhada. A água que sai é a diferença entre o que estava
              na toalha e o que ficou depois de torcer. O "torcer" aqui é o resfriamento.
            </Dica>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <FormulaBox
                label="Vapor retirado do ar"
                note="Diferença entre o vapor que entra e o que sai após o resfriamento"
              >
                <span>ΔU = U<sub>entrada</sub> − U<sub>saída</sub></span>
              </FormulaBox>
              <FormulaBox
                label="Água produzida por hora"
                note="1 grama de vapor vira ~1 ml de água líquida"
              >
                <span>Q = ΔU · {AIRFLOW_M3_H} m³/h</span>
              </FormulaBox>
              <FormulaBox
                label="Produção diária estimada"
                note="Considerando operação contínua (na prática, limitada pela bateria)"
              >
                <span>Q<sub>dia</sub> = Q · 24 h</span>
              </FormulaBox>
            </div>
          </div>

          {/* 3.4 Eficiência e custo */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-cyan-400 rounded" />
              <span className="font-semibold text-white">3.4 Quanto custa produzir cada litro?</span>
            </div>
            <p className="text-sm text-gray-400 mb-1 leading-relaxed">
              Dividimos a produção de água pelo gasto de energia para descobrir quão eficiente é o processo.
              Em seguida, usamos a tarifa de energia local para calcular o custo final por litro.
              Quanto mais úmido o ar, mais água sai com a mesma energia — e mais barato fica cada litro.
            </p>
            <Dica>
              Analogia: é como calcular o rendimento de um carro. A eficiência é o "km por litro de gasolina";
              aqui é o "litro de água por kWh de energia".
            </Dica>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <FormulaBox
                label="Eficiência — litros de água por kWh gasto"
                note="Quanto maior, melhor. Válido apenas com a pastilha Peltier ligada."
              >
                <span>η =</span>
                <Frac
                  top={<>Q <span className="text-gray-400 text-xs ml-1">[litros/hora]</span></>}
                  bot={<>Potência <span className="text-gray-400 text-xs ml-1">[kW]</span></>}
                />
              </FormulaBox>
              <FormulaBox
                label="Custo por litro produzido"
                note="Tarifa residencial Light RJ — bandeira verde, junho de 2025"
              >
                <span>Custo<sub>L</sub> =</span>
                <Frac
                  top={<>Tarifa <span className="text-gray-400 text-xs ml-1">[R$/kWh]</span></>}
                  bot={<>η <span className="text-gray-400 text-xs ml-1">[L/kWh]</span></>}
                />
              </FormulaBox>
              <FormulaBox
                label="Custo fixo por hora de operação"
                note="Valor fixo — pago independente de condensar ou não"
              >
                <span>Custo<sub>h</sub> =</span>
                <Frac top={<>{PELTIER_POWER_W} W</>} bot="1000" />
                <span className="mx-1">· R$ {ENERGY_COST_KWH_GRID_RJ} = R$ {((PELTIER_POWER_W / 1000) * ENERGY_COST_KWH_GRID_RJ).toFixed(4)}/h</span>
              </FormulaBox>
              <FormulaBox
                label="Duração da bateria"
                note={`Bateria de ${BATTERY_VOLTAGE_V}V e ${BATTERY_CAPACITY_MAH} mAh — mesmo tipo usado em notebooks`}
              >
                <span>t =</span>
                <Frac
                  top={<>{BATTERY_ENERGY_WH} Wh</>}
                  bot={<>{PELTIER_POWER_W} W</>}
                />
                <span className="mx-1">· 3600 ≈ {Math.round(BATTERY_DURATION_S)} s</span>
                <span className="text-gray-500 text-xs ml-1">({(BATTERY_DURATION_S / 60).toFixed(0)} min)</span>
              </FormulaBox>
            </div>
          </div>

          {/* 3.5 Curva de resfriamento */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-cyan-400 rounded" />
              <span className="font-semibold text-white">3.5 Como a superfície esfria ao longo do tempo?</span>
            </div>
            <p className="text-sm text-gray-400 mb-1 leading-relaxed">
              A superfície metálica não fica instantaneamente fria — ela esfria gradualmente.
              A <strong className="text-gray-200">Lei de Resfriamento de Newton</strong> descreve esse comportamento:
              quanto mais distante do alvo de temperatura, mais rápido ela esfria; conforme se aproxima, vai desacelerando.
              É o mesmo comportamento de uma xícara de café esfriando na mesa.
            </p>
            <Dica>
              No gráfico do simulador, a curva azul mostra esse comportamento — ela parte da temperatura ambiente
              e desce exponencialmente até o valor alvo da pastilha.
            </Dica>
            <FormulaBox
              label="Temperatura da superfície a cada instante"
              note="Gera 21 pontos de 15 em 15 segundos (0 a 300 s). Modelo qualitativo — representa a dinâmica, não o valor exato."
            >
              <span>T(t) = T<sub>alvo</sub> + (T<sub>inicial</sub> − T<sub>alvo</sub>) · e</span>
              <sup className="text-xs ml-0.5">−k · i</sup>
              <span className="text-gray-500 text-xs ml-3">k = 0,18 &nbsp;|&nbsp; cada passo = 15 s</span>
            </FormulaBox>
          </div>

        </div>
      </Section>

      {/* 4. Calculadora interativa */}
      <Section icon={Beaker} title="4. Experimente: Calculadora Passo a Passo">
        <p className="text-sm text-gray-400 mb-5 leading-relaxed">
          Ajuste a temperatura e a umidade do ar e veja cada etapa do cálculo acontecer em tempo real.
          Observe como o ponto de orvalho muda e quando a condensação começa.
        </p>
        <CalculadoraInterativa />
      </Section>

      {/* 5. Gráficos */}
      <Section icon={BarChart3} title="5. Gráficos de Produção e Custo">
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">5.1 Produção de Água × Umidade do Ar</h3>
            <p className="text-xs text-gray-500 mb-4">
              Arraste o controle de temperatura e veja como a produção aumenta conforme o ar fica mais úmido.
              Note que o resfriamento passivo (sem energia) só começa a produzir com umidades muito altas.
            </p>
            <GraficoProducaoUmidade />
          </div>
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-sm font-semibold text-white mb-1">5.2 Custo por Litro × Umidade do Ar (Pastilha Peltier, 28 °C)</h3>
            <p className="text-xs text-gray-500 mb-4">
              Quanto mais úmido o ar, mais barato fica cada litro produzido. As linhas mostram o preço de outras fontes de água.
            </p>
            <GraficoCusto />
          </div>
        </div>
      </Section>

      {/* 6. Viabilidade */}
      <Section icon={DollarSign} title="6. Quando Vale a Pena usar o Protótipo?">
        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p>
            A viabilidade depende diretamente do clima local. No Rio de Janeiro, com temperatura média de ~26 °C
            e umidade média de ~80%, a pastilha Peltier normalmente consegue condensar água — mas o custo por litro
            ainda é mais alto do que o da água filtrada doméstica.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-3">
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Cenário Favorável — Verão Úmido
              </div>
              <div className="space-y-1.5">
                {(() => {
                  const r = calculateSimulation(30, 85, 'peltier')
                  return [
                    ['Temperatura do ar', '30 °C'],
                    ['Umidade do ar', '85%'],
                    ['Ponto de orvalho', `${fmt(r.dewPoint, 1)} °C`],
                    ['Temperatura da superfície fria', `${fmt(r.tDissipador, 1)} °C`],
                    ['Água produzida', `${fmt(r.waterYield_ml_h, 1)} ml/hora`],
                    ['Eficiência', `${fmt(r.efficiency_L_kWh, 4)} L por kWh`],
                    ['Custo por litro', `R$ ${fmt(r.costPerLiter_BRL, 2)}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-white font-semibold">{v}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-3">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Cenário Limite — Inverno Seco
              </div>
              <div className="space-y-1.5">
                {(() => {
                  const r = calculateSimulation(22, 60, 'peltier')
                  return [
                    ['Temperatura do ar', '22 °C'],
                    ['Umidade do ar', '60%'],
                    ['Ponto de orvalho', `${fmt(r.dewPoint, 1)} °C`],
                    ['Temperatura da superfície fria', `${fmt(r.tDissipador, 1)} °C`],
                    ['Água produzida', r.hasCondensation ? `${fmt(r.waterYield_ml_h, 1)} ml/hora` : 'Nenhuma — ar muito seco'],
                    ['Eficiência', r.hasCondensation ? `${fmt(r.efficiency_L_kWh, 4)} L por kWh` : '—'],
                    ['Custo por litro', r.hasCondensation ? `R$ ${fmt(r.costPerLiter_BRL, 2)}` : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-gray-400">{k}</span>
                      <span className={`font-semibold ${v.includes('seco') ? 'text-red-400' : 'text-white'}`}>{v}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4 text-xs text-blue-300 space-y-2">
            <div className="font-semibold text-blue-200">Resfriamento Noturno sem Energia</div>
            <p>
              Por resfriar apenas 4 °C abaixo do ar, o modo noturno passivo só consegue condensar quando a umidade
              está muito alta (acima de ~85%, tipicamente). A grande vantagem é o custo zero de operação —
              sem bateria, sem tomada. Ideal para regiões costeiras e noites tropicais úmidas.
            </p>
          </div>
        </div>
      </Section>

      {/* 7. Comparação de mercado */}
      <Section icon={BarChart3} title="7. Comparação com Outras Fontes de Água">
        <div className="space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed">
            O gráfico abaixo compara o custo por litro do nosso protótipo com as alternativas disponíveis no mercado.
            Em dias muito úmidos (acima de 80%), o AWG já compete com água mineral e é muito mais barato que
            água dessalinizada. A água filtrada da rede ainda é mais barata, mas depende de infraestrutura de saneamento.
          </p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={[
                { name: 'Água da Rede\n(filtrada)', custo: 0.05 },
                { name: 'AWG Peltier\n(umidade 85%)', custo: parseFloat(calculateSimulation(28, 85, 'peltier').costPerLiter_BRL.toFixed(2)) },
                { name: 'Água Mineral\n(garrafa)', custo: 0.80 },
                { name: 'Dessalinização', custo: 1.20 },
              ]}
              margin={{ top: 5, right: 20, bottom: 35, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <YAxis tickFormatter={v => `R$${v}`} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={v => [`R$ ${v} por litro`, 'Custo']}
              />
              <Bar dataKey="custo" radius={[4, 4, 0, 0]}>
                {['#10B981', '#06B6D4', '#F59E0B', '#EF4444'].map((fill, i) => (
                  <Cell key={i} fill={fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-500 text-center">
            * Custo do AWG calculado com tarifa Light RJ (R$ {ENERGY_COST_KWH_GRID_RJ}/kWh), ar a 28 °C e 85% de umidade
          </div>
        </div>
      </Section>

      {/* 8. Limitações e próximos passos */}
      <Section icon={BookOpen} title="8. O que o Modelo Ainda Não Considera" defaultOpen={false}>
        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p>
            O simulador é uma aproximação — útil para entender o comportamento do protótipo, mas com limitações
            que seriam resolvidas com testes físicos e sensores reais instalados no hardware.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Simplificações Atuais</div>
              <ul className="space-y-2 text-gray-400 text-xs">
                {[
                  'A pastilha sempre resfria exatamente 15 °C — na prática isso varia com a temperatura e o calor dissipado',
                  'A curva de resfriamento é uma estimativa matemática, não medida com sensor real',
                  'Não considera a perda de calor pelas paredes do duto para o ambiente externo',
                  'A bateria é tratada como 100% eficiente — baterias reais perdem 5 a 20% da energia',
                  'Não modela desgaste ou envelhecimento da pastilha Peltier ao longo do tempo',
                  'Não usa dados históricos de clima — apenas os valores inseridos manualmente',
                  'Não calcula a resistência do ar ao passar pelo duto (perda de pressão)',
                ].map(l => (
                  <li key={l} className="flex gap-2">
                    <span className="text-red-500 mt-0.5 shrink-0">×</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">Próximos Passos do Projeto</div>
              <ul className="space-y-2 text-gray-400 text-xs">
                {[
                  'Medir a temperatura real da pastilha com um sensor (NTC) e calibrar o modelo',
                  'Integrar dados históricos de clima do Rio de Janeiro para simulações sazonais',
                  'Incluir o calor latente de condensação no modelo termodinâmico completo',
                  'Simular ciclos dia e noite combinando pastilha Peltier e resfriamento passivo',
                  'Analisar quais parâmetros têm mais impacto no custo por litro',
                  'Construir e testar o protótipo físico para validar os resultados do simulador',
                  'Calcular em quanto tempo o protótipo "paga" o custo de construção com a água gerada',
                ].map(l => (
                  <li key={l} className="flex gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

    </div>
  )
}
