import { useState, useMemo, useEffect, useRef } from 'react'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import ThermalChart from './components/ThermalChart'
import PrototypeAnimation from './components/PrototypeAnimation'
import KPIPanel from './components/KPIPanel'
import PesquisaPage from './components/PesquisaPage'
import { calculateSimulation, BATTERY_DURATION_S } from './lib/psychrometrics'
import { useWeatherData } from './hooks/useWeatherData'

export default function App() {
  const [activeTab, setActiveTab] = useState('Simulador')
  const [isSimulating, setIsSimulating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [coolingMode, setCoolingMode] = useState('peltier')
  const [temperature, setTemperature] = useState(28)
  const [humidity, setHumidity] = useState(75)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [speed, setSpeed] = useState(1)

  const { fetchWeather, isLoading: weatherLoading, error: weatherError, weatherData, searchCities, suggestions, isSearching, clearSuggestions } = useWeatherData()

  // Quando dados climáticos chegam, preenche temperatura e umidade automaticamente
  useEffect(() => {
    if (weatherData) {
      setTemperature(Math.round(weatherData.temp_c))
      setHumidity(weatherData.humidity)
    }
  }, [weatherData])
  const [elapsedMs, setElapsedMs] = useState(0)
  const [totalMl, setTotalMl] = useState(0)

  const timerRef = useRef(null)
  const speedRef = useRef(speed)
  const simResultRef = useRef(null)

  const simResult = useMemo(
    () => calculateSimulation(temperature, humidity, coolingMode),
    [temperature, humidity, coolingMode]
  )

  // Mantém refs sincronizados para o intervalo ler os valores mais recentes
  // sem precisar reiniciar o timer quando speed ou simResult mudam.
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { simResultRef.current = simResult }, [simResult])

  useEffect(() => {
    if (isSimulating) {
      const TICK = 100
      timerRef.current = setInterval(() => {
        setElapsedMs(prev => prev + TICK * speedRef.current)
        const sr = simResultRef.current
        if (sr?.hasCondensation) {
          setTotalMl(prev => prev + (sr.waterYield_ml_h / 3600) * (TICK / 1000) * speedRef.current)
        }
      }, TICK)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isSimulating])

  // Para a simulação automaticamente quando a bateria se esgota (só no modo Peltier)
  useEffect(() => {
    if (coolingMode === 'peltier' && isSimulating && elapsedMs / 1000 >= BATTERY_DURATION_S) {
      setIsSimulating(false)
      setIsPaused(false)
    }
  }, [elapsedMs, isSimulating, coolingMode])

  const handleStart = () => {
    setElapsedMs(0)
    setTotalMl(0)
    setIsPaused(false)
    setIsSimulating(true)
  }

  const handlePause = () => {
    setIsSimulating(false)
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
    setIsSimulating(true)
  }

  const handleStop = () => {
    setIsSimulating(false)
    setIsPaused(false)
    setElapsedMs(0)
    setTotalMl(0)
  }

  return (
    <div className="min-h-screen lg:h-screen w-full bg-gray-900 text-gray-100 flex flex-col lg:overflow-hidden">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'Simulador' && (
        /* Mobile: coluna única scroll. Desktop (lg+): 3 colunas fixas sem scroll externo */
        <main className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden lg:min-h-0">

          {/* 1ª seção mobile: Configuração — sidebar esquerda no desktop */}
          <ControlPanel
            temperature={temperature} setTemperature={setTemperature}
            humidity={humidity} setHumidity={setHumidity}
            date={date} setDate={setDate}
            time={time} setTime={setTime}
            location={location} setLocation={setLocation}
            fetchWeather={fetchWeather}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            weatherData={weatherData}
            searchCities={searchCities}
            suggestions={suggestions}
            isSearching={isSearching}
            clearSuggestions={clearSuggestions}
            isSimulating={isSimulating}
            isPaused={isPaused}
            coolingMode={coolingMode}
            setCoolingMode={setCoolingMode}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            simResult={simResult}
            speed={speed} setSpeed={setSpeed}
            elapsedMs={elapsedMs}
            totalMl={totalMl}
          />

          {/* 2ª seção mobile: Simulador — Gráfico Térmico + Animação */}
          <div className="flex flex-col min-w-0 lg:flex-1 lg:overflow-hidden">
            <div className="border-b border-gray-700 p-4 min-h-[280px] lg:flex-1 lg:min-h-0">
              <ThermalChart
                isSimulating={isSimulating}
                temperature={temperature}
                humidity={humidity}
                simResult={simResult}
              />
            </div>
            <div className="p-4 flex flex-col items-center justify-center min-h-[340px] lg:flex-1 lg:min-h-0 lg:overflow-hidden">
              <PrototypeAnimation
                isSimulating={isSimulating}
                temperature={temperature}
                humidity={humidity}
                simResult={simResult}
                totalMl={totalMl}
              />
            </div>
          </div>

          {/* 3ª seção mobile: Gráficos e Dados — sidebar direita no desktop */}
          <KPIPanel isSimulating={isSimulating} simResult={simResult} elapsedMs={elapsedMs} />
        </main>
      )}

      {activeTab === 'Pesquisa' && (
        <main className="flex flex-1 overflow-hidden">
          <PesquisaPage />
        </main>
      )}
    </div>
  )
}
