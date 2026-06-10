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
    { name: 'AWG', value: awgCost, fill: '#ef4444', label: 'Este protótipo' },
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
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs shadow-xl">
        <p className="text-gray-300 font-medium mb-1">{LABELS[label] || label}</p>
        <p className="font-mono font-bold" style={{ color: payload[0].payload.fill }}>
          R$ {payload[0].value.toFixed(2)} / litro
        </p>
      </div>
    )
  }
  return null
}

export default function MarketChart({ isSimulating, simResult }) {
  const marketData = buildMarketData(simResult)
  return (
    <div className="bg-gray-700/40 border border-gray-600/60 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={14} className="text-cyan-400" />
        <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          Análise de Mercado — Custo por Litro
        </h3>
      </div>

      {isSimulating ? (
        <ResponsiveContainer width="100%" height={150}>
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
        <div className="h-36 flex items-center justify-center">
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
