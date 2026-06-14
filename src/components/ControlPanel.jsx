import { Play, Square, Pause, Calendar, Clock, Thermometer, Droplets, Zap, MapPin, Search, Loader } from 'lucide-react'
import { useState, useRef } from 'react'

export default function ControlPanel({
  temperature, setTemperature,
  humidity, setHumidity,
  date, setDate,
  time, setTime,
  location, setLocation,
  fetchWeather,
  weatherLoading,
  weatherError,
  weatherData,
  searchCities,
  suggestions,
  isSearching,
  clearSuggestions,
  isSimulating,
  isPaused,
  coolingMode,
  setCoolingMode,
  onStart,
  onPause,
  onResume,
  onStop,
  simResult,
  speed,
  setSpeed,
  elapsedMs,
  totalMl,
}) {
  const [localInput, setLocalInput] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const containerRef = useRef(null)

  const handleInputChange = (e) => {
    const val = e.target.value
    setLocalInput(val)
    setDropdownOpen(true)
    searchCities(val)
  }

  const handleSelect = (suggestion) => {
    setLocalInput(suggestion.label)
    setLocation(suggestion.label)
    setDropdownOpen(false)
    clearSuggestions()
    fetchWeather(suggestion.label)
  }

  const handleSearch = () => {
    if (localInput.trim()) {
      setLocation(localInput.trim())
      setDropdownOpen(false)
      clearSuggestions()
      fetchWeather(localInput.trim())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') { setDropdownOpen(false); clearSuggestions() }
  }

  const handleBlur = (e) => {
    // Fecha dropdown só se o foco saiu do container inteiro (incluindo itens da lista)
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setDropdownOpen(false)
    }
  }
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

          {/* Toggle: fonte de resfriamento */}
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              {[
                { value: 'peltier',  label: 'Pastilha Peltier', icon: <Zap size={12} /> },
                { value: 'ambiente', label: 'Temp. Ambiente',   icon: <Thermometer size={12} /> },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCoolingMode(opt.value)}
                  disabled={isSimulating || isPaused}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all
                    flex items-center justify-center gap-1.5
                    ${isSimulating || isPaused ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${coolingMode === opt.value
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-900/30'
                      : 'bg-gray-700/50 text-gray-500 border border-gray-600 hover:border-gray-500 hover:text-gray-400'
                    }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-snug">
              {coolingMode === 'peltier'
                ? 'Resfria −15 °C · rede elétrica · R$ 0,89/kWh'
                : 'Resfriamento radiativo −4 °C · sem custo energético'}
            </p>
          </div>

          {/* --- Local / Cidade --- */}
          <div className="flex flex-col gap-1.5" ref={containerRef} onBlur={handleBlur}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
                <input
                  type="text"
                  value={localInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (suggestions.length > 0) setDropdownOpen(true) }}
                  placeholder="Ex: Rio de Janeiro"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg
                             text-gray-200 text-sm focus:outline-none focus:border-cyan-500
                             focus:ring-1 focus:ring-cyan-500/40 transition-colors placeholder:text-gray-600"
                />
                {/* Dropdown de sugestões */}
                {dropdownOpen && (suggestions.length > 0 || isSearching) && (
                  <ul className="absolute left-0 right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600
                                 rounded-lg shadow-xl overflow-hidden">
                    {isSearching && suggestions.length === 0 && (
                      <li className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-500">
                        <Loader size={11} className="animate-spin" /> Buscando...
                      </li>
                    )}
                    {suggestions.map(s => (
                      <li key={s.id}>
                        <button
                          tabIndex={0}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleSelect(s)}
                          className="w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-gray-700
                                     focus:bg-gray-700 focus:outline-none transition-colors cursor-pointer"
                        >
                          <MapPin size={11} className="text-cyan-500 mt-0.5 shrink-0" />
                          <span className="flex flex-col">
                            <span className="text-gray-200 text-xs font-medium">{s.name}</span>
                            {(s.region || s.country) && (
                              <span className="text-gray-500 text-xs">{[s.region, s.country].filter(Boolean).join(', ')}</span>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={weatherLoading || !localInput.trim()}
                className="px-3 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                {weatherLoading
                  ? <Loader size={13} className="animate-spin" />
                  : <Search size={13} />
                }
                {weatherLoading ? '' : 'Buscar'}
              </button>
            </div>

            {weatherError && (
              <p className="text-xs text-red-400 leading-snug">{weatherError}</p>
            )}

            {weatherData && !weatherError && (
              <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-900/20 border border-green-800/40 rounded-md px-2.5 py-1.5">
                <MapPin size={11} className="shrink-0" />
                <span className="truncate font-medium">{weatherData.location_name}</span>
                <span className="shrink-0 text-green-300 font-mono ml-auto">
                  {Math.round(weatherData.temp_c)}°C · {weatherData.humidity}%
                </span>
              </div>
            )}
          </div>

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

          <div className="relative">
            {/* Traço de referência no ponto 0 (centro exato do range -40..40) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full pointer-events-none z-10"
              style={{ background: temperature === 0 ? '#06b6d4' : '#6b7280' }}
            />
            <input
              type="range"
              min="-40"
              max="40"
              value={temperature}
              onChange={e => {
                const v = Number(e.target.value)
                // Snap para 0 quando dentro de ±2
                setTemperature(v >= -2 && v <= 2 ? 0 : v)
              }}
              className="w-full"
            />
          </div>

          <div className="flex justify-between text-xs text-gray-600">
            <span>−40°C</span>
            <span className={temperature === 0 ? 'text-cyan-400 font-semibold' : ''}>0°C</span>
            <span>40°C</span>
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
            <span className="text-gray-500">Resfriamento:</span>
            <span className={`font-mono ${coolingMode === 'peltier' ? 'text-cyan-400' : 'text-gray-300'}`}>
              {coolingMode === 'peltier' ? 'Peltier · rede' : 'Amb. (passivo)'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Local:</span>
            <span className="text-gray-300 font-mono text-right truncate max-w-[140px]">
              {weatherData?.location_name || location || '—'}
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
        {/* Estado: parado (nunca rodou ou foi parado do zero) */}
        {!isSimulating && !isPaused && (
          <button
            onClick={onStart}
            className="w-full py-4 rounded-xl font-bold text-base tracking-wide transition-all duration-300
                       flex items-center justify-center gap-3 cursor-pointer
                       bg-cyan-500 hover:bg-cyan-400 text-gray-900 shadow-lg shadow-cyan-900/40 glow-cyan"
          >
            <Play size={18} fill="currentColor" /> SIMULAR CAPTAÇÃO
          </button>
        )}

        {/* Estado: rodando — mostra PAUSAR + PARAR lado a lado */}
        {isSimulating && (
          <div className="flex gap-2">
            <button
              onClick={onPause}
              className="flex-1 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300
                         flex items-center justify-center gap-2 cursor-pointer
                         bg-amber-500 hover:bg-amber-400 text-gray-900 shadow-lg shadow-amber-900/40"
            >
              <Pause size={16} fill="currentColor" /> PAUSAR
            </button>
            <button
              onClick={onStop}
              className="flex-1 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300
                         flex items-center justify-center gap-2 cursor-pointer
                         bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40"
            >
              <Square size={16} /> PARAR
            </button>
          </div>
        )}

        {/* Estado: pausado — mostra RETOMAR + PARAR lado a lado */}
        {!isSimulating && isPaused && (
          <div className="flex gap-2">
            <button
              onClick={onResume}
              className="flex-1 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300
                         flex items-center justify-center gap-2 cursor-pointer
                         bg-cyan-500 hover:bg-cyan-400 text-gray-900 shadow-lg shadow-cyan-900/40"
            >
              <Play size={16} fill="currentColor" /> RETOMAR
            </button>
            <button
              onClick={onStop}
              className="flex-1 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300
                         flex items-center justify-center gap-2 cursor-pointer
                         bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40"
            >
              <Square size={16} /> PARAR
            </button>
          </div>
        )}


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
          <div className={`w-2 h-2 rounded-full shrink-0 ${isSimulating ? 'bg-green-400 animate-pulse' : isPaused ? 'bg-amber-400' : 'bg-gray-600'}`} />
          <span className="text-gray-500">
            {isSimulating ? 'Simulação em andamento...' : isPaused ? 'Simulação pausada' : 'Aguardando parâmetros'}
          </span>
        </div>
      </div>
    </aside>
  )
}
