'use client';

import { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, Loader2, Search, Package } from 'lucide-react';

export interface LockerData {
  id: string;
  name: string;
  address: string;
  city: string;
  county: string;
  courier_name: string;
}

interface LockerPickerProps {
  onLockerSelect: (locker: LockerData | null) => void;
  selectedLocker: LockerData | null;
}

interface County {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface Locker {
  id: string;
  name: string;
  address: string;
  city_name: string;
  county_name: string;
  courier_name: string;
  [key: string]: any;
}

export function LockerPicker({ onLockerSelect, selectedLocker }: LockerPickerProps) {
  const [counties, setCounties] = useState<County[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [lockers, setLockers] = useState<Locker[]>([]);

  const [selectedCountyId, setSelectedCountyId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [loadingCounties, setLoadingCounties] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingLockers, setLoadingLockers] = useState(false);
  const [error, setError] = useState('');

  // Load counties on mount
  useEffect(() => {
    setLoadingCounties(true);
    fetch('/api/woot/counties')
      .then((res) => res.json())
      .then((data) => {
        // API returns array or object with list
        const list = Array.isArray(data) ? data : data?.list || data?.data || [];
        setCounties(list);
      })
      .catch(() => setError('Nu s-au putut încărca județele.'))
      .finally(() => setLoadingCounties(false));
  }, []);

  // Load cities when county changes
  useEffect(() => {
    if (!selectedCountyId) {
      setCities([]);
      setLockers([]);
      return;
    }

    setLoadingCities(true);
    setCities([]);
    setSelectedCityId('');
    setLockers([]);
    onLockerSelect(null);

    fetch(`/api/woot/cities?county_id=${selectedCountyId}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.list || data?.data || [];
        setCities(list);
      })
      .catch(() => setError('Nu s-au putut încărca localitățile.'))
      .finally(() => setLoadingCities(false));
  }, [selectedCountyId]);

  // Load lockers when city changes
  useEffect(() => {
    if (!selectedCityId) {
      setLockers([]);
      return;
    }

    setLoadingLockers(true);
    setLockers([]);
    onLockerSelect(null);

    fetch(`/api/woot/lockers?county_id=${selectedCountyId}&city_id=${selectedCityId}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.list || data?.data || [];
        setLockers(list);
      })
      .catch(() => setError('Nu s-au putut încărca lockerele.'))
      .finally(() => setLoadingLockers(false));
  }, [selectedCityId]);

  const filteredLockers = searchTerm
    ? lockers.filter(
        (l) =>
          (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (l.address || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : lockers;

  const handleSelectLocker = (locker: Locker) => {
    onLockerSelect({
      id: locker.id?.toString() || '',
      name: locker.name || '',
      address: locker.address || '',
      city: locker.city_name || locker.city || '',
      county: locker.county_name || locker.county || '',
      courier_name: locker.courier_name || locker.courier || '',
    });
  };

  // If a locker is already selected, show the selected state
  if (selectedLocker) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <MapPin className="w-24 h-24" />
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="mt-1">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-primary mb-1">{selectedLocker.name}</h4>
            <p className="text-foreground/70 text-sm">{selectedLocker.address}</p>
            <p className="text-foreground/70 text-sm font-medium">
              {selectedLocker.city}, {selectedLocker.county}
            </p>
            {selectedLocker.courier_name && (
              <p className="text-foreground/50 text-xs mt-1">
                Curier: {selectedLocker.courier_name}
              </p>
            )}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => onLockerSelect(null)}
                className="text-sm font-bold text-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-foreground/20 hover:decoration-primary"
              >
                Modifică locker-ul selectat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {/* County selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground/70">Județ</label>
          <select
            value={selectedCountyId}
            onChange={(e) => setSelectedCountyId(e.target.value)}
            disabled={loadingCounties}
            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
          >
            <option value="">
              {loadingCounties ? 'Se încarcă...' : 'Selectează județul'}
            </option>
            {counties.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* City selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground/70">Localitate</label>
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            disabled={!selectedCountyId || loadingCities}
            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none disabled:opacity-50"
          >
            <option value="">
              {loadingCities ? 'Se încarcă...' : 'Selectează localitatea'}
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Locker list */}
      {selectedCityId && (
        <div className="space-y-3">
          {loadingLockers ? (
            <div className="flex items-center justify-center gap-2 py-8 text-foreground/50">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Se caută lockerele disponibile...</span>
            </div>
          ) : lockers.length === 0 ? (
            <div className="text-center py-8 text-foreground/50">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nu s-au găsit lockere în această localitate.</p>
              <p className="text-xs mt-1">Încearcă o altă localitate sau alege livrare la domiciliu.</p>
            </div>
          ) : (
            <>
              {lockers.length > 4 && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Caută locker..."
                    className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              )}

              <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
                {filteredLockers.map((locker, idx) => (
                  <button
                    key={locker.id || idx}
                    type="button"
                    onClick={() => handleSelectLocker(locker)}
                    className="w-full text-left p-4 rounded-xl border border-foreground/10 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-foreground/40 group-hover:text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {locker.name}
                        </p>
                        <p className="text-foreground/60 text-xs mt-0.5">{locker.address}</p>
                        {locker.courier_name && (
                          <p className="text-foreground/40 text-xs mt-0.5">
                            {locker.courier_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-foreground/40 text-center">
                {filteredLockers.length} locker{filteredLockers.length !== 1 ? 'e' : ''} disponibil
                {filteredLockers.length !== 1 ? 'e' : ''}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
