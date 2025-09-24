-- Criar tabela de locais
CREATE TABLE public.locations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🏥',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de companheiros
CREATE TABLE public.companions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de visitas
CREATE TABLE public.visits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de participação (many-to-many entre visitas e companheiros)
CREATE TABLE public.visit_companions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    companion_id UUID NOT NULL REFERENCES public.companions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(visit_id, companion_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_companions ENABLE ROW LEVEL SECURITY;

-- Criar políticas para acesso público (dados do AA são compartilhados)
CREATE POLICY "Todos podem visualizar locais" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Todos podem gerenciar locais" ON public.locations FOR ALL USING (true);

CREATE POLICY "Todos podem visualizar companheiros" ON public.companions FOR SELECT USING (true);
CREATE POLICY "Todos podem gerenciar companheiros" ON public.companions FOR ALL USING (true);

CREATE POLICY "Todos podem visualizar visitas" ON public.visits FOR SELECT USING (true);
CREATE POLICY "Todos podem gerenciar visitas" ON public.visits FOR ALL USING (true);

CREATE POLICY "Todos podem visualizar participações" ON public.visit_companions FOR SELECT USING (true);
CREATE POLICY "Todos podem gerenciar participações" ON public.visit_companions FOR ALL USING (true);

-- Criar triggers para updated_at
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companions_updated_at
    BEFORE UPDATE ON public.companions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visits_updated_at
    BEFORE UPDATE ON public.visits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais dos locais
INSERT INTO public.locations (name, address, icon) VALUES
('VILA SERENA', 'Rua Pedro Guedes, N° 63 – Maracanã', '🏠'),
('CLÍNICA EVOLUÇÃO', 'Rua Mariz e Barros, N° 430 – Praça da Bandeira', '🏥'),
('CLÍNICA DA GÁVEA – UNIDADE TIJUCA', 'Rua Dr. Pereira dos Santos, N° 18 – Tijuca', '🏥'),
('HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS', 'Rua Conde de Bonfim, N° 1030 – Tijuca', '🏥'),
('HOSPITAL CASA MENSSANA', 'Rua Marechal Jofre, N° 30 – Grajaú', '🏥');

-- Inserir companheiros iniciais
INSERT INTO public.companions (name) VALUES
('Arypepe'), ('Pedro H.'), ('João Bosco'), ('Jefferson'), ('Sara'), 
('Danilo'), ('Carlão'), ('Roberto'), ('Sidney'), ('Cadu'), 
('Henrique R.'), ('Mariana');