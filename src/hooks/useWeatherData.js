import { useState, useCallback, useRef } from 'react'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

export function useWeatherData() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef(null)

  const searchCities = useCallback((query) => {
    clearTimeout(debounceRef.current)
    if (!query || query.trim().length < 2) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`
        )
        if (!res.ok) { setSuggestions([]); return }
        const data = await res.json()
        setSuggestions(data.map(item => ({
          id: item.id,
          name: item.name,
          region: item.region,
          country: item.country,
          label: [item.name, item.region, item.country].filter(Boolean).join(', '),
        })))
      } catch {
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [])

  const clearSuggestions = useCallback(() => setSuggestions([]), [])

  const fetchWeather = useCallback(async (city) => {
    if (!city.trim()) return
    if (!API_KEY) {
      setError('Chave de API não configurada. Adicione VITE_WEATHER_API_KEY no arquivo .env')
      return
    }

    setIsLoading(true)
    setError(null)
    setWeatherData(null)
    setSuggestions([])

    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`
      )
      if (!res.ok) {
        if (res.status === 400 || res.status === 404) {
          throw new Error('Cidade não encontrada. Verifique o nome e tente novamente.')
        }
        throw new Error(`Erro ao buscar clima (${res.status})`)
      }
      const data = await res.json()
      setWeatherData({
        temp_c: data.current.temp_c,
        humidity: data.current.humidity,
        location_name: `${data.location.name}, ${data.location.country}`,
      })
    } catch (err) {
      setError(err.message || 'Erro inesperado ao buscar dados climáticos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { fetchWeather, isLoading, error, weatherData, searchCities, suggestions, isSearching, clearSuggestions }
}
