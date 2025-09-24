export interface Location {
  id: string;
  name: string;
  address: string;
  icon: string;
}

export interface Companion {
  id: string;
  name: string;
  active: boolean;
}

export interface Visit {
  id: string;
  date: string;
  time: string;
  location: Location;
  companions: Companion[];
}

export interface VisitFilter {
  period: 'day' | 'week' | 'month';
  location?: string;
  date?: Date;
}