import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance.js';
import { Search, User, Heart, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Debounced input search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const response = await axiosInstance.get(`/search/global?query=${query}`);
        setResults(response.data?.data || null);
      } catch (err) {
        console.error('[Search Error]', err);
      }
    }, 400); // 400ms debounce delay

    return () => clearTimeout(handler);
  }, [query]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Global search..."
          className="bg-accent/40 border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary w-48 focus:w-64 transition-all duration-300"
        />
      </div>

      {/* Search results dropdown listing */}
      {isOpen && results && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-3 shadow-xl z-50 text-xs">
          {/* Matching Users */}
          {results.users?.length > 0 && (
            <div className="mb-3">
              <h5 className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] mb-1">Users</h5>
              <div className="flex flex-col gap-1.5">
                {results.users.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent text-zinc-300 font-medium">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">{u.full_name} ({u.role})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Food listings */}
          {results.donations?.length > 0 && (
            <div className="mb-3">
              <h5 className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] mb-1">Surplus Donations</h5>
              <div className="flex flex-col gap-1.5">
                {results.donations.map((d) => (
                  <Link
                    key={d.id}
                    to={`/donations/${d.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent text-zinc-300 font-medium"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span className="truncate">{d.food_name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matching Complaints */}
          {results.complaints?.length > 0 && (
            <div>
              <h5 className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] mb-1">Complaints</h5>
              <div className="flex flex-col gap-1.5">
                {results.complaints.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent text-zinc-300 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">{c.subject}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!results.users?.length && !results.donations?.length && !results.complaints?.length && (
            <div className="text-center py-4 text-zinc-500 font-semibold">No results match this search query.</div>
          )}
        </div>
      )}
    </div>
  );
}
