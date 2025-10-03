import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Visita {
  id: string
  date: string
  time: string
  location_id: string
}

export default function Index() {
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarVisitas() {
      const { data, error } = await supabase
        .from('visits')
        .select('id, date, time, location_id')

      if (error) {
        console.error('Erro ao buscar visitas:', error.message)
      } else {
        setVisitas(data || [])
      }
      setLoading(false)
    }

    carregarVisitas()
  }, [])

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return <p>Carregando visitas...</p>
  }

  return (
    <div>
      <h1>Agenda de Visitas</h1>
      {visitas.length === 0 ? (
        <p>Nenhuma visita encontrada.</p>
      ) : (
        <ul>
          {visitas.map((visita) => (
            <li key={visita.id}>
              📅 {formatDate(visita.date)} ⏰ {visita.time} 🔗 Local ID: {visita.location_id}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
