import { Visit } from '@/types/visit';

export const visits: Visit[] = [
  {
    id: '1',
    date: '2024-09-01',
    time: '15:30',
    location: {
      name: 'CLÍNICA DA GÁVEA – UNIDADE TIJUCA',
      address: 'Rua Dr. Pereira dos Santos, N° 18 – Tijuca',
      icon: '🏥'
    },
    companions: ['Jefferson', 'Danilo', 'Carlão', 'Sara']
  },
  {
    id: '2',
    date: '2024-09-02',
    time: '15:30',
    location: {
      name: 'VILA SERENA',
      address: 'Rua Pedro Guedes, N° 63 – Maracanã',
      icon: '🏠'
    },
    companions: ['Arypepe', 'Pedro H.', 'João Bosco']
  },
  {
    id: '3',
    date: '2024-09-08',
    time: '16:00',
    location: {
      name: 'HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS',
      address: 'Rua Conde de Bonfim, N° 1030 – Tijuca',
      icon: '🏥'
    },
    companions: ['Roberto', 'Sidney', 'João Bosco']
  },
  {
    id: '4',
    date: '2024-09-15',
    time: '17:00',
    location: {
      name: 'CLÍNICA EVOLUÇÃO',
      address: 'Rua Mariz e Barros, N° 430 – Praça da Bandeira',
      icon: '🏥'
    },
    companions: ['Jefferson', 'Sara']
  },
  {
    id: '5',
    date: '2024-09-16',
    time: '15:30',
    location: {
      name: 'VILA SERENA',
      address: 'Rua Pedro Guedes, N° 63 – Maracanã',
      icon: '🏠'
    },
    companions: ['João Bosco', 'Sara', 'Jefferson']
  },
  {
    id: '6',
    date: '2024-09-17',
    time: '19:30',
    location: {
      name: 'HOSPITAL CASA MENSSANA',
      address: 'Rua Marechal Jofre, N° 30 – Grajaú',
      icon: '🏥'
    },
    companions: ['Cadu', 'Henrique R.', 'Mariana']
  },
  {
    id: '7',
    date: '2024-09-22',
    time: '16:00',
    location: {
      name: 'HOSPITAL SÃO FRANCISCO NA PROVIDÊNCIA DE DEUS',
      address: 'Rua Conde de Bonfim, N° 1030 – Tijuca',
      icon: '🏥'
    },
    companions: ['Roberto', 'João Bosco']
  }
];