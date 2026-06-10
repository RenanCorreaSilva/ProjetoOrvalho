import { Play, Square, Calendar, Clock, Thermometer, Droplets } from 'lucide-react'

export default function ControlPanel({
  temperature, setTemperature,
  humidity, setHumidity,
  date, setDate,
  time, setTime,
  isSimulating,
  onToggleSimulation,
  simResult,
  speed,
  setSpeed,
  elapsedMs,
  totalMl,
}) {
  const r = simResult || {}

  // Tempo simulado (cresce mais rápido que o real quando speed > 1)
  const simulatedSec = Math.floor((elapsedMs / 1000) * speed)
  const simMM = String(Math.floor(simulatedSec / 60)).padStart(2, '0')
  const simSS = String(simulatedSec % 60).padStart(2, '0')
  const simTimeStr = `${simMM}:${simSS}`

  // Tempo real (para exibir quando speed > 1)
  const realSec = Math.floor(elapsedMs / 1000)
  const realMM = String(Math.floor(realSec / 60)).padStart(2, '0')
  const realSS = String(realSec % 60).padStart(2, '0')
  const realTimeStr = `${realMM}:${realSS}`

  return (
    <aside className="w-72 xl:w-80 shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col overflow-y-auto">
      <div className="p-5 flex flex-col gap-6 flex-1">

        {/* Título do painel */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Configurar Cenário
          </h2>
          <p className="text-xs text-gray-600">Defina as condições climáticas para a simulação</p>
        </div>

        {/* --- Data e Hora --- */}
        <section className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Condições de Medição
          </label>

          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg
                         text-gray-200 text-sm focus:outline-none focus:border-cyan-500
                         focus:ring-1 focus:ring-cyan-500/40 transition-colors"
            />
          </div>

          <div className="relative">
            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg
                         text-gray-200 text-sm focus:outline-none focus:border-cyan-500
                         focus:ring-1 focus:ring-cyan-500/40 transition-colors"
            />
          </div>
        </section>

        {/* --- Slider: Temperatura --- */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer size={14} className="text-orange-400" />
              <label className="text-sm text-gray-300 font-medium">Temperatura Ambiente</label>
            </div>
            <span className="text-cyan-400 font-mono text-sm font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900">
              {temperature}°C
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="40"
            value={temperature}
            onChange={e => setTemperature(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-gray-600">
            <span>10°C (mín.)</span>
            <span>40°C (máx.)</span>
          </div>
        </section>

        {/* --- Slider: Umidade Relativa --- */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets size={14} className="text-cyan-400" />
              <label className="text-sm text-gray-300 font-medium">Umidade Relativa</label>
            </div>
            <span className="text-cyan-400 font-mono text-sm font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-900">
              {humidity}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            value={humidity}
            onChange={e => setHumidity(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-gray-600">
            <span>10% (mín.)</span>
            <span>100% (máx.)</span>
          </div>
        </section>

        {/* --- Resumo dos parâmetros --- */}
        <section className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex flex-col gap-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
            Resumo do Cenário
          </p>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Temperatura:</span>
            <span className="text-gray-300 font-mono">{temperature} °C</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Umidade Relativa:</span>
            <span className="text-gray-300 font-mono">{humidity} %</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Ponto de Orvalho:</span>
            <span className="text-cyan-400 font-mono">
              {Number.isFinite(r.dewPoint) ? `${r.dewPoint} °C` : '— °C'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Temp. Dissipador:</span>
            <span className={`font-mono ${r.hasCondensation ? 'text-green-400' : 'text-gray-300'}`}>
              {Number.isFinite(r.tDissipador) ? `${r.tDissipador} °C` : '— °C'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Data / Hora:</span>
            <span className="text-gray-300 font-mono text-right">
              {date || '—'} {time || '—'}
            </span>
          </div>
        </section>

      </div>

      {/* --- Botão principal + controles --- */}
      <div className="p-5 border-t border-gray-700 flex flex-col gap-3">
        <button
          onClick={onToggleSimulation}
          className={`w-full py-4 rounded-xl font-bold text-base tracking-wide transition-all duration-300
                      flex items-center justify-center gap-3 cursor-pointer
                      ${isSimulating
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-gray-900 shadow-lg shadow-cyan-900/40 glow-cyan'
                      }`}
        >
          {isSimulating
            ? <><Square size={18} /> PARAR SIMULAÇÃO</>
            : <><Play size={18} fill="currentColor" /> SIMULAR CAPTAÇÃO</>
          }
        </button>

        {/* --- Velocidade de simulação --- */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Velocidade
          </span>
          <div className="flex gap-2">
            {[1, 1.5, 2].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer
                  ${speed === s
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-900/30'
                    : 'bg-gray-700/50 text-gray-500 border border-gray-600 hover:border-gray-500 hover:text-gray-400'
                  }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* --- Cronômetro --- */}
        {elapsedMs > 0 && (
          <div className="bg-gray-900/60 border border-cyan-900/40 rounded-lg p-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isSimulating ? 'Cronômetro' : 'Último resultado'}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <Clock size={11} />
                Tempo simulado
              </span>
              <span className="font-mono text-sm text-cyan-300 tabular-nums">
                {simTimeStr}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <Droplets size={11} />
                Água gerada
              </span>
              <span className={`font-mono text-sm tabular-nums ${totalMl > 0.001 ? 'text-cyan-400' : 'text-gray-500'}`}>
                {totalMl.toFixed(2)} ml
              </span>
            </div>

            {/* Tempo real — só relevante quando speed > 1 */}
            {speed > 1 && (
              <div className="flex justify-between items-center pt-1.5 border-t border-gray-700/50">
                <span className="text-xs text-gray-600">Tempo real</span>
                <span className="font-mono text-xs text-gray-500 tabular-nums">
                  {realTimeStr}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Indicador de status */}
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full shrink-0 ${isSimulating ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-gray-500">
            {isSimulating ? 'Simulação em andamento...' : 'Aguardando parâmetros'}
          </span>
        </div>
      </div>
    </aside>
  )
}
