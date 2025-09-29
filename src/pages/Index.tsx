import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Index() {
  const [visitas, setVisitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarVisitas() {
      const { data, error } = await supabase
        .from('visits') // tabela no banco
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
              📅 {visita.date} ⏰ {visita.time} 🔗 Local ID: {visita.location_id}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

