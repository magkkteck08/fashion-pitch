"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Truck, Plus, Trash2, Loader2, Save } from 'lucide-react';

export default function AdminDelivery() {
  const [supabase] = useState(() => createClient());
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [form, setForm] = useState({ name: '', fee: '', estimated_time: '' });

  useEffect(() => {
    fetchOptions();
  }, [supabase]);

  async function fetchOptions() {
    const { data } = await supabase.from('delivery_options').select('*').order('fee', { ascending: true });
    if (data) setOptions(data);
    setLoading(false);
  }

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const { error } = await supabase.from('delivery_options').insert([{
      name: form.name,
      fee: parseFloat(form.fee) || 0,
      estimated_time: form.estimated_time
    }]);

    setIsAdding(false);

    if (error) {
      alert(`Error saving delivery option: ${error.message}`);
    } else {
      setForm({ name: '', fee: '', estimated_time: '' });
      setLoading(true);
      fetchOptions();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery option?")) return;
    
    const { error } = await supabase.from('delivery_options').delete().eq('id', id);
    if (!error) {
      setOptions(options.filter(opt => opt.id !== id));
    } else {
      alert(`Error deleting option: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-10">
        <Truck className="text-amber-700" size={28} />
        <div>
          <h1 className="text-3xl font-serif text-slate-900 mb-1">Delivery Zones</h1>
          <p className="text-slate-500 text-sm">Manage shipping locations, fees, and estimated times.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD NEW DELIVERY OPTION */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddOption} className="bg-white border border-slate-200 rounded-sm shadow-sm p-6 sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-6">Add New Zone</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Location Name</label>
                <input required type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition text-sm" placeholder="e.g. Lagos Island (Express)" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Delivery Fee (₦)</label>
                <input required type="number" value={form.fee} onChange={(e) => setForm({...form, fee: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition text-sm" placeholder="e.g. 3500" />
                <p className="text-[9px] text-slate-400 mt-1">Enter 0 for Free Delivery / Pickup</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Estimated Time</label>
                <input required type="text" value={form.estimated_time} onChange={(e) => setForm({...form, estimated_time: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition text-sm" placeholder="e.g. 24 - 48 Hours" />
              </div>
            </div>

            <button type="submit" disabled={isAdding} className="w-full bg-slate-900 text-white py-3 mt-6 uppercase tracking-widest text-[10px] font-bold rounded-sm hover:bg-amber-700 transition flex items-center justify-center gap-2">
              {isAdding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {isAdding ? 'Adding...' : 'Add Delivery Option'}
            </button>
          </form>
        </div>

        {/* LIST OF DELIVERY OPTIONS */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Delivery Zones</h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center"><Loader2 size={24} className="animate-spin text-amber-500 mx-auto" /></div>
            ) : options.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No delivery options added yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {options.map((opt) => (
                  <div key={opt.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <h3 className="font-bold text-slate-900">{opt.name}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Timeline: {opt.estimated_time}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="font-serif text-lg font-bold text-amber-700">
                          {Number(opt.fee) === 0 ? 'FREE' : `₦${Number(opt.fee).toLocaleString()}`}
                        </span>
                      </div>
                      <button onClick={() => handleDelete(opt.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-sm transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}