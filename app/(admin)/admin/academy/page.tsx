"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BookOpen, Mail, Phone, Loader2, Calendar } from 'lucide-react';

export default function AcademyLeadsPage() {
  const [supabase] = useState(() => createClient());
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabase
        .from('academy_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLeads(data);
      }
      setLoading(false);
    }

    fetchLeads();
  }, [supabase]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-white border border-slate-200 rounded-sm shadow-sm">
          <BookOpen size={24} className="text-slate-800" />
        </div>
        <div>
          <h1 className="text-2xl font-serif text-slate-900">Academy Leads</h1>
          <p className="text-xs tracking-widest uppercase text-slate-500 mt-1">Manage applicant inquiries</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-4 text-amber-500" />
            <p className="text-sm tracking-widest uppercase">Loading applicants...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400 text-center">
            <BookOpen size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium tracking-widest uppercase text-slate-600 mb-2">No Leads Yet</p>
            <p className="text-xs">When students apply, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="p-4 font-medium">Applicant</th>
                  <th className="p-4 font-medium">Contact Details</th>
                  <th className="p-4 font-medium">Experience Level</th>
                  <th className="p-4 font-medium">Date Received</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-900">{lead.name}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-slate-600">
                        <span className="flex items-center gap-2 text-xs"><Mail size={12} /> {lead.email}</span>
                        {lead.contact && <span className="flex items-center gap-2 text-xs"><Phone size={12} /> {lead.contact}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded-sm text-xs">
                        {lead.experience || 'Not specified'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Calendar size={12} />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}