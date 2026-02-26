import React, { useState, useEffect } from 'react';
import { getMarketListings, postManureOffer } from '../services/api';

const CATEGORIES = ["All", "Poultry", "Cattle", "Goat/Sheep", "Green Manure", "Compost", "Other"];

export default function Marketplace() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ type: '', looking_for: '', category: 'Cattle', contact: '' });

  useEffect(() => {
    fetchMarket();
  }, []);

  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredOffers(offers);
    } else {
      setFilteredOffers(offers.filter(o => o.category === activeFilter));
    }
  }, [activeFilter, offers]);

  const fetchMarket = async () => {
    setLoading(false); // Immediate UI response
    const data = await getMarketListings();
    if (data) setOffers(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await postManureOffer(form);
    if (result?._queued) setStatus('📱 Saved to local sync');
    else setStatus('✅ Posted');
    
    setShowForm(false);
    fetchMarket();
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen pb-20 font-sans">
      
      {/* Header: Minimalist */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-3xl font-black text-gray-900">Market</h1>
        <p className="text-gray-400 text-sm font-medium">Exchange organic resources</p>
      </div>

      {/* Category Filter: Horizontal Scroll */}
      <div className="flex overflow-x-auto gap-3 px-6 py-4 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeFilter === cat 
              ? 'bg-green-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="px-6">
        {status && <div className="bg-black text-white p-3 rounded-xl text-center text-xs font-bold mb-4">{status}</div>}

        {/* Floating Action Button (Alternative to crowded top button) */}
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="fixed bottom-24 right-6 bg-green-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-20"
          >
            +
          </button>
        )}

        {/* Simplified Form */}
        {showForm && (
          <div className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">New Listing</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-xs">Close</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                className="w-full p-4 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500"
                placeholder="What do you have? (e.g. 2 bags pig waste)"
                onChange={e => setForm({...form, type: e.target.value})}
                required
              />
              <select 
                className="w-full p-4 rounded-2xl border-none ring-1 ring-gray-200"
                onChange={e => setForm({...form, category: e.target.value})}
              >
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input 
                className="w-full p-4 rounded-2xl border-none ring-1 ring-gray-200"
                placeholder="Looking for... (e.g. Chicken manure)"
                onChange={e => setForm({...form, looking_for: e.target.value})}
                required
              />
              <input 
                className="w-full p-4 rounded-2xl border-none ring-1 ring-gray-200"
                placeholder="Phone number"
                onChange={e => setForm({...form, contact: e.target.value})}
                required
              />
              <button className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold">Post Offer</button>
            </form>
          </div>
        )}

        {/* Listings: Spaced Out */}
        <div className="space-y-6 mt-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-100 rounded-3xl"></div>
              <div className="h-32 bg-gray-100 rounded-3xl"></div>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-20 text-gray-300 font-medium italic">No listings in {activeFilter}</div>
          ) : (
            filteredOffers.map((offer, i) => (
              <div key={i} className="group border-b border-gray-100 pb-6 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black tracking-widest text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded">
                    {offer.category || 'Other'}
                  </span>
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">Verified Farmer</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{offer.type}</h3>
                    <p className="text-sm text-gray-400">Wants: <span className="text-orange-500 font-bold">{offer.looking_for}</span></p>
                  </div>
                  <button className="ml-4 h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                    →
                  </button>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px]">📍</div>
                  <span className="text-xs font-medium text-gray-400 truncate">{offer.contact}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}