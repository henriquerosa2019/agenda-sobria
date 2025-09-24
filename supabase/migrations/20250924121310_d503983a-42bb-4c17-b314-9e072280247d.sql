-- Inserir as visitas iniciais com base nos dados fornecidos
WITH location_ids AS (
  SELECT id, name FROM public.locations
),
companion_ids AS (
  SELECT id, name FROM public.companions
)

-- Inserir as visitas
INSERT INTO public.visits (date, time, location_id)
SELECT '2024-09-01'::date, '15:30'::time, l.id 
FROM location_ids l WHERE l.name = 'CLÍNICA DA GÁVEA – UNIDADE TIJUCA'
UNION ALL
SELECT '2024-09-02'::date, '15:30'::time, l.id 
FROM location_ids l WHERE l.name = 'VILA SERENA'
UNION ALL
SELECT '2024-09-08'::date, '16:00'::time, l.id 
FROM location_ids l WHERE l.name = 'HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS'
UNION ALL
SELECT '2024-09-15'::date, '17:00'::time, l.id 
FROM location_ids l WHERE l.name = 'CLÍNICA EVOLUÇÃO'
UNION ALL
SELECT '2024-09-16'::date, '15:30'::time, l.id 
FROM location_ids l WHERE l.name = 'VILA SERENA'
UNION ALL
SELECT '2024-09-17'::date, '19:30'::time, l.id 
FROM location_ids l WHERE l.name = 'HOSPITAL CASA MENSSANA'
UNION ALL
SELECT '2024-09-22'::date, '16:00'::time, l.id 
FROM location_ids l WHERE l.name = 'HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS';

-- Inserir as participações dos companheiros nas visitas
WITH visit_data AS (
  SELECT v.id as visit_id, v.date, l.name as location_name
  FROM public.visits v
  JOIN public.locations l ON v.location_id = l.id
),
companion_data AS (
  SELECT id, name FROM public.companions
)

-- Jefferson, Danilo, Carlão, Sara - 01/09 CLÍNICA DA GÁVEA
INSERT INTO public.visit_companions (visit_id, companion_id)
SELECT vd.visit_id, cd.id
FROM visit_data vd, companion_data cd
WHERE vd.date = '2024-09-01' AND vd.location_name = 'CLÍNICA DA GÁVEA – UNIDADE TIJUCA'
AND cd.name IN ('Jefferson', 'Danilo', 'Carlão', 'Sara')

UNION ALL

-- Arypepe, Pedro H., João Bosco - 02/09 VILA SERENA
SELECT vd.visit_id, cd.id
FROM visit_data vd, companion_data cd
WHERE vd.date = '2024-09-02' AND vd.location_name = 'VILA SERENA'
AND cd.name IN ('Arypepe', 'Pedro H.', 'João Bosco')

UNION ALL

-- Roberto, Sidney, João Bosco - 08/09 HOSPITAL SÃO FRANCISCO
SELECT vd.visit_id, cd.id
FROM visit_data vd, companion_data cd
WHERE vd.date = '2024-09-08' AND vd.location_name = 'HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS'
AND cd.name IN ('Roberto', 'Sidney', 'João Bosco')

UNION ALL

-- Jefferson, Sara - 15/09 CLÍNICA EVOLUÇÃO
SELECT vd.visit_id, cd.id
FROM visit_data vd, companion_data cd
WHERE vd.date = '2024-09-15' AND vd.location_name = 'CLÍNICA EVOLUÇÃO'
AND cd.name IN ('Jefferson', 'Sara')

UNION ALL

-- João Bosco, Sara, Jefferson - 16/09 VILA SERENA
SELECT vd.visit_id, cd.id
FROM visit_data vd, companion_data cd
WHERE vd.date = '2024-09-16' AND vd.location_name = 'VILA SERENA'
AND cd.name IN ('João Bosco', 'Sara', 'Jefferson')

UNION ALL

-- Cadu, Henrique R., Mariana - 17/09 HOSPITAL CASA MENSSANA
SELECT vd.visit_id, cd.id
FROM visit_data vd, companion_data cd
WHERE vd.date = '2024-09-17' AND vd.location_name = 'HOSPITAL CASA MENSSANA'
AND cd.name IN ('Cadu', 'Henrique R.', 'Mariana')

UNION ALL

-- Roberto, João Bosco - 22/09 HOSPITAL SÃO FRANCISCO
SELECT vd.visit_id, cd.id
FROM visit_data vd, companion_data cd
WHERE vd.date = '2024-09-22' AND vd.location_name = 'HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS'
AND cd.name IN ('Roberto', 'João Bosco');