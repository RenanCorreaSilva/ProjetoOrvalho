import { useState, useMemo } from 'react'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import ThermalChart from './components/ThermalChart'
import PrototypeAnimation from './components/PrototypeAnimation'
import KPIPanel from './components/KPIPanel'
import { calculateSimulation } from './lib/psychrometrics'

export default function App() {
  // --- Estado principal da simulação ---
  const [isSimulating, setIsSimulating] = useState(false)

  // --- Parâmetros climáticos configurados pelo usuário ---
  const [temperature, setTemperature] = useState(28)
  const [humidity, setHumidity] = useState(75)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  // --- Núcleo de simulação ---
  // Recalcula sempre que T ou RH mudarem. O botão controla apenas a EXIBIÇÃO
  // dos resultados (gráfico "AO VIVO" + KPIs), então mover os sliders durante a
  // simulação atualiza tudo em tempo real.
  const simResult = useMemo(
    () => calculateSimulation(temperature, humidity),
    [temperature, humidity]
  )

  const handleToggleSimulation = () => {
    setIsSimulating(prev => !prev)
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-100 flex flex-col overflow-hidden">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        {/* Painel Esquerdo — Controles */}
        <ControlPanel
          temperature={temperature}
          setTemperature={setTemperature}
          humidity={humidity}
          setHumidity={setHumidity}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          isSimulating={isSimulating}
          onToggleSimulation={handleToggleSimulation}
          simResult={simResult}
        />

        {/* Centro — Gráfico Térmico + Animação do Protótipo */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Metade superior: gráfico de temperatura */}
          <div className="flex-1 min-h-0 border-b border-gray-700 p-4">
            <ThermalChart
              isSimulating={isSimulating}
              temperature={temperature}
              humidity={humidity}
              simResult={simResult}
            />
          </div>

          {/* Metade inferior: animação visual do protótipo */}
          <div className="flex-1 min-h-0 p-4 flex flex-col items-center justify-center overflow-hidden">
            <PrototypeAnimation
              isSimulating={isSimulating}
              temperature={temperature}
              humidity={humidity}
              simResult={simResult}
            />
          </div>
        </div>

        {/* Painel Direito — KPIs e Resultados */}
        <KPIPanel isSimulating={isSimulating} simResult={simResult} />
      </main>
    </div>
  )
}
