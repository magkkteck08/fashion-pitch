"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trash2, MessageSquare, Mail, Phone, CheckCircle } from 'lucide-react';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchEnquiries();
  }, []);

  async function fetchEnquiries() {
    const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    if (data) setEnquiries(data);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase.from('enquiries').update({ status: 'Read' }).eq('id', id);
    fetchEnquiries();
  }

  async function deleteEnquiry(id: string) {
    if (!confirm("Are you sure you want to delete this message?")) return;
    await supabase.from('enquiries').delete().eq('id', id);
    fetchEnquiries();
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-slate-900 mb-2">Enquiries Inbox</h1>
        <p className="text-slate-500">Manage messages and consultation requests from your website.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading messages...</div>
        ) : enquiries.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
            <MessageSquare size={48} className="text-slate-300 mb-4" />
            <p>Your inbox is empty. No new enquiries yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {enquiries.map((msg) => (
              <div key={msg.id} className={`p-6 transition ${msg.status === 'New' ? 'bg-amber-50/30' : 'bg-white hover:bg-slate-50'}`}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  
                  {/* Message Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-serif text-slate-900">{msg.name}</h3>
                      {msg.status === 'New' && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] uppercase tracking-widest rounded-full">New</span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto md:ml-4">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-1.5"><Mail size={14} /> {msg.contact || 'No email provided'}</div>
                      <div className="flex items-center gap-1.5"><Phone size={14} /> {msg.contact || 'No phone provided'}</div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-sm text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    {msg.status === 'New' && (
                      <button 
                        onClick={() => markAsRead(msg.id)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-sm hover:bg-slate-800 transition"
                      >
                        <CheckCircle size={16} /> Mark Read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteEnquiry(msg.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm rounded-sm hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}