import { BarChart2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

// Custos de referência do mercado brasileiro (R$/litro). O custo do "AWG" é
// calculado dinamicamente a partir da simulação psicrométrica.
const REFERENCE_DATA = [
  { name: 'Filtrada', value: 0.05, fill: '#06b6d4', label: 'Filtro doméstico' },
  { name: 'Mineral',  value: 0.80, fill: '#3b82f6', label: 'Água mineral' },
  { name: 'Dessalin.', value: 1.20, fill: '#8b5cf6', label: 'Dessalinização' },
]

function buildMarketData(simResult) {
  const r = simResult || {}
  const awgCost =
    r.hasCondensation && r.costPerLiter_BRL > 0
      ? Math.round(r.costPerLiter_BRL * 100) / 100
      : 0
  return [
    {
      name: 'AWG',
      value: awgCost,
      fill: '#ef4444',
      label: 'Este protótipo',
      costPerHour: r.costPerHour_BRL ?? 0,
      waterYield_ml_h: r.waterYield_ml_h ?? 0,
      hasCondensation: r.hasCondensation ?? false,
    },
    ...REFERENCE_DATA,
  ]
}

const LABELS = {
  AWG: 'Este protótipo',
  Filtrada: 'Filtro doméstico',
  Mineral: 'Água mineral',
  'Dessalin.': 'Dessalinização',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  const entry = payload[0].payload

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs shadow-xl min-w-[160px]">
      <p className="text-gray-300 font-medium mb-2">{LABELS[label] || label}</p>
      <p className="font-mono font-bold mb-1" style={{ color: entry.fill }}>
        R$ {payload[0].value.toFixed(2)} / litro
      </p>
      {label === 'AWG' && (
        <div className="border-t border-gray-700 mt-2 pt-2 flex flex-col gap-1 text-gray-400">
          <div className="flex justify-between gap-4">
            <span>Custo Peltier (fixo)</span>
            <span className="font-mono text-amber-400">R$ {entry.costPerHour.toFixed(3)}/h</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Produção</span>
            <span className="font-mono text-cyan-400">
              {entry.hasCondensation ? `${entry.waterYield_ml_h.toFixed(1)} ml/h` : '0 ml/h'}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-gray-700 pt-1 mt-1">
            <span className="text-gray-300">Custo/litro</span>
            <span className="font-mono text-red-400">
              {entry.hasCondensation ? `R$ ${payload[0].value.toFixed(2)}/L` : '∞ (sem captação)'}
            </span>
          </div>
          <p className="text-gray-600 mt-1 leading-relaxed">
            Custo fixo ÷ produção horária = R$/L.<br />
            Quanto menor a temperatura, menos vapor no ar, menos água captada e maior o custo por litro.
          </p>
        </div>
      )}
    </div>
  )
}

export default function MarketChart({ isSimulating, simResult }) {
  const marketData = buildMarketData(simResult)
  return (
    <div className="bg-gray-700/40 border border-gray-600/60 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <BarChart2 size={13} className="text-cyan-400" />
        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          Análise de Mercado — Custo por Litro
        </h3>
      </div>

      {isSimulating ? (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={marketData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              stroke="#374151"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#6b7280' }}
              stroke="#374151"
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `R$${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {marketData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-24 flex items-center justify-center">
          <p className="text-xs text-gray-700 italic">
            Inicie a simulação para ver a análise
          </p>
        </div>
      )}

      {isSimulating && (
        <p className="text-xs text-gray-600 mt-2 text-center">
          * Valores de referência em R$/litro — mercado brasileiro 2024
        </p>
      )}
    </div>
  )
}
