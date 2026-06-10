import { useState } from 'react'

// ============================================================================
//  VISTA EM CORTE 2D LATERAL (HORIZONTAL) — estilo planta esquemática
//  Ar (esquerda) → Tubo transparente → Cooler → Heatsink → Condensação → Copo
// ============================================================================

export default function PrototypeAnimation({
  isSimulating: isSimulatingProp,
  temperature = 28,
  humidity = 75,
  simResult,
  showDevToggle = false, // botão temporário "Toggle Simulation" para testes isolados
  totalMl = null,        // ml acumulados vindos do cronômetro do App
}) {
  const r = simResult || {}
  // Vazão real calculada (ml/h); fallback para 115 quando rodando isolado sem dados.
  const yieldMlH = Number.isFinite(r.waterYield_ml_h) ? r.waterYield_ml_h : 115
  const dewPoint = Number.isFinite(r.dewPoint) ? r.dewPoint : null
  // Permite testar isoladamente: se receber a prop, usa ela; senão usa estado interno.
  const [internalSim, setInternalSim] = useState(false)
  const isSimulating = isSimulatingProp ?? internalSim

  const collecting =
    isSimulating && (simResult ? r.hasCondensation : true)

  // Nível do copo (0–1) derivado do totalMl acumulado.
  // Copo de 200ml: 1ml captado = 0.5% visível, 200ml = 100% cheio.
  const waterLevel = Math.min((totalMl ?? 0) / 200, 1.0)

  // ---------------------------------------------------------------------------
  // GEOMETRIA — viewBox horizontal
  // ---------------------------------------------------------------------------
  const W = 560
  const H = 360

  // Tubo: cilindro horizontal transparente
  const TUBE_X = 110
  const TUBE_Y = 70
  const TUBE_W = 360
  const TUBE_H = 150
  const TUBE_RY = TUBE_H / 2          // raio vertical da elipse das bocas
  const TUBE_RX = 22                  // raio horizontal (profundidade) das bocas
  const TUBE_CY = TUBE_Y + TUBE_H / 2 // centro vertical do tubo
  const TUBE_RIGHT = TUBE_X + TUBE_W  // boca direita (saída)

  // Cooler (ventoinha) — encaixado DENTRO do anel da boca esquerda.
  // Para nivelar com o aro em TODOS os lados (sem gap, sem cobrir o anel), a
  // ventoinha usa a MESMA proporção elíptica da boca (rx/ry) e raio um pouco
  // menor que ry — fica concêntrica, encostando por dentro do aro brilhante.
  const FAN_CX = TUBE_X
  const FAN_CY = TUBE_CY
  const FAN_BOX = 140  // diâmetro da moldura ≈ altura interna da boca (2*70)
  const FAN_R = 60     // raio das pás, proporcional à moldura
  const FAN_PERSP = TUBE_RX / TUBE_RY // mesma "inclinação" da elipse da boca

  // Heatsink — centro do tubo
  const HS_X = TUBE_X + 150
  const HS_W = 120
  const HS_Y = TUBE_Y + 24
  const HS_H = TUBE_H - 48

  // Copo coletor — menor e totalmente ABAIXO do tubo (não invade o cilindro)
  const CUP_TOP_W = 68
  const CUP_BOT_W = 50
  const CUP_H = 80
  const CUP_CX = TUBE_RIGHT - 14      // sob a boca direita (saída da água)
  const CUP_X = CUP_CX - CUP_TOP_W / 2
  const CUP_Y = TUBE_Y + TUBE_H + 14  // começa logo abaixo da base do tubo
  const CUP_RY = 7

  // Posição da água dentro do copo (fração 0–1 → recorte por clip-path)
  const waterClipTop = 100 - waterLevel * 100

  // Gotas de condensação fixas (animadas por CSS) — posições na face direita do heatsink
  const condensation = [
    { x: HS_X + HS_W + 6,  y: HS_Y + 18,  d: 0.0 },
    { x: HS_X + HS_W + 14, y: HS_Y + 46,  d: 0.4 },
    { x: HS_X + HS_W + 4,  y: HS_Y + 70,  d: 0.8 },
    { x: HS_X + HS_W + 18, y: HS_Y + 94,  d: 0.2 },
    { x: HS_X + HS_W + 10, y: HS_Y + 116, d: 0.6 },
  ]

  return (
    <div className="w-full flex flex-col items-center gap-3 select-none">
      {/* Título */}
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-300">Animação do Protótipo</h3>
        <p className="text-xs text-gray-600 mt-0.5">
          Gerador Atmosférico de Água — vista em corte
        </p>
      </div>

      {/* ======================= SVG PRINCIPAL ======================= */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-2xl"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Vidro do tubo (glassmorphism) */}
          <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#bae6fd" stopOpacity="0.10" />
            <stop offset="45%"  stopColor="#e0f2fe" stopOpacity="0.04" />
            <stop offset="55%"  stopColor="#0ea5e9" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.12" />
          </linearGradient>

          {/* Brilho da borda do tubo */}
          <linearGradient id="glassEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="50%"  stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7" />
          </linearGradient>

          {/* Heatsink ativo (azul-gelo) */}
          <linearGradient id="hsActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#bfdbfe" />
            <stop offset="50%"  stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Heatsink inativo (metal prateado) */}
          <linearGradient id="hsIdle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#cbd5e1" />
            <stop offset="50%"  stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Água no copo */}
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
          </linearGradient>

          {/* Névoa/vento azul */}
          <radialGradient id="mist" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#7dd3fc" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
          </radialGradient>

          {/* Blur para a névoa */}
          <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>

          {/* Glow azul para heatsink ativo */}
          <filter id="glowBlue" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Glow cyan para gotas */}
          <filter id="glowCyan" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Recorte do interior do tubo (gotas não escapam pelas paredes) */}
          <clipPath id="tubeInner">
            <rect x={TUBE_X} y={TUBE_Y + 2} width={TUBE_W} height={TUBE_H - 4} rx="8" />
          </clipPath>

          {/* Recorte do cooler: corpo do tubo + boca esquerda, para a ventoinha
              poder encaixar DENTRO da abertura esquerda sem ser cortada na borda. */}
          <clipPath id="coolerClip">
            <rect x={TUBE_X} y={TUBE_Y + 2} width={TUBE_W} height={TUBE_H - 4} rx="8" />
            <ellipse cx={TUBE_X} cy={TUBE_CY} rx={TUBE_RX} ry={TUBE_RY} />
          </clipPath>
        </defs>

        {/* ============================================================
            1. VENTO / AR — névoa azul entrando pela esquerda
        ============================================================ */}
        <g opacity={isSimulating ? 1 : 0.18} style={{ transition: 'opacity 0.4s' }}>
          {/* Nuvens de névoa */}
          {[
            { y: TUBE_CY - 38, r: 26, dur: 3.2, delay: 0 },
            { y: TUBE_CY,      r: 32, dur: 2.6, delay: 0.5 },
            { y: TUBE_CY + 40, r: 24, dur: 3.6, delay: 1.0 },
          ].map((m, i) => (
            <ellipse
              key={i}
              cx={20} cy={m.y}
              rx={m.r} ry={m.r * 0.7}
              fill="url(#mist)"
              filter="url(#softBlur)"
              style={isSimulating ? {
                animation: `windDrift ${m.dur}s ease-in ${m.delay}s infinite`,
              } : {}}
            />
          ))}

          {/* Linhas de corrente de ar (→) */}
          {[-44, -16, 14, 44].map((dy, i) => (
            <g key={`air${i}`}>
              <line
                x1={6} y1={TUBE_CY + dy}
                x2={TUBE_X - 6} y2={TUBE_CY + dy}
                stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round"
                opacity={isSimulating ? 0.6 : 0.25}
                strokeDasharray="14 10"
                style={isSimulating ? {
                  animation: `airStream 0.7s linear ${i * 0.12}s infinite`,
                } : {}}
              />
              {isSimulating && (
                <polygon
                  points={`${TUBE_X - 6},${TUBE_CY + dy - 4} ${TUBE_X - 6},${TUBE_CY + dy + 4} ${TUBE_X + 2},${TUBE_CY + dy}`}
                  fill="#7dd3fc" opacity="0.7"
                />
              )}
            </g>
          ))}
        </g>

        {/* Label do ar */}
        <text x={28} y={TUBE_Y - 26} textAnchor="middle"
          fill="#7dd3fc" fontSize="11" fontFamily="sans-serif" opacity="0.8">
          Ar úmido
        </text>
        <line x1={28} y1={TUBE_Y - 20} x2={40} y2={TUBE_CY - 30}
          stroke="#7dd3fc" strokeWidth="0.7" opacity="0.4" />

        {/* ============================================================
            2. TUBO TRANSPARENTE (Glassmorphism)
        ============================================================ */}

        {/* Corpo do cilindro — preenchimento SEM stroke.
            As paredes do tubo são só as duas linhas horizontais (topo/base) mais
            abaixo. Não usamos stroke no rect porque as bordas verticais dele
            cairiam DENTRO das elipses das bocas, virando aquela linha reta
            cruzando cada círculo de saída. */}
        <rect
          x={TUBE_X} y={TUBE_Y}
          width={TUBE_W} height={TUBE_H}
          fill="url(#glass)"
        />

        {/* Paredes do tubo = duas linhas horizontais ligando as bocas.
            (Substituem o stroke do rect; assim não há borda vertical nas pontas.) */}
        <line
          x1={TUBE_X} y1={TUBE_Y}
          x2={TUBE_RIGHT} y2={TUBE_Y}
          stroke="url(#glassEdge)" strokeWidth="2" strokeLinecap="round"
        />
        <line
          x1={TUBE_X} y1={TUBE_Y + TUBE_H}
          x2={TUBE_RIGHT} y2={TUBE_Y + TUBE_H}
          stroke="url(#glassEdge)" strokeWidth="2" strokeLinecap="round"
        />

        {/* Reflexo superior (faixa de luz) */}
        <rect
          x={TUBE_X + 10} y={TUBE_Y + 8}
          width={TUBE_W - 20} height="5"
          rx="2.5"
          fill="white" opacity="0.18"
        />
        {/* Reflexo inferior suave */}
        <rect
          x={TUBE_X + 30} y={TUBE_Y + TUBE_H - 14}
          width={TUBE_W - 80} height="4"
          rx="2"
          fill="#38bdf8" opacity="0.12"
        />

        {/* Boca esquerda — tampa elíptica (entrada de ar).
            Desenhada POR CIMA do corpo (igual à direita) para não ficar cortada
            pela parede do cilindro — antes sobrava só meio círculo flutuando. */}
        {/* Anel externo da boca */}
        <ellipse
          cx={TUBE_X} cy={TUBE_CY}
          rx={TUBE_RX} ry={TUBE_RY}
          fill="#0c4a6e" fillOpacity="0.28"
          stroke="url(#glassEdge)" strokeWidth="2"
        />
        {/* Interior da boca (abertura — ar entra por aqui; deixa ver a ventoinha) */}
        <ellipse
          cx={TUBE_X} cy={TUBE_CY}
          rx={TUBE_RX - 6} ry={TUBE_RY - 8}
          fill="#0c4a6e" fillOpacity="0.12"
          stroke="#0ea5e9" strokeWidth="0.75" strokeOpacity="0.45"
        />

        {/* Boca direita — tampa elíptica (mesma profundidade da esquerda).
            Desenhada por cima do corpo: dá a ilusão 3D de cilindro em corte e
            elimina o arco solto / linha sobreposta que havia antes. */}
        {/* Anel externo da boca */}
        <ellipse
          cx={TUBE_RIGHT} cy={TUBE_CY}
          rx={TUBE_RX} ry={TUBE_RY}
          fill="#082f49" fillOpacity="0.55"
          stroke="url(#glassEdge)" strokeWidth="2"
        />
        {/* Interior da boca (profundidade — abertura por onde a água sai) */}
        <ellipse
          cx={TUBE_RIGHT} cy={TUBE_CY}
          rx={TUBE_RX - 6} ry={TUBE_RY - 8}
          fill="#020617" fillOpacity="0.6"
          stroke="#0ea5e9" strokeWidth="0.75" strokeOpacity="0.5"
        />

        {/* Label do tubo */}
        <text x={TUBE_X + TUBE_W * 0.5} y={TUBE_Y - 26} textAnchor="middle"
          fill="#cbd5e1" fontSize="11" fontFamily="sans-serif">
          PVC tube (transparente)
        </text>
        <line x1={TUBE_X + TUBE_W * 0.5} y1={TUBE_Y - 20}
          x2={TUBE_X + TUBE_W * 0.62} y2={TUBE_Y + 4}
          stroke="#64748b" strokeWidth="0.7" opacity="0.5" />

        {/* ============================================================
            3. COOLER FAN — disco em PERSPECTIVA, preso na entrada do tubo.
            Todo o conjunto é comprimido no eixo X (scaleX) em torno de FAN_CX,
            virando uma elipse com a mesma "inclinação" das bocas do tubo. Assim
            a ventoinha parece vista em ângulo, encaixada na abertura esquerda,
            em vez de chapada de frente.
        ============================================================ */}
        <g clipPath="url(#coolerClip)">
          {/* scaleX em torno de FAN_CX: translate → scale → translate de volta */}
          <g transform={`translate(${FAN_CX},0) scale(${FAN_PERSP},1) translate(${-FAN_CX},0)`}>

            {/* Moldura do cooler (disco externo, agora elíptico pela perspectiva) */}
            <circle cx={FAN_CX} cy={FAN_CY} r={FAN_BOX / 2}
              fill="#1e293b" fillOpacity="0.85"
              stroke={isSimulating ? '#0e7490' : '#334155'} strokeWidth="2" />

            {/* Parafusos de fixação (4 ao redor do anel) */}
            {[45, 135, 225, 315].map((deg, i) => {
              const rad = (deg * Math.PI) / 180
              return (
                <circle key={i}
                  cx={FAN_CX + Math.cos(rad) * (FAN_BOX / 2 - 8)}
                  cy={FAN_CY + Math.sin(rad) * (FAN_BOX / 2 - 8)}
                  r="3" fill="#0f172a" stroke="#475569" strokeWidth="0.8"
                />
              )
            })}

            {/* Anel externo da ventoinha */}
            <circle cx={FAN_CX} cy={FAN_CY} r={FAN_R}
              fill="#0f172a"
              stroke={isSimulating ? '#22d3ee' : '#475569'}
              strokeWidth="2" />

            {/* Hélice girando.
                As pás são desenhadas em torno de (0,0); posição + rotação vêm
                JUNTAS do transform CSS (keyframe spinFan já inclui o translate),
                evitando que o CSS sobrescreva um translate de atributo SVG. O
                scaleX do grupo-pai comprime a rotação numa elipse — fica a
                ventoinha girando em perspectiva. */}
            <g
              style={{
                transform: `translate(${FAN_CX}px, ${FAN_CY}px)`,
                animation: isSimulating ? 'spinFan 0.45s linear infinite' : 'none',
              }}
            >
              {[0, 51, 102, 153, 204, 255, 306].map((angle, i) => (
                <g key={i} transform={`rotate(${angle})`}>
                  <path
                    d={`M0,0 C -8,-12 -6,-${FAN_R - 8} 2,-${FAN_R - 4}
                        C 9,-${FAN_R - 12} 9,-14 0,0 Z`}
                    fill={isSimulating ? '#0891b2' : '#475569'}
                    opacity="0.92"
                  />
                </g>
              ))}
              {/* Hub central */}
              <circle r="11" fill={isSimulating ? '#06b6d4' : '#64748b'} />
              <circle r="5" fill={isSimulating ? '#cffafe' : '#94a3b8'} />
            </g>
          </g>
        </g>

        {/* Aro da boca esquerda RE-DESENHADO por cima do cooler (só o contorno),
            para o anel brilhante externo emoldurar a ventoinha em vez de ficar
            coberto por ela. */}
        <ellipse
          cx={TUBE_X} cy={TUBE_CY}
          rx={TUBE_RX} ry={TUBE_RY}
          fill="none"
          stroke="url(#glassEdge)" strokeWidth="2"
        />

        {/* Label cooler fan */}
        <text x={FAN_CX} y={TUBE_Y + TUBE_H + 26} textAnchor="middle"
          fill={isSimulating ? '#22d3ee' : '#64748b'}
          fontSize="11" fontFamily="sans-serif">
          Cooler fan
        </text>
        <line x1={FAN_CX} y1={TUBE_Y + TUBE_H + 16} x2={FAN_CX} y2={TUBE_Y + TUBE_H - 6}
          stroke="#64748b" strokeWidth="0.7" opacity="0.5" />

        {/* ============================================================
            4. METAL HEATSINK — bloco prateado com aletas horizontais
        ============================================================ */}
        <g clipPath="url(#tubeInner)">
          {/* Bloco base */}
          <rect
            x={HS_X} y={HS_Y}
            width={HS_W} height={HS_H}
            rx="4"
            fill={isSimulating ? 'url(#hsActive)' : 'url(#hsIdle)'}
            stroke={isSimulating ? '#93c5fd' : '#94a3b8'}
            strokeWidth="1.5"
            filter={isSimulating ? 'url(#glowBlue)' : undefined}
            style={{ transition: 'all 0.5s ease' }}
          />
          {/* Aletas horizontais (fins) */}
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={i}
              x1={HS_X + 5}
              y1={HS_Y + 8 + i * (HS_H - 16) / 8}
              x2={HS_X + HS_W - 5}
              y2={HS_Y + 8 + i * (HS_H - 16) / 8}
              stroke={isSimulating ? '#1e40af' : '#475569'}
              strokeWidth="2"
              opacity="0.75"
            />
          ))}
          {/* Brilho metálico vertical */}
          <rect
            x={HS_X + 6} y={HS_Y + 4}
            width="4" height={HS_H - 8}
            fill="white" opacity={isSimulating ? 0.35 : 0.22} rx="2"
          />
        </g>

        {/* Label heatsink */}
        <text x={HS_X + HS_W / 2} y={TUBE_Y - 8} textAnchor="middle"
          fill={isSimulating ? '#93c5fd' : '#94a3b8'}
          fontSize="11" fontFamily="sans-serif">
          Metal Heatsink
        </text>
        <line x1={HS_X + HS_W / 2} y1={TUBE_Y - 4} x2={HS_X + HS_W / 2} y2={HS_Y - 2}
          stroke="#64748b" strokeWidth="0.7" opacity="0.5" />

        {/* ============================================================
            5. CONDENSAÇÃO — gotas surgindo no heatsink, escorrendo (→ ↓)
        ============================================================ */}
        <g clipPath="url(#tubeInner)">
          {collecting && condensation.map((g, i) => (
            <circle
              key={i}
              cx={g.x} cy={g.y}
              r="4"
              fill="#38bdf8"
              filter="url(#glowCyan)"
              style={{ animation: `condense 2.4s ease-in ${g.d}s infinite` }}
            />
          ))}
        </g>

        {/* ============================================================
            6. JATO DE SAÍDA — água caindo da BASE do tubo até o copo.
            Origem logo ABAIXO da boca direita (não dentro da elipse), para não
            virar uma "linha" dentro do círculo de saída.
        ============================================================ */}
        {collecting && [0, 0.47, 0.94].map((delay, i) => (
          <ellipse
            key={i}
            cx={CUP_CX} cy={TUBE_Y + TUBE_H + 4}
            rx="3" ry="4.5"
            fill="#22d3ee"
            filter="url(#glowCyan)"
            style={{ animation: `pour 1.4s ease-in ${delay}s infinite` }}
          />
        ))}

        {/* ============================================================
            7. COPO COLETOR — embaixo da saída, enchendo de água
        ============================================================ */}

        {/* Sombra */}
        <ellipse
          cx={CUP_CX} cy={CUP_Y + CUP_H + 8}
          rx={CUP_BOT_W / 2 + 6} ry={6}
          fill="black" opacity="0.3"
        />

        {/* Corpo do copo (trapézio) */}
        <polygon
          points={`
            ${CUP_X},${CUP_Y}
            ${CUP_X + CUP_TOP_W},${CUP_Y}
            ${CUP_X + CUP_TOP_W - (CUP_TOP_W - CUP_BOT_W) / 2},${CUP_Y + CUP_H}
            ${CUP_X + (CUP_TOP_W - CUP_BOT_W) / 2},${CUP_Y + CUP_H}
          `}
          fill="#0c4a6e" fillOpacity="0.18"
          stroke={isSimulating ? '#38bdf8' : '#475569'}
          strokeWidth="1.5"
        />

        {/* Água — recorte por clip-path controlado por waterLevel */}
        {waterLevel > 0 && (
          <polygon
            points={`
              ${CUP_X + 2},${CUP_Y + 2}
              ${CUP_X + CUP_TOP_W - 2},${CUP_Y + 2}
              ${CUP_X + CUP_TOP_W - (CUP_TOP_W - CUP_BOT_W) / 2 - 2},${CUP_Y + CUP_H - 2}
              ${CUP_X + (CUP_TOP_W - CUP_BOT_W) / 2 + 2},${CUP_Y + CUP_H - 2}
            `}
            fill="url(#water)"
            style={{
              clipPath: `polygon(0% ${waterClipTop}%, 100% ${waterClipTop}%, 100% 100%, 0% 100%)`,
              transition: 'clip-path 0.5s ease-out',
            }}
          />
        )}

        {/* Linha da superfície da água */}
        {waterLevel > 0.04 && (() => {
          const frac = waterLevel
          const halfTop = (CUP_TOP_W - (CUP_TOP_W - CUP_BOT_W) * (1 - frac)) / 2
          const yW = CUP_Y + CUP_H * (1 - frac)
          return (
            <line
              x1={CUP_CX - halfTop + 3} y1={yW}
              x2={CUP_CX + halfTop - 3} y2={yW}
              stroke="#67e8f9" strokeWidth="1.5" opacity="0.8"
            />
          )
        })()}

        {/* Aro superior do copo */}
        <ellipse
          cx={CUP_CX} cy={CUP_Y}
          rx={CUP_TOP_W / 2} ry={CUP_RY}
          fill="none"
          stroke={isSimulating ? '#38bdf8' : '#475569'}
          strokeWidth="1.5"
          opacity={isSimulating ? 0.8 : 0.5}
        />

        {/* Reflexo lateral do copo */}
        <line
          x1={CUP_X + 8} y1={CUP_Y + 8}
          x2={CUP_X + (CUP_TOP_W - CUP_BOT_W) / 2 + 6} y2={CUP_Y + CUP_H - 8}
          stroke="white" strokeWidth="1.5" opacity="0.10"
        />

        {/* Label do copo */}
        <text x={CUP_CX} y={CUP_Y + CUP_H + 24} textAnchor="middle"
          fill={isSimulating ? '#22d3ee' : '#64748b'}
          fontSize="11" fontFamily="monospace">
          Coletor · 200ml
        </text>

        {/* Indicador de volume lateral — régua à direita do copo */}
        <g>
          {/* Linha vertical da régua */}
          <line
            x1={CUP_X + CUP_TOP_W + 8} y1={CUP_Y}
            x2={CUP_X + CUP_TOP_W + 8} y2={CUP_Y + CUP_H}
            stroke="#334155" strokeWidth="1" opacity="0.6"
          />
          {/* Marcas de graduação (0%, 50%, 100%) */}
          {[0, 0.5, 1].map((frac, i) => (
            <line key={i}
              x1={CUP_X + CUP_TOP_W + 5} y1={CUP_Y + CUP_H * frac}
              x2={CUP_X + CUP_TOP_W + 11} y2={CUP_Y + CUP_H * frac}
              stroke="#475569" strokeWidth="1" opacity="0.6"
            />
          ))}
          {/* Marcador no nível atual */}
          <line
            x1={CUP_X + CUP_TOP_W + 4}
            y1={CUP_Y + CUP_H * (1 - waterLevel)}
            x2={CUP_X + CUP_TOP_W + 15}
            y2={CUP_Y + CUP_H * (1 - waterLevel)}
            stroke={waterLevel > 0.02 ? '#22d3ee' : '#334155'}
            strokeWidth="2"
            opacity={waterLevel > 0.02 ? 0.9 : 0.4}
          />
          {/* Volume em ml — usa o total acumulado do cronômetro quando disponível */}
          <text
            x={CUP_X + CUP_TOP_W + 18}
            y={CUP_Y + CUP_H * (1 - waterLevel)}
            fill={waterLevel > 0.02 ? '#67e8f9' : '#475569'}
            fontSize="10" fontFamily="monospace"
            dominantBaseline="middle"
          >
            {totalMl !== null
              ? `${totalMl.toFixed(1)} ml`
              : `${Math.round(waterLevel * yieldMlH)} ml`}
          </text>
        </g>

        {/* ============================================================
            KEYFRAMES INLINE
        ============================================================ */}
        <style>{`
          @keyframes spinFan {
            from { transform: translate(${FAN_CX}px, ${FAN_CY}px) rotate(0deg); }
            to   { transform: translate(${FAN_CX}px, ${FAN_CY}px) rotate(360deg); }
          }
          @keyframes windDrift {
            0%   { transform: translateX(0px)   scale(0.85); opacity: 0; }
            30%  { opacity: 0.9; }
            100% { transform: translateX(${TUBE_X - 24}px) scale(1.15); opacity: 0; }
          }
          @keyframes airStream {
            0%   { stroke-dashoffset: 24; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes condense {
            0%   { transform: translate(0px, 0px);    opacity: 0;   r: 1.5px; }
            25%  { opacity: 0.95; }
            100% { transform: translate(10px, 64px);  opacity: 0;   }
          }
          @keyframes pour {
            0%   { transform: translateY(0px);   opacity: 0;   }
            15%  { opacity: 0.95; }
            85%  { opacity: 0.9;  }
            100% { transform: translateY(${CUP_Y - (TUBE_Y + TUBE_H) + 22}px); opacity: 0; }
          }
        `}</style>
      </svg>

      {/* ======================= LEGENDA DE STATUS ======================= */}
      {isSimulating ? (
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs
                        bg-gray-800/70 px-5 py-2 rounded-full border border-gray-700">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse" />
            Condensação ativa
          </span>
          <span className="font-mono text-gray-400">T = {temperature}°C</span>
          <span className="font-mono text-gray-400">UR = {humidity}%</span>
          <span className="font-mono text-cyan-400">
            Td {dewPoint !== null ? `≈ ${dewPoint}°C` : '—'}
          </span>
        </div>
      ) : (
        <p className="text-xs text-gray-700 italic">
          Clique em "Simular Captação" para iniciar a demonstração
        </p>
      )}

      {/* ======= BOTÃO TEMPORÁRIO DE TESTE (só quando showDevToggle) ======= */}
      {showDevToggle && (
        <button
          onClick={() => setInternalSim(s => !s)}
          className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                     border-cyan-600 text-cyan-300 hover:bg-cyan-950/50"
        >
          Toggle Simulation ({internalSim ? 'ON' : 'OFF'})
        </button>
      )}
    </div>
  )
}
