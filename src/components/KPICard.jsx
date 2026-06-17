import { AlertTriangle } from 'lucide-react'

export default function KPICard({ label, value, unit, icon, alert, subvalue, isSimulating }) {
  return (
    <div className="bg-gray-700/40 border border-gray-600/60 rounded-xl p-3
                    hover:border-gray-500 transition-colors duration-200">
      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
          {label}
        </span>
        <div className="text-cyan-400 bg-cyan-950/50 p-1 rounded-lg">
          {icon}
        </div>
      </div>

      {/* Valor principal */}
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold font-mono transition-all duration-500
          ${isSimulating ? 'text-white' : 'text-gray-600'}`}>
          {isSimulating ? value : '—'}
        </span>
        <span className="text-xs text-gray-500 mb-0.5 font-mono">{unit}</span>
      </div>

      {/* Valor secundário informativo */}
      {isSimulating && subvalue && (
        <div className="mt-1 text-xs text-gray-500 font-mono">
          {subvalue}
        </div>
      )}

      {/* Badge de alerta */}
      {isSimulating && alert && (
        <div className="mt-2 inline-flex items-center gap-1.5 bg-red-950/60 border border-red-800/70
                        text-red-400 text-xs px-2 py-0.5 rounded-full">
          <AlertTriangle size={10} />
          {alert}
        </div>
      )}

      {/* Barra de progresso decorativa */}
      {isSimulating && (
        <div className="mt-2 h-0.5 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500/60 rounded-full w-3/4 transition-all duration-1000" />
        </div>
      )}
    </div>
  )
}
