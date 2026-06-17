import { Droplets } from 'lucide-react'

const NAV_LINKS = ['Simulador', 'Pesquisa']

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="h-14 shrink-0 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 md:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Droplets size={20} className="text-cyan-400" />
        <span className="font-bold text-base md:text-lg tracking-tight text-white">
          <span className="hidden sm:inline">PROJETO </span>
          <span className="text-cyan-400">ORVALHO</span>
        </span>
        <span className="hidden sm:inline ml-1 text-xs text-gray-500 font-mono border border-gray-600 px-1.5 py-0.5 rounded">
          v0.1
        </span>
      </div>

      {/* Navegação */}
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map(link => (
          <button
            key={link}
            onClick={() => setActiveTab(link)}
            className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === link
                ? 'text-cyan-400 bg-cyan-950/50 border border-cyan-800'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }`}
          >
            {link}
          </button>
        ))}
      </nav>

      {/* Badge do projeto */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="hidden lg:block">Projeto Universitário — Engenharia</span>
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
      </div>
    </header>
  )
}
