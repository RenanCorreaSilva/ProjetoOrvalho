import { TrendingDown } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { generateCoolingCurve } from '../lib/psychrometrics'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs shadow-xl">
        <p className="text-gray-400 mb-2 font-mono">{label}</p>
        {payload.map(entry => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="font-mono font-bold" style={{ color: entry.color }}>
              {entry.value}°C
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function ThermalChart({ isSimulating, temperature, simResult }) {
  const r = simResult || {}
  const tDissipador = r.tDissipador ?? temperature - 15
  const dewPoint = r.dewPoint ?? 0
  const data = generateCoolingCurve(temperature, tDissipador, dewPoint)

  if (!isSimulating) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-700">
        <TrendingDown size={44} />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Monitor de Processo Térmico</p>
          <p className="text-xs text-gray-700 mt-1">Inicie a simulação para visualizar os dados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Monitor de Processo Térmico</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Curva de resfriamento do dissipador × Ponto de Orvalho
          </p>
        </div>
        {r.hasCondensation ? (
          <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-950/50 border border-green-900 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            CONDENSANDO
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/50 border border-red-900 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            SEM ORVALHO
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 20, left: -10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="t"
              stroke="#374151"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              interval={3}
            />
            <YAxis
              stroke="#374151"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              domain={[-40, 40]}
              ticks={[-40, -30, -20, -10, 0, 10, 20, 30, 40]}
              unit="°C"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#9ca3af', paddingTop: 4 }}
            />
            {/* Linha de referência: zero graus (centro da escala) */}
            <ReferenceLine
              y={0}
              stroke="#4b5563"
              strokeWidth={1}
              label={{ value: '0°C', position: 'insideTopLeft', fill: '#6b7280', fontSize: 10 }}
            />
            {/* Linha de referência: ponto de orvalho calculado (limiar de condensação) */}
            <ReferenceLine
              y={dewPoint}
              stroke="#f59e0b"
              strokeDasharray="6 3"
              strokeOpacity={0.5}
              label={{
                value: `Td ${dewPoint}°C`,
                position: 'insideBottomRight',
                fill: '#f59e0b',
                fontSize: 10,
              }}
            />
            <Line
              type="monotone"
              dataKey="dissipador"
              name="Temp. Dissipador"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#06b6d4', stroke: '#164e63', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="orvalho"
              name="Ponto de Orvalho"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="7 3"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
