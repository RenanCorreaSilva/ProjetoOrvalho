// ============================================================================
//  PSICROMETRIA — Núcleo de cálculo termodinâmico do Simulador de Captação
//  Toda a física da condensação atmosférica vive aqui (fonte única de verdade).
//  Os componentes React apenas consomem o resultado de calculateSimulation().
// ============================================================================

// ----------------------------------------------------------------------------
//  CONSTANTES DO PROTÓTIPO  (ajustáveis conforme o hardware real)
// ----------------------------------------------------------------------------
export const AIRFLOW_M3_H = 10      // Vazão de ar do mini cooler (m³/h)
export const PELTIER_POWER_W = 60   // Consumo da pastilha Peltier (W)
export const PELTIER_DELTA_T = 15   // Redução de temperatura do dissipador vs. ambiente (°C)
// Resfriamento radiativo passivo em clima tropical úmido (Brasil): superfície metálica
// exposta ao céu limpo de madrugada irradia ~4 °C abaixo do ar — sem consumo elétrico.
export const PASSIVE_DELTA_T = 4
// Tarifa residencial Light (Rio de Janeiro) — bandeira verde, aprovada ANEEL jun/2025.
// Aplica-se apenas ao modo Peltier + rede elétrica.
export const ENERGY_COST_KWH_GRID_RJ = 0.89

// Bateria 12V Li-Ion 18650 que alimenta o cooler
export const BATTERY_VOLTAGE_V    = 12
export const BATTERY_CAPACITY_MAH = 2400
export const BATTERY_ENERGY_WH    = (BATTERY_VOLTAGE_V * BATTERY_CAPACITY_MAH) / 1000  // 28.8 Wh
export const BATTERY_DURATION_S   = (BATTERY_ENERGY_WH / PELTIER_POWER_W) * 3600       // 1728 s

// ----------------------------------------------------------------------------
//  1. Ponto de Orvalho — Magnus-Tetens
//     Temperatura na qual o ar saturaria (100% UR) e a água condensaria.
// ----------------------------------------------------------------------------
export function getDewPoint(T, RH) {
  const alpha = Math.log(RH / 100) + (17.67 * T) / (T + 243.5)
  const dewPoint = (243.5 * alpha) / (17.67 - alpha)
  return Math.round(dewPoint * 10) / 10 // 1 casa decimal
}

// ----------------------------------------------------------------------------
//  2. Umidade Absoluta (g/m³)
//     Quantidade real de vapor d'água contida em 1 m³ de ar, dadas T e RH.
// ----------------------------------------------------------------------------
export function getAbsoluteHumidity(T, RH) {
  const saturationVaporPressure = 6.112 * Math.exp((17.67 * T) / (T + 243.5))
  const actualVaporPressure = saturationVaporPressure * (RH / 100)
  const absoluteHumidity = (2.16679 * actualVaporPressure * 100) / (T + 273.15)
  return absoluteHumidity
}

// ----------------------------------------------------------------------------
//  3. Algoritmo principal de condensação + viabilidade
//
//  Retorna um objeto único com tudo que a UI precisa:
//    {
//      tAmbiente, rhAmbiente, tDissipador, dewPoint,
//      hasCondensation,            // boolean
//      waterYield_ml_h,            // ml/h
//      efficiency_L_kWh,           // L/kWh
//      costPerLiter_BRL,           // R$/L
//      power_W                     // W (constante do Peltier)
//    }
// ----------------------------------------------------------------------------
export function calculateSimulation(T_ambiente, RH_ambiente, coolingMode = 'peltier') {
  const isPeltier = coolingMode === 'peltier'
  const effectiveDeltaT = isPeltier ? PELTIER_DELTA_T : PASSIVE_DELTA_T
  const effectivePower_W = isPeltier ? PELTIER_POWER_W : 0

  const tDissipador = T_ambiente - effectiveDeltaT
  const dewPoint = getDewPoint(T_ambiente, RH_ambiente)

  // Custo fixo de operação: quanto custa manter o Peltier ligado por hora
  const costPerHour_BRL = isPeltier ? (PELTIER_POWER_W / 1000) * ENERGY_COST_KWH_GRID_RJ : 0

  // Resultado base (cenário sem condensação)
  const result = {
    tAmbiente: T_ambiente,
    rhAmbiente: RH_ambiente,
    tDissipador,
    dewPoint,
    hasCondensation: false,
    waterYield_ml_h: 0,
    efficiency_L_kWh: 0,
    costPerLiter_BRL: 0,
    costPerHour_BRL,
    power_W: effectivePower_W,
    coolingMode,
  }

  // Lógica de geração: só condensa se o dissipador atingir/ultrapassar o ponto de orvalho.
  if (tDissipador <= dewPoint) {
    const AH_in = getAbsoluteHumidity(T_ambiente, RH_ambiente)   // água no ar quente que entra
    const AH_out = getAbsoluteHumidity(tDissipador, 100)         // água que resta no ar frio (saturado) que sai
    const extracted_g_m3 = AH_in - AH_out                        // água arrancada por m³ de ar
    const waterYield_ml_h = extracted_g_m3 * AIRFLOW_M3_H        // 1 g de água ≈ 1 ml

    if (waterYield_ml_h > 0) {
      const liters_h = waterYield_ml_h / 1000
      const efficiency_L_kWh = isPeltier ? liters_h / (PELTIER_POWER_W / 1000) : 0
      const costPerLiter_BRL = isPeltier ? ENERGY_COST_KWH_GRID_RJ / efficiency_L_kWh : 0

      result.hasCondensation = true
      result.waterYield_ml_h = waterYield_ml_h
      result.efficiency_L_kWh = efficiency_L_kWh
      result.costPerLiter_BRL = costPerLiter_BRL
    }
  }

  return result
}

// ----------------------------------------------------------------------------
//  4. Curva de resfriamento do dissipador (Lei de resfriamento de Newton)
//     Gera a série temporal para o gráfico: o dissipador parte da temperatura
//     ambiente e decai exponencialmente até tDissipador. A linha do ponto de
//     orvalho é constante (limiar de condensação).
// ----------------------------------------------------------------------------
export function generateCoolingCurve(T_ambiente, tDissipador, dewPoint, points = 21) {
  const k = 0.18 // constante de resfriamento (quão rápido o Peltier atinge o regime)
  return Array.from({ length: points }, (_, i) => {
    const t = i * 15 // segundos
    const dissipador =
      tDissipador + (T_ambiente - tDissipador) * Math.exp(-k * i)
    return {
      t: `${t}s`,
      dissipador: Math.round(dissipador * 10) / 10,
      orvalho: dewPoint,
    }
  })
}
