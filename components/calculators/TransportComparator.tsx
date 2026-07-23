import React, { useState } from 'react';
import { 
  estimateTripCost, 
  GRAND_TAXI_ROUTES, 
  TransportMode 
} from '../../lib/transport-rates';
import { 
  Car, 
  Train, 
  Compass, 
  CheckCircle, 
  Navigation, 
  PiggyBank, 
  AlertCircle, 
  Clock 
} from 'lucide-react';

interface TransportComparatorProps {
  lang: 'fr' | 'darija';
}

export function TransportComparator({ lang }: TransportComparatorProps) {
  const [origin, setOrigin] = useState<string>('Casablanca');
  const [destination, setDestination] = useState<string>('Rabat');
  const [distance, setDistance] = useState<number>(10);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
  const [isIntercity, setIsIntercity] = useState<boolean>(false);

  // Estimates
  const costTaxi = isIntercity 
    ? estimateTripCost(origin, destination, 'grand_taxi', distance, timeOfDay)
    : estimateTripCost(origin, destination, 'petit_taxi', distance, timeOfDay);

  const costBus = estimateTripCost(origin, destination, 'bus', distance, timeOfDay);
  const costTram = estimateTripCost(origin, destination, 'tramway', distance, timeOfDay);
  const costCar = estimateTripCost(origin, destination, 'personal_car', distance, timeOfDay);

  // Compare costs to calculate potential savings
  // Best economy is usually Tram or Bus compared to Taxi or Car
  const maxCost = Math.max(costTaxi, costCar);
  const minCost = Math.min(costBus, costTram);
  const savings = Math.max(0, maxCost - minCost);

  const t = {
    title: lang === 'darija' ? 'Mofadalat Triq (Transport Comparator)' : 'Comparateur de Transport',
    subtitle: lang === 'darija' ? 'Kteb blassa dyalk o chouf chhal t-qdar t-khaba3' : 'Simulez vos trajets urbains ou inter-villes pour trouver le moyen de transport le plus économe.',
    intercityLabel: lang === 'darija' ? 'Safar bin l-Moudoun (Intercity)' : 'Trajet Inter-villes (ex: Casa ↔ Rabat)',
    localLabel: lang === 'darija' ? 'Triq f l-Mdina (Urbain)' : 'Trajet local (en ville)',
    originLabel: lang === 'darija' ? 'Mnin (Origine)' : 'Origine / Ville',
    destLabel: lang === 'darija' ? 'Fin (Destination)' : 'Destination',
    distanceLabel: lang === 'darija' ? 'Massa7a b l-Km (Distance)' : 'Distance Estimée (Km)',
    timeLabel: lang === 'darija' ? 'L-Waqt d-Safar' : 'Heure de voyage',
    dayLabel: lang === 'darija' ? 'Nhar (Jour)' : 'Jour (6h - 20h)',
    nightLabel: lang === 'darija' ? 'Lil (Nuit)' : 'Nuit (20h - 6h)',
    recommendationTitle: lang === 'darija' ? 'Nassi7a d-Triq 💡' : 'Conseil d\'Économie Floussi 💡',
    taxiLabel: lang === 'darija' ? 'Taxi' : isIntercity ? 'Grand Taxi (Collectif)' : 'Petit Taxi',
    carLabel: lang === 'darija' ? 'Tomobil dyalk' : 'Voiture Personnelle',
    busLabel: lang === 'darija' ? 'Obis (Bus)' : 'Bus de Ville',
    tramLabel: lang === 'darija' ? 'Tramway' : 'Tramway',
    savingLabel: lang === 'darija' ? 'Khba3ti' : 'Économie possible',
    carNote: lang === 'darija' ? 'Khesak l-Melyan o L-Masrouf' : 'Essence + péages',
    taxiNote: lang === 'darija' ? 'Triq direct' : 'Rapide mais onéreux',
    publicNote: lang === 'darija' ? 'Rkhiss o mzyan' : 'Économique & régulier'
  };

  const getRecommendationMessage = () => {
    if (isIntercity) {
      const diff = Math.max(0, costCar - costTaxi);
      if (diff > 15) {
        return lang === 'darija'
          ? `Khoud l-Grand Taxi, ghadi t-khaba3 htal ${diff} DH par rapport l l-karossa dyalk !`
          : `Privilégiez le Grand Taxi collectif au lieu de votre voiture. Économie estimée : ${diff} DH !`;
      }
      return lang === 'darija'
        ? "Le Grand Taxi hwa l-hall l-moustahsan bin l-moudoun f had t-triq."
        : "Le Grand Taxi collectif reste l'option intermédiaire idéale pour ce trajet.";
    } else {
      const taxiDiff = Math.max(0, costTaxi - costTram);
      if (taxiDiff > 5) {
        return lang === 'darija'
          ? `Prend le Tramway, ghadi t-khaba3 ${taxiDiff} DH par rapport l Petit Taxi ! 💪`
          : `Prenez le Tramway au lieu d'un Petit Taxi ! Vous économisez ${taxiDiff} DH sur ce trajet ! 💪`;
      }
      return lang === 'darija'
        ? "Mzyan t-khdem b l-tramway wla l-tobis bach t-khaba3 f l-masrouf dyal d-dima."
        : "Les transports en commun (Tram/Bus) sont vivement conseillés pour vos trajets réguliers.";
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs space-y-5" id="transport-comparator">
      
      {/* Title block */}
      <div className="space-y-1">
        <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
          <Car size={16} className="text-emerald-600 animate-pulse" />
          <span>{t.title}</span>
        </h3>
        <p className="text-[11px] text-slate-400 font-bold uppercase">{t.subtitle}</p>
      </div>

      {/* Form togglers */}
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => {
            setIsIntercity(false);
            setDistance(8);
          }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            !isIntercity ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.localLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsIntercity(true);
            setDistance(90);
          }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            isIntercity ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.intercityLabel}
        </button>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isIntercity ? (
          <>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                {t.originLabel}
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden"
              >
                <option value="Casablanca">Casablanca</option>
                <option value="Rabat">Rabat</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Fès">Fès</option>
                <option value="Tanger">Tanger</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                {t.destLabel}
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden"
              >
                <option value="Rabat">Rabat</option>
                <option value="Casablanca">Casablanca</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Fès">Fès</option>
                <option value="Agadir">Agadir</option>
              </select>
            </div>
          </>
        ) : (
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
              {t.distanceLabel}
            </label>
            <input
              type="number"
              value={distance}
              min="1"
              max="50"
              onChange={(e) => setDistance(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden font-mono"
            />
          </div>
        )}

        {/* Time of Day */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
            {t.timeLabel}
          </label>
          <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-150">
            <button
              type="button"
              onClick={() => setTimeOfDay('day')}
              className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-center transition-all cursor-pointer ${
                timeOfDay === 'day' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              ☀️ {t.dayLabel}
            </button>
            <button
              type="button"
              onClick={() => setTimeOfDay('night')}
              className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-center transition-all cursor-pointer ${
                timeOfDay === 'night' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              🌙 {t.nightLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Grid Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        
        {/* Taxi option */}
        <div className="bg-amber-50/50 border border-amber-100/80 rounded-2xl p-4 text-center space-y-1 relative overflow-hidden">
          <span className="text-[7px] uppercase tracking-widest font-black text-amber-600 block">{t.taxiLabel}</span>
          <h4 className="text-sm font-mono font-black text-amber-900">{costTaxi} DH</h4>
          <span className="text-[8px] text-amber-500 font-bold uppercase">{t.taxiNote}</span>
        </div>

        {/* Personal Car option */}
        <div className="bg-red-50/50 border border-red-100/80 rounded-2xl p-4 text-center space-y-1 relative overflow-hidden">
          <span className="text-[7px] uppercase tracking-widest font-black text-red-600 block">{t.carLabel}</span>
          <h4 className="text-sm font-mono font-black text-red-900">{costCar} DH</h4>
          <span className="text-[8px] text-red-500 font-bold uppercase">{t.carNote}</span>
        </div>

        {/* Bus Option */}
        <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl p-4 text-center space-y-1 relative overflow-hidden">
          <span className="text-[7px] uppercase tracking-widest font-black text-blue-600 block">{t.busLabel}</span>
          <h4 className="text-sm font-mono font-black text-blue-900">{costBus} DH</h4>
          <span className="text-[8px] text-blue-500 font-bold uppercase">{t.publicNote}</span>
        </div>

        {/* Tram option (if local, otherwise train estimate) */}
        <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 text-center space-y-1 relative overflow-hidden">
          <span className="text-[7px] uppercase tracking-widest font-black text-emerald-600 block">
            {isIntercity ? 'ONCF Train' : t.tramLabel}
          </span>
          <h4 className="text-sm font-mono font-black text-emerald-900">
            {isIntercity ? Math.round(distance * 0.45) : costTram} DH
          </h4>
          <span className="text-[8px] text-emerald-500 font-bold uppercase">{t.publicNote}</span>
        </div>

      </div>

      {/* Recommendation Block */}
      {savings > 0 && (
        <div className="bg-emerald-950 text-white p-4.5 rounded-2xl flex items-start gap-3 shadow-md shadow-emerald-950/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm relative z-10">
            <PiggyBank size={16} />
          </div>
          <div className="space-y-1 relative z-10">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
              {t.recommendationTitle}
            </h4>
            <p className="text-[11px] text-slate-100 font-bold leading-relaxed">
              {getRecommendationMessage()}
            </p>
            <p className="text-[9px] text-emerald-400 font-mono uppercase tracking-wider font-extrabold">
              {t.savingLabel} : +{savings} DH par trajet !
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
export default TransportComparator;
