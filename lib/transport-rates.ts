export interface GrandTaxiRoute {
  id: string;
  from: string;
  to: string;
  priceDh: number;
}

export const GRAND_TAXI_ROUTES: GrandTaxiRoute[] = [
  { id: 'casa-rabat', from: 'Casablanca', to: 'Rabat', priceDh: 35 },
  { id: 'casa-marrakech', from: 'Casablanca', to: 'Marrakech', priceDh: 85 },
  { id: 'rabat-fes', from: 'Rabat', to: 'Fès', priceDh: 75 },
  { id: 'casa-tanger', from: 'Casablanca', to: 'Tanger', priceDh: 110 },
  { id: 'marrakech-agadir', from: 'Marrakech', to: 'Agadir', priceDh: 75 },
  { id: 'rabat-salé', from: 'Rabat', to: 'Salé', priceDh: 7 },
  { id: 'casa-mohammedia', from: 'Casablanca', to: 'Mohammedia', priceDh: 15 },
];

export const TRAMWAY_RATES = {
  single: 6,
  tenTrips: 60,
  monthlySubscription: 230
};

export const PETIT_TAXI_RATES = {
  dayPerKm: 1.40,
  nightPerKm: 2.10,
  minFareDay: 7.50,
  minFareNight: 10.00
};

export const BUS_RATES: Record<string, { min: number; max: number }> = {
  Casablanca: { min: 5, max: 8 },
  Rabat: { min: 5, max: 7 },
  Marrakech: { min: 4, max: 6 },
  Fès: { min: 4, max: 5 },
  Tanger: { min: 4, max: 6 },
  Default: { min: 4, max: 8 }
};

export type TransportMode = 'petit_taxi' | 'grand_taxi' | 'tramway' | 'bus' | 'personal_car';

export function estimateTripCost(
  from: string,
  to: string,
  mode: TransportMode,
  distanceKm: number = 5,
  timeOfDay: 'day' | 'night' = 'day'
): number {
  switch (mode) {
    case 'petit_taxi': {
      const perKm = timeOfDay === 'day' ? PETIT_TAXI_RATES.dayPerKm : PETIT_TAXI_RATES.nightPerKm;
      const calculated = distanceKm * perKm;
      const minFare = timeOfDay === 'day' ? PETIT_TAXI_RATES.minFareDay : PETIT_TAXI_RATES.minFareNight;
      return Math.round(Math.max(calculated, minFare));
    }
    case 'grand_taxi': {
      // Find matches in fixed grand taxi corridors
      const route = GRAND_TAXI_ROUTES.find(
        r => (r.from.toLowerCase() === from.toLowerCase() && r.to.toLowerCase() === to.toLowerCase()) ||
             (r.from.toLowerCase() === to.toLowerCase() && r.to.toLowerCase() === from.toLowerCase())
      );
      if (route) {
        return route.priceDh;
      }
      // If custom intercity, estimate 0.60 DH per km for group taxi
      return Math.round(distanceKm * 0.65);
    }
    case 'tramway':
      return TRAMWAY_RATES.single;
    case 'bus': {
      const city = from || 'Default';
      const rates = BUS_RATES[city] || BUS_RATES.Default;
      return rates.min; // return base fare
    }
    case 'personal_car': {
      // average 1.10 DH per km fuel cost in Morocco (diesel/sans-plomb mix) + tolls if highway
      const fuelCost = distanceKm * 1.15;
      const tolls = distanceKm > 50 ? 25 : 0; // rough toll simulation
      return Math.round(fuelCost + tolls);
    }
    default:
      return 0;
  }
}
