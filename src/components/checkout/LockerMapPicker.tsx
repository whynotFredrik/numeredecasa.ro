'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle2, Search, Loader2, Package, Navigation, AlertTriangle } from 'lucide-react';

export interface LockerData {
  id: string;
  name: string;
  address: string;
  city: string;
  county: string;
  courier_name: string;
  latitude?: string;
  longitude?: string;
}

interface LockerMapPickerProps {
  onLockerSelect: (locker: LockerData | null) => void;
  selectedLocker: LockerData | null;
}

interface RawLocation {
  [key: string]: any;
}

// Romania bounding box center
const ROMANIA_CENTER: [number, number] = [45.9432, 24.9668];
const ROMANIA_ZOOM = 7;

export function LockerMapPicker({ onLockerSelect, selectedLocker }: LockerMapPickerProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [counties, setCounties] = useState<RawLocation[]>([]);
  const [selectedCountyId, setSelectedCountyId] = useState('');
  const [locations, setLocations] = useState<RawLocation[]>([]);
  const [loadingCounties, setLoadingCounties] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Dynamically load Leaflet (avoids SSR issues)
  useEffect(() => {
    let cancelled = false;

    async function loadLeaflet() {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Load JS
      const L = await import('leaflet');
      if (cancelled) return;
      leafletRef.current = L.default || L;

      // Fix default marker icons (Leaflet + webpack issue)
      const DefaultIcon = leafletRef.current.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      leafletRef.current.Marker.prototype.options.icon = DefaultIcon;

      // Initialize map
      if (mapContainerRef.current && !mapRef.current) {
        const map = leafletRef.current.map(mapContainerRef.current).setView(ROMANIA_CENTER, ROMANIA_ZOOM);
        leafletRef.current.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        markersRef.current = leafletRef.current.layerGroup().addTo(map);
        setMapReady(true);
      }
    }

    loadLeaflet().catch(() => setError('Nu s-a putut încărca harta.'));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Load counties on mount
  useEffect(() => {
    setLoadingCounties(true);
    fetch('/api/woot/counties')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        const list = Array.isArray(data) ? data : data?.list || data?.data || [];
        setCounties(list);
      })
      .catch(() => setError('Nu s-au putut încărca județele.'))
      .finally(() => setLoadingCounties(false));
  }, []);

  // Load locations when county changes
  useEffect(() => {
    setLocations([]);
    setSearchTerm('');
    onLockerSelect(null);
    if (!selectedCountyId) {
      if (markersRef.current) markersRef.current.clearLayers();
      if (mapRef.current) mapRef.current.setView(ROMANIA_CENTER, ROMANIA_ZOOM);
      return;
    }

    setLoadingLocations(true);
    setError('');

    fetch(`/api/woot/lockers?county_id=${selectedCountyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setLocations([]);
          return;
        }
        const list = Array.isArray(data) ? data : data?.list || data?.data || [];
        setLocations(list);
      })
      .catch(() => setError('Nu s-au putut încărca lockerele.'))
      .finally(() => setLoadingLocations(false));
  }, [selectedCountyId]);

  // Update map markers when locations change
  useEffect(() => {
    if (!mapReady || !markersRef.current || !leafletRef.current) return;

    markersRef.current.clearLayers();

    const validLocations = locations.filter(
      (loc) => loc.latitude && loc.longitude && !isNaN(Number(loc.latitude)) && !isNaN(Number(loc.longitude))
    );

    if (validLocations.length === 0) return;

    const bounds: [number, number][] = [];

    validLocations.forEach((loc) => {
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      bounds.push([lat, lng]);

      const isHighlighted = highlightedId === String(loc.id);

      // Custom colored icon
      const icon = leafletRef.current.divIcon({
        className: 'custom-locker-marker',
        html: `<div style="
          width: ${isHighlighted ? '32px' : '24px'};
          height: ${isHighlighted ? '32px' : '24px'};
          background: ${isHighlighted ? '#f97316' : '#3b82f6'};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s;
          cursor: pointer;
        "></div>`,
        iconSize: [isHighlighted ? 32 : 24, isHighlighted ? 32 : 24],
        iconAnchor: [isHighlighted ? 16 : 12, isHighlighted ? 16 : 12],
      });

      const courierName = loc.courier_name || '';
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${loc.name || ''}</div>
          <div style="color: #666; font-size: 12px; margin-bottom: 2px;">${loc.address || ''}</div>
          <div style="color: #666; font-size: 12px;">${loc.city_name || ''}, ${loc.county_name || ''}</div>
          ${courierName ? `<div style="color: #999; font-size: 11px; margin-top: 4px;">Curier: ${courierName}</div>` : ''}
          <button onclick="window.__selectLocker__('${loc.id}')" style="
            margin-top: 8px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 6px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
          ">Selectează acest locker</button>
        </div>
      `;

      const marker = leafletRef.current.marker([lat, lng], { icon }).addTo(markersRef.current);
      marker.bindPopup(popupContent);
    });

    // Fit map to markers
    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [locations, mapReady, highlightedId]);

  // Global callback for popup button clicks
  useEffect(() => {
    (window as any).__selectLocker__ = (id: string) => {
      const loc = locations.find((l) => String(l.id) === id);
      if (loc) {
        onLockerSelect({
          id: String(loc.id),
          name: loc.name || '',
          address: loc.address || '',
          city: loc.city_name || loc.city || '',
          county: loc.county_name || loc.county || '',
          courier_name: loc.courier_name || '',
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      }
    };
    return () => { delete (window as any).__selectLocker__; };
  }, [locations, onLockerSelect]);

  // Filtered locations for list
  const filteredLocations = searchTerm
    ? locations.filter(
        (l) =>
          (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (l.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (l.courier_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : locations;

  const handleListItemClick = (loc: RawLocation) => {
    onLockerSelect({
      id: String(loc.id),
      name: loc.name || '',
      address: loc.address || '',
      city: loc.city_name || loc.city || '',
      county: loc.county_name || loc.county || '',
      courier_name: loc.courier_name || '',
      latitude: loc.latitude,
      longitude: loc.longitude,
    });

    // Pan map to location
    if (mapRef.current && loc.latitude && loc.longitude) {
      mapRef.current.setView([Number(loc.latitude), Number(loc.longitude)], 16);
    }
  };

  const handleListItemHover = (loc: RawLocation) => {
    setHighlightedId(String(loc.id));
    if (mapRef.current && loc.latitude && loc.longitude) {
      mapRef.current.panTo([Number(loc.latitude), Number(loc.longitude)]);
    }
  };

  // Geolocate user
  const handleGeolocate = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 14);
      },
      () => { /* silently fail */ }
    );
  };

  // ── Selected locker view ──
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
              <p className="text-foreground/50 text-xs mt-1">Curier: {selectedLocker.courier_name}</p>
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

  // ── Picker view ──
  return (
    <div className="space-y-4 animate-in fade-in">
      {error && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="ml-auto text-xs underline hover:no-underline">
            Închide
          </button>
        </div>
      )}

      {/* County selector */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-semibold text-foreground/70">Județ</label>
          <select
            value={selectedCountyId}
            onChange={(e) => { setError(''); setSelectedCountyId(e.target.value); }}
            disabled={loadingCounties}
            className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
          >
            <option value="">{loadingCounties ? 'Se încarcă...' : 'Selectează județul'}</option>
            {counties.map((c, i) => (
              <option key={c.id ?? c.county_id ?? i} value={String(c.id ?? c.county_id ?? '')}>
                {String(c.name ?? c.county_name ?? '')}
              </option>
            ))}
          </select>
        </div>
        {mapReady && (
          <button
            type="button"
            onClick={handleGeolocate}
            title="Localizează-mă"
            className="p-3 border border-foreground/10 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all"
          >
            <Navigation className="w-5 h-5 text-foreground/50" />
          </button>
        )}
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-foreground/10 shadow-lg">
        <div
          ref={mapContainerRef}
          className="w-full h-[350px] md:h-[420px] bg-foreground/5"
          style={{ zIndex: 1 }}
        />
        {loadingLocations && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-foreground/60">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Se caută lockerele...</span>
            </div>
          </div>
        )}
      </div>

      {/* Location list below map */}
      {selectedCountyId && !loadingLocations && (
        <div className="space-y-3">
          {locations.length === 0 ? (
            <div className="text-center py-6 text-foreground/50">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nu s-au găsit lockere în acest județ.</p>
              <p className="text-xs mt-1">Încearcă alt județ sau alege livrare la domiciliu.</p>
            </div>
          ) : (
            <>
              {locations.length > 3 && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Caută locker după nume, adresă sau curier..."
                    className="w-full bg-foreground/[0.02] border border-foreground/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              )}

              <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1">
                {filteredLocations.map((loc, idx) => (
                  <button
                    key={loc.id ?? idx}
                    type="button"
                    onClick={() => handleListItemClick(loc)}
                    onMouseEnter={() => handleListItemHover(loc)}
                    onMouseLeave={() => setHighlightedId(null)}
                    className={`w-full text-left p-3 rounded-xl border transition-all group ${
                      highlightedId === String(loc.id)
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-foreground/10 hover:border-primary/30 hover:bg-primary/[0.02]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${
                        highlightedId === String(loc.id) ? 'text-primary' : 'text-foreground/40 group-hover:text-primary'
                      }`} />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                          {loc.name || 'Locker'}
                        </p>
                        <p className="text-foreground/60 text-xs truncate">{loc.address || ''}</p>
                        {loc.courier_name && (
                          <p className="text-foreground/40 text-xs">{loc.courier_name}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-foreground/40 text-center">
                {filteredLocations.length} locker{filteredLocations.length !== 1 ? 'e' : ''} disponibil
                {filteredLocations.length !== 1 ? 'e' : ''}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
