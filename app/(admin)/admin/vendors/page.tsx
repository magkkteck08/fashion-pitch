'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trash2, Loader2, Plus, X, ChevronDown, Edit } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export default function VendorManagement() {
  const supabase = createClient();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    vendor_name: '',
    logo_url: '',
    status: 'active',
    default_fee: '3000', 
    state_fees: [] as { states: string[], fee: string }[] 
  });

  useEffect(() => {
    fetchVendors();
  }, [supabase]);

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from('verified_vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVendors(data);
    }
    setLoading(false);
  };

  const addStateRow = () => {
    setForm({ ...form, state_fees: [...form.state_fees, { states: [], fee: '0' }] });
    setOpenDropdownIndex(form.state_fees.length); 
  };

  const removeStateRow = (index: number) => {
    const newFees = [...form.state_fees];
    newFees.splice(index, 1);
    setForm({ ...form, state_fees: newFees });
    setOpenDropdownIndex(null);
  };

  const toggleStateSelection = (rowIndex: number, stateName: string, isChecked: boolean) => {
    const newFees = [...form.state_fees];
    if (isChecked) {
      newFees[rowIndex].states.push(stateName);
    } else {
      newFees[rowIndex].states = newFees[rowIndex].states.filter(s => s !== stateName);
    }
    setForm({ ...form, state_fees: newFees });
  };

  const updateFee = (rowIndex: number, value: string) => {
    const newFees = [...form.state_fees];
    newFees[rowIndex].fee = value;
    setForm({ ...form, state_fees: newFees });
  };

  const handleEditClick = (vendor: any) => {
    // Reverse-engineer the JSON map back into the UI format
    let extractedDefaultFee = '0';
    const groupedFees: Record<string, string[]> = {};

    if (vendor.state_delivery_fees) {
      Object.entries(vendor.state_delivery_fees).forEach(([stateName, feeValue]) => {
        if (stateName === 'Default') {
          extractedDefaultFee = String(feeValue);
        } else {
          const feeStr = String(feeValue);
          if (!groupedFees[feeStr]) groupedFees[feeStr] = [];
          groupedFees[feeStr].push(stateName);
        }
      });
    }

    const stateFeesArray = Object.entries(groupedFees).map(([fee, states]) => ({
      states,
      fee
    }));

    setForm({
      vendor_name: vendor.vendor_name,
      logo_url: vendor.logo_url,
      status: vendor.status || 'active',
      default_fee: extractedDefaultFee,
      state_fees: stateFeesArray
    });
    
    setEditingVendorId(vendor.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ vendor_name: '', logo_url: '', status: 'active', default_fee: '3000', state_fees: [] });
    setEditingVendorId(null);
    setOpenDropdownIndex(null);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.logo_url) return alert("Please upload a brand logo.");
    
    setSubmitting(true);
    
    // Construct the smart JSON map
    const stateFeesJson: Record<string, number> = {
      "Default": parseFloat(form.default_fee) || 0
    };

    form.state_fees.forEach(group => {
      const groupFee = parseFloat(group.fee) || 0;
      group.states.forEach(stateName => {
        stateFeesJson[stateName] = groupFee;
      });
    });
    
    if (editingVendorId) {
      // UPDATE EXISTING VENDOR
      const { error } = await supabase.from('verified_vendors').update({
        vendor_name: form.vendor_name,
        logo_url: form.logo_url,
        status: form.status,
        state_delivery_fees: stateFeesJson 
      }).eq('id', editingVendorId);

      setSubmitting(false);
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        resetForm();
        fetchVendors();
      }
    } else {
      // INSERT NEW VENDOR
      const { error } = await supabase.from('verified_vendors').insert([
        {
          vendor_name: form.vendor_name,
          logo_url: form.logo_url,
          status: form.status,
          state_delivery_fees: stateFeesJson 
        }
      ]);

      setSubmitting(false);
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        resetForm();
        fetchVendors();
      }
    }
  };

  const deleteVendor = async (id: string) => {
    if (!confirm("Are you sure? This will delete the vendor. Make sure to reassign their products first!")) return;
    
    const { error } = await supabase.from('verified_vendors').delete().eq('id', id);
    if (!error) {
      setVendors(vendors.filter(v => v.id !== id));
      if (editingVendorId === id) resetForm();
    } else {
      alert("Failed to delete vendor. They might have products still attached.");
    }
  };

  if (loading) return <div className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Loading Vendors...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen relative">
      {/* Click outside overlay to close dropdowns */}
      {openDropdownIndex !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownIndex(null)}></div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Vendor Management</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Manage brand partners and dynamic delivery routing</p>
      </div>

      <div className={`bg-white border p-6 rounded-sm mb-12 shadow-sm relative z-20 transition-colors duration-300 ${editingVendorId ? 'border-amber-400' : 'border-slate-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {editingVendorId ? 'Update Existing Vendor' : 'Add New Verified Vendor'}
          </h2>
          {editingVendorId && (
            <button onClick={resetForm} className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition">
              Cancel Edit
            </button>
          )}
        </div>
        
        <form onSubmit={handleSaveVendor} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Brand Name</label>
              <input required type="text" value={form.vendor_name} onChange={(e) => setForm({...form, vendor_name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-sm focus:border-amber-500 outline-none transition" placeholder="e.g. Prada" />
            </div>
            
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 mb-4 border-b border-slate-200 pb-2">Logistics & Delivery Pricing</h3>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">Default Nationwide Fee (₦)</label>
                <input required type="number" value={form.default_fee} onChange={(e) => setForm({...form, default_fee: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-sm focus:border-amber-500 outline-none transition text-sm" placeholder="e.g. 5000" />
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Applied to any state not explicitly ticked below.</p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Custom State Groups</label>
                
                {form.state_fees.map((sf, idx) => (
                  <div key={idx} className="flex gap-2 items-start relative">
                    {/* Multi-Select Dropdown Wrapper */}
                    <div className="flex-1 relative">
                      <button 
                        type="button" 
                        onClick={() => setOpenDropdownIndex(openDropdownIndex === idx ? null : idx)}
                        className="w-full border border-slate-200 p-2.5 rounded-sm text-left text-sm flex justify-between items-center bg-white hover:border-amber-500 transition"
                      >
                        <span className="truncate text-slate-700">
                          {sf.states.length === 0 ? 'Select states...' : 
                           sf.states.length <= 2 ? sf.states.join(', ') : 
                           `${sf.states.length} states selected`}
                        </span>
                        <ChevronDown size={14} className="text-slate-400" />
                      </button>

                      {/* The Dropdown Menu */}
                      {openDropdownIndex === idx && (
                        <div className="absolute z-50 top-full left-0 mt-1 w-[280px] bg-white border border-slate-200 shadow-xl rounded-sm max-h-60 overflow-y-auto p-3 grid grid-cols-2 gap-x-4 gap-y-2">
                          {NIGERIAN_STATES.map(stateName => (
                            <label key={stateName} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-amber-50 p-1 rounded transition select-none">
                              <input 
                                type="checkbox" 
                                checked={sf.states.includes(stateName)}
                                onChange={(e) => toggleStateSelection(idx, stateName, e.target.checked)}
                                className="text-amber-700 focus:ring-amber-700 rounded-sm cursor-pointer"
                              />
                              <span className="text-slate-700">{stateName}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₦</span>
                      <input 
                        type="number" 
                        value={sf.fee} 
                        onChange={(e) => updateFee(idx, e.target.value)} 
                        className="w-28 border border-slate-200 pl-7 pr-2 py-2.5 rounded-sm focus:border-amber-500 outline-none transition text-sm" 
                        placeholder="0" 
                      />
                    </div>
                    
                    <button type="button" onClick={() => removeStateRow(idx)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition mt-[1px]">
                      <X size={18} />
                    </button>
                  </div>
                ))}
                
                <button type="button" onClick={addStateRow} className="text-[10px] font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1 hover:text-amber-800 transition py-2 mt-2">
                  <Plus size={14} /> Add Grouped State Fee
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2">Brand Logo (Square Image)</label>
            {form.logo_url ? (
              <div className="relative aspect-square max-w-[200px] rounded-sm overflow-hidden border border-slate-200 group flex items-center justify-center p-4 bg-slate-50">
                <img src={form.logo_url} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => setForm({...form, logo_url: ''})} className="bg-red-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm">Remove</button>
                </div>
              </div>
            ) : (
              <div className="max-w-[200px]"><ImageUpload onUpload={(url) => setForm({...form, logo_url: url})} bucket="vendor_logos" /></div>
            )}
          </div>

          <div className="md:col-span-2 border-t border-slate-100 pt-6 relative z-10 flex gap-4">
            <button type="submit" disabled={submitting} className={`${editingVendorId ? 'bg-amber-700 hover:bg-slate-900' : 'bg-slate-900 hover:bg-amber-700'} text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs transition flex items-center justify-center gap-2 w-full md:w-auto`}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Saving...' : editingVendorId ? 'Update Vendor Profile' : 'Save Vendor Profile'}
            </button>
            {editingVendorId && (
              <button type="button" onClick={resetForm} disabled={submitting} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs transition">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 relative z-10">Active Vendors</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 relative z-10">
        {vendors.map(vendor => {
          let defaultFeeDisplay = '0';
          let customStatesCount = 0;
          try {
             if (vendor.state_delivery_fees) {
               if (vendor.state_delivery_fees.Default !== undefined) {
                 defaultFeeDisplay = vendor.state_delivery_fees.Default;
               }
               customStatesCount = Object.keys(vendor.state_delivery_fees).filter(k => k !== 'Default').length;
             }
          } catch(e) {}

          return (
            <div key={vendor.id} className={`bg-white border ${editingVendorId === vendor.id ? 'border-amber-400 shadow-md ring-1 ring-amber-400/20' : 'border-slate-200'} p-6 rounded-sm shadow-sm flex flex-col items-center text-center relative group transition-all`}>
              <div className="h-16 w-16 mb-4 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100 p-2">
                <img src={vendor.logo_url} alt={vendor.vendor_name} className="max-h-full max-w-full object-contain" />
              </div>
              <p className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-1">{vendor.vendor_name}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                Base Fee: ₦{Number(defaultFeeDisplay).toLocaleString()}
              </p>
              {customStatesCount > 0 && (
                <span className="bg-amber-50 text-amber-700 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
                  {customStatesCount} Custom State{customStatesCount > 1 ? 's' : ''}
                </span>
              )}
              
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditClick(vendor)} 
                  className="p-2 bg-white border border-slate-100 rounded-sm text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition shadow-sm"
                  title="Edit Vendor"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => deleteVendor(vendor.id)} 
                  className="p-2 bg-white border border-slate-100 rounded-sm text-red-400 hover:text-red-700 hover:bg-red-50 transition shadow-sm"
                  title="Delete Vendor"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}