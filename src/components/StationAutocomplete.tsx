import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Check, Train, Loader2 } from 'lucide-react';
import { Station } from '../types';
import { searchStations, getStationByCode, getCachedStation, getPopularStationsList } from '../services/stationService';

interface StationAutocompleteProps {
  id?: string;
  label?: string;
  value: string; // Station code
  onChange: (station: Station) => void;
  disabledCode?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const StationAutocomplete: React.FC<StationAutocompleteProps> = ({
  id,
  label,
  value,
  onChange,
  disabledCode,
  placeholder = 'Type station name, code, or city...',
  className = '',
  required = false
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync selected station from value prop
  useEffect(() => {
    if (!value) {
      setSelectedStation(null);
      setQuery('');
      return;
    }

    const cached = getCachedStation(value);
    if (cached) {
      setSelectedStation(cached);
      setQuery(`${cached.name} (${cached.code})`);
    } else {
      getStationByCode(value).then((stn) => {
        if (stn) {
          setSelectedStation(stn);
          setQuery(`${stn.name} (${stn.code})`);
        } else {
          setQuery(value);
        }
      });
    }
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset query text to current selected station if dropdown closes without selection
        if (selectedStation) {
          setQuery(`${selectedStation.name} (${selectedStation.code})`);
        } else if (value) {
          setQuery(value);
        } else {
          setQuery('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedStation, value]);

  // Debounced search when query changes while dropdown is open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchStations(query, 25);
        if (isMounted) {
          setResults(data);
          setHighlightedIndex(0);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  const handleSelect = (station: Station) => {
    setSelectedStation(station);
    setQuery(`${station.name} (${station.code})`);
    setIsOpen(false);
    onChange(station);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStation(null);
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[highlightedIndex]) {
        handleSelect(results[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const popularStations = getPopularStationsList().slice(0, 10);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-300 mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400 pointer-events-none">
          <Train className="w-4 h-4 text-emerald-400" />
        </div>

        <input
          id={id}
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => {
            setIsOpen(true);
            // If full station label is shown, select all text for fast retyping
            inputRef.current?.select();
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white font-medium placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
          autoComplete="off"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {loading && <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              title="Clear station"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-h-72 overflow-y-auto divide-y divide-slate-800/60 backdrop-blur-md">
          {/* Quick Header */}
          <div className="px-3 py-1.5 bg-slate-950/80 text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between sticky top-0 backdrop-blur z-10 border-b border-slate-800">
            <span>{query.trim() ? `Live Results (${results.length})` : 'Popular Indian Railway Stations'}</span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ixigo & All 9,000+ Stations
            </span>
          </div>

          {/* Station List */}
          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((stn, idx) => {
                const isSelected = selectedStation?.code === stn.code;
                const isDisabled = disabledCode === stn.code;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={stn.code}
                    onClick={() => {
                      if (!isDisabled) handleSelect(stn);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-950/40 text-slate-500'
                        : isHighlighted
                        ? 'bg-emerald-950/40 text-white'
                        : 'text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <div className="truncate">
                        <div className="font-semibold text-slate-100 truncate flex items-center gap-1.5">
                          <span>{stn.name}</span>
                          {stn.city && stn.city !== stn.name && (
                            <span className="text-[11px] text-slate-400 font-normal">({stn.city})</span>
                          )}
                          {stn.source === 'ixigo' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                              Ixigo
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-2">
                          {stn.state && <span>{stn.state}</span>}
                          {stn.zone && <span className="text-slate-500">[{stn.zone} Zone]</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-800 text-emerald-300 border border-slate-700">
                        {stn.code}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : !loading ? (
            <div className="p-4 text-center text-xs text-slate-400">
              <p className="font-medium text-slate-300">No railway station found for &quot;{query}&quot;</p>
              <p className="text-[11px] mt-1 text-slate-500">
                Try searching by station code (e.g. <span className="text-emerald-400 font-mono">GKP</span>, <span className="text-emerald-400 font-mono">NDLS</span>) or town name.
              </p>
              {query.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    const customCode = query.trim().toUpperCase().slice(0, 6);
                    handleSelect({
                      code: customCode,
                      name: query.trim(),
                      city: query.trim(),
                      state: 'India',
                      source: 'ixigo'
                    });
                  }}
                  className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
                >
                  Use &quot;{query.trim().toUpperCase()}&quot; as station
                </button>
              )}
            </div>
          ) : null}

          {/* Quick Popular Chips when query is empty or short */}
          {!query.trim() && (
            <div className="p-2.5 bg-slate-950/40">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                Quick Select Terminals:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularStations.map((pop) => (
                  <button
                    key={pop.code}
                    type="button"
                    onClick={() => handleSelect(pop)}
                    className="px-2 py-1 text-[11px] font-medium bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                  >
                    {pop.city} ({pop.code})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
