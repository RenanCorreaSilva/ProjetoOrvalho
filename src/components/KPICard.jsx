import { AlertTriangle } from 'lucide-react'

export default function KPICard({ label, value, unit, icon, alert, isSimulating }) {
  return (
    <div className="bg-gray-700/40 border border-gray-600/60 rounded-xl p-4
                    hover:border-gray-500 transition-colors duration-200">
      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
          {label}
        </span>
        <div className="text-cyan-400 bg-cyan-950/50 p-1.5 rounded-lg">
          {icon}
        </div>
      </div>

      {/* Valor principal */}
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-bold font-mono transition-all duration-500
          ${isSimulating ? 'text-white' : 'text-gray-600'}`}>
          {isSimulating ? value : '—'}
        </span>
        <span className="text-sm text-gray-500 mb-1 font-mono">{unit}</span>
      </div>

      {/* Badge de alerta (apenas quando simulando e se tiver alerta) */}
      {isSimulating && alert && (
        <div className="mt-3 inline-flex items-center gap-1.5 bg-red-950/60 border border-red-800/70
                        text-red-400 text-xs px-2.5 py-1 rounded-full">
          <AlertTriangle size={10} />
          {alert}
        </div>
      )}

      {/* Barra de progresso decorativa */}
      {isSimulating && (
        <div className="mt-3 h-0.5 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500/60 rounded-full w-3/4 transition-all duration-1000" />
        </div>
      )}
    </div>
  )
}
