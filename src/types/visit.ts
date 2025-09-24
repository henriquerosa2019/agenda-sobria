export interface Visit {
  id: string;
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
    icon: string;
  };
  companions: string[];
}

export interface VisitFilter {
  period: 'day' | 'week' | 'month';
  location?: string;
  date?: Date;
}