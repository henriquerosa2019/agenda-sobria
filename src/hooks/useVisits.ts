import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Visit, Location, Companion } from '@/types/visit';

export const useVisits = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = async () => {
    try {
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select(`
          id,
          date,
          time,
          location:locations(
            id,
            name,
            address,
            icon
          )
        `)
        .order('date', { ascending: true });

      if (visitsError) throw visitsError;

      // Para cada visita, buscar os companheiros
      const visitsWithCompanions = await Promise.all(
        (visitsData || []).map(async (visit) => {
          const { data: companionsData } = await supabase
            .from('visit_companions')
            .select(`
              companion:companions(
                id,
                name,
                active
              )
            `)
            .eq('visit_id', visit.id);

          return {
            id: visit.id,
            date: visit.date,
            time: visit.time,
            location: visit.location,
            companions: companionsData?.map(vc => vc.companion) || []
          };
        })
      );

      setVisits(visitsWithCompanions);
    } catch (error) {
      console.error('Erro ao buscar visitas:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Erro ao buscar locais:', error);
    }
  };

  const fetchCompanions = async () => {
    try {
      const { data, error } = await supabase
        .from('companions')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCompanions(data || []);
    } catch (error) {
      console.error('Erro ao buscar companheiros:', error);
    }
  };

  const addCompanion = async (name: string) => {
    try {
      const { error } = await supabase
        .from('companions')
        .insert([{ name, active: true }]);

      if (error) throw error;
      await fetchCompanions();
    } catch (error) {
      console.error('Erro ao adicionar companheiro:', error);
      throw error;
    }
  };

  const updateVisitDate = async (visitId: string, date: string, time: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({ date, time })
        .eq('id', visitId);

      if (error) throw error;
      await fetchVisits();
    } catch (error) {
      console.error('Erro ao atualizar visita:', error);
      throw error;
    }
  };

  const addCompanionToVisit = async (visitId: string, companionId: string) => {
    try {
      const { error } = await supabase
        .from('visit_companions')
        .insert([{ visit_id: visitId, companion_id: companionId }]);

      if (error) throw error;
      await fetchVisits();
    } catch (error) {
      console.error('Erro ao adicionar companheiro à visita:', error);
      throw error;
    }
  };

  const removeCompanionFromVisit = async (visitId: string, companionId: string) => {
    try {
      const { error } = await supabase
        .from('visit_companions')
        .delete()
        .eq('visit_id', visitId)
        .eq('companion_id', companionId);

      if (error) throw error;
      await fetchVisits();
    } catch (error) {
      console.error('Erro ao remover companheiro da visita:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchVisits(), fetchLocations(), fetchCompanions()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    visits,
    locations,
    companions,
    loading,
    addCompanion,
    updateVisitDate,
    addCompanionToVisit,
    removeCompanionFromVisit,
    refresh: () => Promise.all([fetchVisits(), fetchLocations(), fetchCompanions()])
  };
};