"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    if (data) setEvents(data);
    setLoading(false);
  }

  async function deleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 mb-2">Events</h1>
          <p className="text-slate-500">Manage your fashion shows, pop-ups, and masterclasses.</p>
        </div>
        <Link href="/admin/events/add" className="bg-slate-900 text-white px-6 py-3 flex items-center gap-2 rounded-sm hover:bg-slate-800 transition">
          <Plus size={18} /> Add Event
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm tracking-widest uppercase text-slate-500">
              <th className="p-4 font-medium">Event Title</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading events...</td></tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-500">
                  <Calendar className="mx-auto text-slate-300 mb-3" size={32} />
                  No events found. Add your first showcase to get started.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50 transition group">
                  <td className="p-4 flex items-center gap-4">
                    {event.cover_image && (
                      <img src={event.cover_image} alt="" className="w-12 h-12 rounded-sm object-cover border border-slate-200" />
                    )}
                    <span className="font-medium text-slate-900">{event.title}</span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBA'}
                  </td>
                  <td className="p-4 text-slate-600">{event.location || 'TBA'}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${event.status === 'Live' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}