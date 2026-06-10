# AWG Sim RDJ — Simulador de Captação Atmosférica de Água

Dashboard interativo para simulação de um protótipo de **Geração Atmosférica de Água (AWG)** por efeito Peltier. Desenvolvido como projeto universitário de Engenharia Mecânica, com foco em visualização do processo termodinâmico de condensação atmosférica.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação](#instalação)
4. [Rodando o Projeto](#rodando-o-projeto)
5. [Navegando pela Interface](#navegando-pela-interface)
   - [Header](#header)
   - [Painel de Controles (esquerda)](#painel-de-controles-esquerda)
   - [Monitor Térmico (centro-topo)](#monitor-térmico-centro-topo)
   - [Animação do Protótipo (centro-base)](#animação-do-protótipo-centro-base)
   - [Painel de Resultados (direita)](#painel-de-resultados-direita)
6. [Fluxo de Uso Passo a Passo](#fluxo-de-uso-passo-a-passo)
7. [Estrutura do Projeto](#estrutura-do-projeto)
8. [Stack Tecnológica](#stack-tecnológica)
9. [Próximos Passos (Lógica Matemática)](#próximos-passos-lógica-matemática)
10. [Build para Produção](#build-para-produção)

---

## Visão Geral

O **AWG Sim RDJ** é um dashboard de simulação que demonstra visualmente como um protótipo de captação de água atmosférica funciona. A interface permite configurar parâmetros climáticos (temperatura e umidade do ar) e observar, em tempo real, como o sistema de resfriamento termoelétrico (módulo Peltier) condensaria a umidade do ar.

> **Estado atual:** Esta versão é exclusivamente de front-end. Todos os resultados numéricos são dados mockados (fictícios) para demonstração da interface. Os pontos de integração com cálculos psicrométricos reais estão marcados no código com o comentário `// TODO: [MATH]`.

---

## Pré-requisitos

Antes de instalar, certifique-se de ter instalado em sua máquina:

| Ferramenta | Versão mínima | Como verificar |
|---|---|---|
| **Node.js** | 18.x ou superior | `node --version` |
| **npm** | 9.x ou superior | `npm --version` |

> **Instalando o Node.js:** Baixe em [nodejs.org](https://nodejs.org) e escolha a versão LTS. O npm já vem incluído.

---

## Instalação

1. **Acesse o diretório do projeto** no terminal:

```bash
cd C:\Users\re_ty\Desktop\ProjetosPessoais\ProjetoOrvalho
```

2. **Instale as dependências:**

```bash
npm install
```

Esse comando baixará automaticamente todas as bibliotecas listadas no `package.json`:
- `react` e `react-dom` — biblioteca de UI
- `recharts` — gráficos de linha e barras
- `lucide-react` — ícones
- `vite`, `tailwindcss`, `postcss`, `autoprefixer` — ferramentas de build e estilos

O processo leva aproximadamente 15–30 segundos. Ao final, você verá a pasta `node_modules/` criada no diretório.

---

## Rodando o Projeto

**Modo desenvolvimento** (com hot-reload):

```bash
npm run dev
```

O terminal exibirá algo como:

```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Abra o navegador e acesse **http://localhost:5173**

> O hot-reload está ativo: qualquer alteração nos arquivos `.jsx` ou `.css` reflete instantaneamente no navegador sem precisar recarregar a página.

**Para parar o servidor:** pressione `Ctrl + C` no terminal.

---

## Navegando pela Interface

O dashboard é dividido em **4 zonas principais**, descritas abaixo.

```
┌──────────────────────────────────────────────────────────────┐
│                          HEADER                               │
├──────────────┬───────────────────────────┬───────────────────┤
│              │   MONITOR TÉRMICO         │                   │
│   PAINEL     │   (gráfico de linhas)     │   PAINEL DE       │
│   DE         ├───────────────────────────┤   RESULTADOS      │
│   CONTROLES  │   ANIMAÇÃO DO PROTÓTIPO   │   (KPIs)          │
│              │   (ventilador, gotas...)  │                   │
└──────────────┴───────────────────────────┴───────────────────┘
```

---

### Header

Localizado no topo da tela.

- **Logo "AWG Sim RDJ"** com ícone de gota d'água — identifica o projeto.
- **Navegação:** três botões — `Simulador`, `Pesquisa`, `Sobre`. O botão ativo fica destacado em azul cyan com borda inferior. *Nota: nesta versão, a navegação é apenas visual (cosmética).*
- **Badge de status** no canto direito: ponto cyan pulsante indica que o app está ativo.

---

### Painel de Controles (esquerda)

Painel com fundo cinza escuro (`bg-gray-800`) na lateral esquerda. É aqui que você **configura o cenário climático** antes de simular.

#### Campos de Data e Hora

- **Data:** clique no campo para abrir o seletor de data do navegador. Representa a data da medição.
- **Hora:** clique no campo para definir o horário da medição.

> Esses valores são exibidos no resumo do cenário e serão usados futuramente para buscar dados climáticos históricos de APIs meteorológicas.

#### Slider — Temperatura Ambiente (°C)

- **Range:** 10°C a 40°C
- **Padrão:** 28°C
- Arraste o controle deslizante para a esquerda (mais frio) ou direita (mais quente).
- O valor atual é exibido em tempo real no badge azul cyan no canto superior direito do slider.

#### Slider — Umidade Relativa (%)

- **Range:** 10% a 100%
- **Padrão:** 75%
- Representa a umidade relativa do ar ambiente. Valores acima de 60% favorecem a condensação.
- O valor atual é atualizado em tempo real.

#### Resumo do Cenário

Bloco informativo que consolida os parâmetros configurados:

| Campo | Descrição |
|---|---|
| Temperatura | Valor atual do slider em °C |
| Umidade Relativa | Valor atual do slider em % |
| Ponto de Orvalho | Mockado em `≈ 18.2°C` durante simulação — será calculado pela fórmula de Magnus |
| Data / Hora | Valores dos campos de data e hora |

#### Botão Principal

- **Estado parado:** botão azul neon com ícone de play — `▶ SIMULAR CAPTAÇÃO`
- **Estado rodando:** botão vermelho com ícone de stop — `■ PARAR SIMULAÇÃO`
- Clique para **alternar** entre os estados.

#### Indicador de Status

Abaixo do botão, um pequeno ponto com texto:
- ⚫ Cinza + *"Aguardando parâmetros"* — sistema parado
- 🟢 Verde pulsante + *"Simulação em andamento..."* — sistema ativo

---

### Monitor Térmico (centro-topo)

Ocupa a metade superior da área central.

**Quando a simulação está parada:**
Exibe um ícone de gráfico com a mensagem *"Inicie a simulação para visualizar os dados"*.

**Quando a simulação está ativa:**
Exibe um gráfico de linhas com:

| Linha | Cor | Descrição |
|---|---|---|
| **Temp. Dissipador** | Azul cyan (sólida) | Temperatura do dissipador termoelétrico caindo ao longo do tempo. Segue a lei de resfriamento de Newton (mockado). |
| **Ponto de Orvalho** | Âmbar/amarelo (tracejada) | Temperatura na qual o vapor d'água do ar começa a condensar. Valor fixo (mockado em 18.2°C). |

> O cruzamento das duas linhas representa o momento em que o dissipador atinge temperatura abaixo do ponto de orvalho — início da condensação efetiva.

**Interatividade do gráfico:**
- Passe o mouse sobre qualquer ponto para ver um **tooltip** com os valores exatos de temperatura.
- O eixo X mostra o tempo em segundos (0s a 600s).
- O eixo Y mostra a temperatura em °C.
- Badge "AO VIVO" verde pulsante no canto superior direito confirma que a simulação está ativa.

---

### Animação do Protótipo (centro-base)

Ocupa a metade inferior da área central. Representa visualmente o fluxo físico do protótipo AWG.

**Componentes do diagrama (da esquerda para a direita):**

```
[Ventilador] → [Tubo PVC] → [Dissipador Peltier] → [Gotas] → [Copo Coletor]
```

| Componente | Estado parado | Estado simulando |
|---|---|---|
| **Ventilador** | SVG estático, bordas cinza | Rotação contínua (animação CSS), bordas cyan, "1200 RPM" |
| **Tubo PVC** | Retângulo cinza estático | Efeito de fluxo pulsante interno |
| **Dissipador** | Cinza escuro, sem brilho | Azul com glow pulsante (efeito Peltier ativo), exibe "22°C" e "Peltier ON" |
| **Gotas** | Tubo vertical estático | Duas gotas azuis caindo em loop contínuo (animação `drip`) |
| **Copo Coletor** | SVG vazio, sem água | Nível de água sobe gradualmente até 2/3 do copo |

**Legenda de status** abaixo do diagrama:
- Quando simulando: exibe `Condensação ativa`, `T = X°C`, `UR = X%`, `Td ≈ 18.2°C` — os valores de T e UR refletem os sliders em tempo real.

---

### Painel de Resultados (direita)

Painel lateral direito com fundo cinza escuro. Exibe os **KPIs (indicadores-chave de performance)** do protótipo.

**Quando a simulação está parada:** todos os valores mostram `—`.

**Quando a simulação está ativa:** os cards exibem os valores mockados:

#### Cards de KPI

| Card | Valor | Unidade | Observação |
|---|---|---|---|
| **Água Coletada** | 115 | ml/h | Volume produzido por hora |
| **Eficiência** | 0.08 | L/kWh | Litros de água por kilowatt-hora consumido |
| **Custo Operacional** | R$ 2.30 | / Litro | Acompanha badge vermelho **"Alerta: Alto Custo"** |
| **Potência Consumida** | 60 | W | Consumo elétrico do módulo Peltier |

#### Análise de Mercado

Gráfico de barras comparando o custo do AWG com outras fontes de água (em R$/litro):

| Fonte | Custo (R$/L) | Cor |
|---|---|---|
| AWG (este protótipo) | R$ 2.30 | Vermelho — mais caro |
| Água filtrada | R$ 0.05 | Cyan |
| Água mineral | R$ 0.80 | Azul |
| Dessalinização | R$ 1.20 | Roxo |

Passe o mouse sobre as barras para ver tooltips com nome e valor exato.

#### Nota informativa

Quando simulando, um bloco âmbar explica que o custo elevado é esperado em protótipos de pequena escala com condições climáticas do Rio de Janeiro.

---

## Fluxo de Uso Passo a Passo

Para uma demonstração completa da interface, siga esta sequência:

**1.** Abra o app em `http://localhost:5173`

**2.** No painel esquerdo, clique no campo **Data** e selecione a data de hoje.

**3.** Clique no campo **Hora** e defina um horário (ex: 14:00).

**4.** Arraste o slider de **Temperatura** para `32°C` — observe o badge atualizando em tempo real.

**5.** Arraste o slider de **Umidade Relativa** para `85%` — observe os valores no Resumo do Cenário.

**6.** Clique no botão azul **"▶ SIMULAR CAPTAÇÃO"**.

**7.** Observe simultaneamente:
   - O botão ficou **vermelho** com texto "PARAR SIMULAÇÃO"
   - O ponto de status ficou **verde pulsante**
   - O centro superior exibiu o **gráfico de linhas** térmico
   - O centro inferior: o **ventilador** começou a girar, o **dissipador** ficou azul, **gotas** começam a cair e o **copo** está enchendo
   - O painel direito exibe os **4 cards com valores** e o **gráfico de barras** de mercado

**8.** Volte ao painel esquerdo e mova o slider de **Temperatura** — note que a legenda da animação e o resumo do cenário atualizam em tempo real, mesmo durante a simulação.

**9.** Clique em **"■ PARAR SIMULAÇÃO"** para interromper. Tudo volta ao estado inicial.

**10.** Clique nos botões de navegação do header (`Pesquisa`, `Sobre`) para ver o efeito de seleção ativa — o tab selecionado fica destacado em cyan.

---

## Estrutura do Projeto

```
ProjetoOrvalho/
│
├── index.html                    # Ponto de entrada HTML
├── package.json                  # Dependências e scripts npm
├── vite.config.js                # Configuração do bundler Vite
├── tailwind.config.js            # Tema, cores e animações customizadas
├── postcss.config.js             # Processamento de CSS
│
└── src/
    ├── main.jsx                  # Bootstrap do React (ReactDOM.createRoot)
    ├── App.jsx                   # Componente raiz — gerencia todo o estado
    ├── index.css                 # Tailwind directives + estilos globais
    │
    └── components/
        ├── Header.jsx            # Topo: logo + navegação
        ├── ControlPanel.jsx      # Painel esquerdo: inputs e botão principal
        ├── ThermalChart.jsx      # Centro-topo: gráfico de linhas (recharts)
        ├── PrototypeAnimation.jsx # Centro-base: animação SVG/CSS do protótipo
        ├── KPIPanel.jsx          # Painel direito: container dos cards e gráfico
        ├── KPICard.jsx           # Card individual de KPI reutilizável
        └── MarketChart.jsx       # Gráfico de barras comparativo (recharts)
```

### Fluxo de Estado

Todo o estado da aplicação reside em `App.jsx` e é passado por props:

```
App.jsx (estado)
  ├── isSimulating  ──► todos os componentes (ativa/desativa visual)
  ├── temperature   ──► ControlPanel, ThermalChart, PrototypeAnimation
  ├── humidity      ──► ControlPanel, PrototypeAnimation
  ├── date          ──► ControlPanel
  └── time          ──► ControlPanel
```

---

## Stack Tecnológica

| Tecnologia | Versão | Função |
|---|---|---|
| **React** | 18.3 | Framework de UI — componentes e estado |
| **Vite** | 5.4 | Bundler e servidor de desenvolvimento |
| **Tailwind CSS** | 3.4 | Estilização utilitária e animações |
| **recharts** | 2.x | Gráficos de linha e barras |
| **lucide-react** | 0.417 | Biblioteca de ícones SVG |
| **PostCSS + Autoprefixer** | — | Processamento e compatibilidade CSS |

---

## Próximos Passos (Lógica Matemática)

Os pontos de integração com cálculos reais estão marcados no código com `// TODO: [MATH]`. Busque essa tag para localizar todos os pontos:

```bash
# No terminal, dentro do projeto:
grep -r "TODO: \[MATH\]" src/
```

### Principais integrações futuras:

**1. Ponto de Orvalho** — `ControlPanel.jsx` e `ThermalChart.jsx`
```
Fórmula de Magnus:
  γ(T, RH) = ln(RH/100) + (17.625 × T) / (243.04 + T)
  Td = 243.04 × γ / (17.625 − γ)
```

**2. Curva de Resfriamento Real** — `ThermalChart.jsx`
```
Lei de Newton: T(t) = T_amb + (T_inicial − T_amb) × e^(−k × t)
Onde k depende do coeficiente de transferência de calor do dissipador real.
```

**3. Taxa de Condensação** — `KPIPanel.jsx` e `PrototypeAnimation.jsx`
```
Depende da área de contato do dissipador (m²), ΔT em relação ao Td,
e coeficiente de condensação do material.
```

**4. Custo Operacional** — `KPIPanel.jsx`
```
Custo (R$/L) = (Potência_W × tempo_h × tarifa_kWh) / Volume_coletado_L
```

---

## Build para Produção

Para gerar os arquivos otimizados para deploy:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`. Para testar o build localmente:

```bash
npm run preview
# Acesse http://localhost:4173
```

O build minificado tem aproximadamente **158 kB** (gzip), pronto para hospedagem em qualquer serviço estático (Vercel, Netlify, GitHub Pages, etc.).
