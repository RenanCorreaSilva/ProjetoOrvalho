import { Battery, BatteryLow, BatteryWarning } from 'lucide-react'
import { BATTERY_ENERGY_WH, BATTERY_VOLTAGE_V, BATTERY_CAPACITY_MAH, PELTIER_POWER_W } from '../lib/psychrometrics'

export default function BatteryCard({ isSimulating, elapsedMs, coolingMode }) {
  if (coolingMode === 'ambiente') {
    return (
      <div className="bg-gray-700/40 border border-gray-600/60 rounded-xl p-4">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bateria</span>
          <div className="p-1.5 rounded-lg bg-gray-700/50">
            <Battery size={15} className="text-gray-600" />
          </div>
        </div>
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-bold font-mono leading-none text-gray-600">N/A</span>
          <span className="text-xs text-gray-600">modo passivo</span>
        </div>
        <p className="text-xs text-gray-600">Sem Peltier — bateria não utilizada</p>
      </div>
    )
  }

  const energyConsumed_Wh  = (PELTIER_POWER_W * elapsedMs / 1000) / 3600
  const energyRemaining_Wh = Math.max(0, BATTERY_ENERGY_WH - energyConsumed_Wh)
  const percentRemaining   = (energyRemaining_Wh / BATTERY_ENERGY_WH) * 100
  const secondsRemaining   = Math.max(0, Math.round((energyRemaining_Wh / PELTIER_POWER_W) * 3600))
  const mm = String(Math.floor(secondsRemaining / 60)).padStart(2, '0')
  const ss = String(secondsRemaining % 60).padStart(2, '0')
  const isDead = percentRemaining <= 0
  const isIdle = !isSimulating && elapsedMs === 0

  const barColor = isDead
    ? 'bg-gray-600'
    : percentRemaining > 50
      ? 'bg-green-500'
      : percentRemaining > 20
        ? 'bg-yellow-500'
        : 'bg-red-500'

  const textColor = isDead
    ? 'text-gray-500'
    : percentRemaining > 50
      ? 'text-green-400'
      : percentRemaining > 20
        ? 'text-yellow-400'
        : 'text-red-400'

  const iconColor = percentRemaining > 20
    ? 'text-cyan-400'
    : 'text-red-400'

  const iconBg = percentRemaining > 20
    ? 'bg-cyan-950/50'
    : 'bg-red-950/50'

  const BatteryIcon = isDead || percentRemaining <= 10
    ? BatteryLow
    : percentRemaining <= 30
      ? BatteryWarning
      : Battery

  return (
    <div className="bg-gray-700/40 border border-gray-600/60 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bateria</span>
        <div className={`p-1.5 rounded-lg ${iconBg}`}>
          <BatteryIcon size={15} className={iconColor} />
        </div>
      </div>

      <div className="flex items-end justify-between mb-3">
        <span className={`text-3xl font-bold font-mono leading-none ${isIdle ? 'text-gray-600' : textColor}`}>
          {isIdle ? '—' : `${Math.round(percentRemaining)}%`}
        </span>
        <span className="text-sm font-mono text-gray-400">
          {isIdle ? `${BATTERY_ENERGY_WH} Wh` : `${energyRemaining_Wh.toFixed(1)} Wh`}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isIdle ? 'bg-gray-600' : barColor}`}
          style={{ width: isIdle ? '100%' : `${percentRemaining}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-gray-500">
          {isIdle ? '28:48' : `${mm}:${ss}`}
        </span>
        <span className="text-xs text-gray-600">
          {BATTERY_VOLTAGE_V}V · {BATTERY_CAPACITY_MAH}mAh
        </span>
      </div>

      {isSimulating && isDead && (
        <div className="mt-2 inline-flex items-center gap-1.5 bg-red-950/60 border border-red-800/70 text-red-400 text-xs px-2.5 py-1 rounded-full">
          <BatteryLow size={11} />
          Bateria Esgotada
        </div>
      )}
    </div>
  )
}
