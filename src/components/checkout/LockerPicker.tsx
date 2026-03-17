'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, CheckCircle2, Loader2, Search, Package, AlertTriangle } from 'lucide-react';

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

// WOOT API may return various field names — we normalize them
interface RawItem {
  [key: string]: any;
}

function normalizeId(item: RawItem): string {
  return String(item.id ?? item.county_id ?? item.city_id ?? item.locker_id ?? '');
}

function normalizeName(item: RawItem): string {
  return String(item.name ?? item.county_name ?? item.city_name ?? item.locker_name ?? '');
}

function normalizeList(data: any): RawItem[] {
  if (Array.isArray(data)) return data;
  if (data?.list && Array.isArray(data.list)) return data.list;
  if (data?.data && Array.isArray(data.data)) return data.data;
  // If it's an object with numeric keys (like {0: {...}, 1: {...}})
  if (typeof data === 'object' && data !== null && !data.error) {
    const values = Object.values(data);
    if (values.length > 0 && typeof values[0] === 'object') return values as RawItem[];
  }
  return [];
}

export function LockerPicker({ onLockerSelect, selectedLocker }: LockerPickerProps) {
  const [counties, setCounties] = useState<RawItem[]>([]);
  const [cities, setCities] = useState<RawItem[]>([]);
  const [lockers, setLockers] = useState<RawItem[]>([]);

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
    setError('');
    fetch('/api/woot/counties')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        const list = normalizeList(data);
        console.log('[LockerPicker] Counties loaded:', list.length, 'items');
        if (list.length > 0) {
          console.log('[LockerPicker] Sample county:', JSON.stringify(list[0]).slice(0, 200));
        }
        setCounties(list);
      })
      .catch(() => setError('Nu s-au putut încărca județele.'))
      .finally(() => setLoadingCounties(false));
  }, []);

  // Load cities when county changes
  useEffect(() => {
    setCities([]);
    setSelectedCityId('');
    setLockers([]);
    setSearchTerm('');
    onLockerSelect(null);

    if (!selectedCountyId) return;

    setLoadingCities(true);
    setError('');

    fetch(`/api/woot/cities?county_id=${selectedCountyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        const list = normalizeList(data);
        console.log('[LockerPicker] Cities loaded:', list.length, 'for county', selectedCountyId);
        setCities(list);
      })
      .catch(() => setError('Nu s-au putut încărca localitățile.'))
      .finally(() => setLoadingCities(false));
  }, [selectedCountyId]);

  // Load lockers when city changes
  useEffect(() => {
    setLockers([]);
    setSearchTerm('');
    onLockerSelect(null);

    if (!selectedCityId) return;

    setLoadingLockers(true);
    setError('');

    fetch(`/api/woot/lockers?county_id=${selectedCountyId}&city_id=${selectedCityId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.warn('[LockerPicker] Locker error:', data.error);
          // Don't show error for "no lockers" — just show empty state
          if (data.error.includes('404') || data.error.includes('not found')) {
            setLockers([]);
          } else {
            setError(data.error);
          }
          return;
        }
        const list = normalizeList(data);
        console.log('[LockerPicker] Lockers loaded:', list.length, 'for city', selectedCityId);
        if (list.length > 0) {
          console.log('[LockerPicker] Sample locker:', JSON.stringify(list[0]).slice(0, 300));
        }
        setLockers(list);
      })
      .catch(() => setError('Nu s-au putut încărca lockerele.'))
      .finally(() => setLoadingLockers(false));
  }, [selectedCityId]);

  const getLockerName = (l: RawItem) => String(l.name || l.locker_name || '');
  const getLockerAddress = (l: RawItem) => String(l.address || l.locker_address || '');
  const getLockerCity = (l: RawItem) => String(l.city_name || l.city || '');
  const getLockerCounty = (l: RawItem) => String(l.county_name || l.county || '');
  const getLockerCourier = (l: RawItem) => String(l.courier_name || l.courier || '');

  const filteredLockers = searchTerm
    ? lockers.filter(
        (l) =>
          getLockerName(l).toLowerCase().includes(searchTerm.toLowerCase()) ||
          getLockerAddress(l).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : lockers;

  const handleSelectLocker = (locker: RawItem) => {
    onLockerSelect({
      id: normalizeId(locker),
      name: getLockerName(locker),
      address: getLockerAddress(locker),
      city: getLockerCity(locker),
      county: getLockerCounty(locker),
      courier_name: getLockerCourier(locker),
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
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Închide
          </button>
        </div>
      )}

      {/* County selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground/70">Județ</label>
          <select
            value={selectedCountyId}
            onChange={(e) => {
              setError('');
              setSelectedCountyId(e.target.value);
            }}
            disabled={loadingCounties}
            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
          >
            <option value="">
              {loadingCounties ? 'Se încarcă...' : 'Selectează județul'}
            </option>
            {counties.map((c, i) => (
              <option key={normalizeId(c) || i} value={normalizeId(c)}>
                {normalizeName(c)}
              </option>
            ))}
          </select>
        </div>

        {/* City selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground/70">Localitate</label>
          <select
            value={selectedCityId}
            onChange={(e) => {
              setError('');
              setSelectedCityId(e.target.value);
            }}
            disabled={!selectedCountyId || loadingCities}
            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none disabled:opacity-50"
          >
            <option value="">
              {loadingCities ? 'Se încarcă...' : 'Selectează localitatea'}
            </option>
            {cities.map((c, i) => (
              <option key={normalizeId(c) || i} value={normalizeId(c)}>
                {normalizeName(c)}
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
                    key={normalizeId(locker) || idx}
                    type="button"
                    onClick={() => handleSelectLocker(locker)}
                    className="w-full text-left p-4 rounded-xl border border-foreground/10 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-foreground/40 group-hover:text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {getLockerName(locker)}
                        </p>
                        <p className="text-foreground/60 text-xs mt-0.5">{getLockerAddress(locker)}</p>
                        {getLockerCourier(locker) && (
                          <p className="text-foreground/40 text-xs mt-0.5">
                            {getLockerCourier(locker)}
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
