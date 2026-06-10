import { BarChart2, Droplets, Zap, DollarSign, Beaker } from 'lucide-react'
import KPICard from './KPICard'
import MarketChart from './MarketChart'

// Limiar acima do qual o custo por litro é sinalizado como elevado (R$/L).
const HIGH_COST_THRESHOLD = 2.0

export default function KPIPanel({ isSimulating, simResult }) {
  const r = simResult || {}
  const hasWater = r.hasCondensation && r.waterYield_ml_h > 0

  // KPIs derivados do resultado real da simulação psicrométrica.
  const kpis = [
    {
      label: 'Água Coletada',
      value: hasWater ? Math.round(r.waterYield_ml_h).toString() : '0',
      unit: 'ml/h',
      icon: <Droplets size={15} />,
      // Alerta vermelho quando o dissipador não atinge o ponto de orvalho.
      alert: !hasWater ? 'Nenhuma Condensação!' : null,
    },
    {
      label: 'Eficiência',
      value: hasWater ? r.efficiency_L_kWh.toFixed(3) : '0',
      unit: 'L/kWh',
      icon: <Zap size={15} />,
      alert: null,
    },
    {
      label: 'Custo Operacional',
      value: hasWater ? `R$ ${r.costPerLiter_BRL.toFixed(2)}` : '—',
      unit: '/ Litro',
      icon: <DollarSign size={15} />,
      alert: hasWater && r.costPerLiter_BRL > HIGH_COST_THRESHOLD ? 'Alerta: Alto Custo' : null,
    },
    {
      label: 'Potência Consumida',
      value: (r.power_W ?? 60).toString(),
      unit: 'W',
      icon: <Beaker size={15} />,
      alert: null,
    },
  ]

  return (
    <aside className="w-80 xl:w-96 shrink-0 bg-gray-800 border-l border-gray-700 flex flex-col overflow-y-auto">
      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Cabeçalho do painel */}
        <div className="flex items-center gap-2 pb-3 border-b border-gray-700">
          <BarChart2 size={15} className="text-cyan-400" />
          <div>
            <h2 className="text-sm font-semibold text-gray-200">Resultados da Simulação</h2>
            <p className="text-xs text-gray-600 mt-0.5">Viabilidade do protótipo</p>
          </div>
        </div>

        {/* Grid de KPI Cards */}
        <div className="grid grid-cols-1 gap-3">
          {kpis.map((kpi) => (
            <KPICard
              key={kpi.label}
              isSimulating={isSimulating}
              label={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
              icon={kpi.icon}
              alert={kpi.alert}
            />
          ))}
        </div>

        {/* Gráfico de Análise de Mercado */}
        <MarketChart isSimulating={isSimulating} simResult={simResult} />

        {/* Nota de rodapé contextual */}
        {isSimulating && (
          hasWater ? (
            <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-3">
              <p className="text-xs text-amber-500/80 leading-relaxed">
                <span className="font-semibold">Nota:</span> Resultados calculados via psicrometria
                (Magnus-Tetens) para T = {r.tAmbiente}°C e UR = {r.rhAmbiente}%. Custo elevado é
                esperado em protótipos de pequena escala.
              </p>
            </div>
          ) : (
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
              <p className="text-xs text-red-400/90 leading-relaxed">
                <span className="font-semibold">Sem condensação:</span> o dissipador chega a{' '}
                <span className="font-mono">{r.tDissipador}°C</span>, acima do ponto de orvalho de{' '}
                <span className="font-mono">{r.dewPoint}°C</span>. Aumente a umidade ou a temperatura
                ambiente para atingir o orvalho.
              </p>
            </div>
          )
        )}

      </div>
    </aside>
  )
}
