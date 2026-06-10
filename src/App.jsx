import { useState, useMemo, useEffect, useRef } from 'react'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import ThermalChart from './components/ThermalChart'
import PrototypeAnimation from './components/PrototypeAnimation'
import KPIPanel from './components/KPIPanel'
import { calculateSimulation } from './lib/psychrometrics'

export default function App() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [temperature, setTemperature] = useState(28)
  const [humidity, setHumidity] = useState(75)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [speed, setSpeed] = useState(1)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [totalMl, setTotalMl] = useState(0)

  const timerRef = useRef(null)
  const speedRef = useRef(speed)
  const simResultRef = useRef(null)

  const simResult = useMemo(
    () => calculateSimulation(temperature, humidity),
    [temperature, humidity]
  )

  // Mantém refs sincronizados para o intervalo ler os valores mais recentes
  // sem precisar reiniciar o timer quando speed ou simResult mudam.
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { simResultRef.current = simResult }, [simResult])

  useEffect(() => {
    if (isSimulating) {
      setElapsedMs(0)
      setTotalMl(0)
      const TICK = 100
      timerRef.current = setInterval(() => {
        setElapsedMs(prev => prev + TICK)
        const sr = simResultRef.current
        if (sr?.hasCondensation) {
          // Acumula ml usando a velocidade atual — correto mesmo com mudanças de speed
          setTotalMl(prev => prev + (sr.waterYield_ml_h / 3600) * (TICK / 1000) * speedRef.current)
        }
      }, TICK)
    } else {
      clearInterval(timerRef.current)
      // elapsedMs e totalMl NÃO são resetados aqui: ficam congelados para o
      // usuário ver o resultado final após parar.
    }
    return () => clearInterval(timerRef.current)
  }, [isSimulating])

  const handleToggleSimulation = () => setIsSimulating(prev => !prev)

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-100 flex flex-col overflow-hidden">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        {/* Painel Esquerdo — Controles */}
        <ControlPanel
          temperature={temperature} setTemperature={setTemperature}
          humidity={humidity} setHumidity={setHumidity}
          date={date} setDate={setDate}
          time={time} setTime={setTime}
          isSimulating={isSimulating}
          onToggleSimulation={handleToggleSimulation}
          simResult={simResult}
          speed={speed} setSpeed={setSpeed}
          elapsedMs={elapsedMs}
          totalMl={totalMl}
        />

        {/* Centro — Gráfico Térmico + Animação do Protótipo */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 min-h-0 border-b border-gray-700 p-4">
            <ThermalChart
              isSimulating={isSimulating}
              temperature={temperature}
              humidity={humidity}
              simResult={simResult}
            />
          </div>
          <div className="flex-1 min-h-0 p-4 flex flex-col items-center justify-center overflow-hidden">
            <PrototypeAnimation
              isSimulating={isSimulating}
              temperature={temperature}
              humidity={humidity}
              simResult={simResult}
              totalMl={totalMl}
            />
          </div>
        </div>

        {/* Painel Direito — KPIs e Resultados */}
        <KPIPanel isSimulating={isSimulating} simResult={simResult} />
      </main>
    </div>
  )
}
