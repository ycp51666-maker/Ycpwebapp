'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  SlidersHorizontal,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Message, Location, Project } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { bulkMarkMessagesReadAction, bulkUpdateMessagesStatusAction } from '@/app/actions/messages';
import { useToast } from '@/components/ui/toast';

export interface MessagesClientManagerProps {
  initialMessages: Message[];
  locations: Location[];
  projects: Project[];
  currentParams: {
    query?: string;
    type?: string;
    status?: string;
    location?: string;
    project?: string;
    unread?: string;
  };
}

export const MessagesClientManager: React.FC<MessagesClientManagerProps> = ({
  initialMessages,
  currentParams,
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? messages.map((m) => m.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(checked ? [...selectedIds, id] : selectedIds.filter((i) => i !== id));
  };

  const handleBulkMarkRead = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    const res = await bulkMarkMessagesReadAction(selectedIds);
    setIsBulkProcessing(false);

    if (res.success) {
      toast({ type: 'success', title: `${selectedIds.length} leads marked as read` });
      setMessages(
        messages.map((m) =>
          selectedIds.includes(m.id)
            ? { ...m, read_at: new Date().toISOString(), status: 'contacted' as const }
            : m
        )
      );
      setSelectedIds([]);
    } else {
      toast({ type: 'error', title: 'Bulk Operation Failed', message: res.error });
    }
  };

  const handleBulkUpdateStatus = async (status: Message['status']) => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    const res = await bulkUpdateMessagesStatusAction(selectedIds, status);
    setIsBulkProcessing(false);

    if (res.success) {
      toast({ type: 'success', title: `Updated status for ${selectedIds.length} leads` });
      setMessages(
        messages.map((m) => (selectedIds.includes(m.id) ? { ...m, status } : m))
      );
      setSelectedIds([]);
    } else {
      toast({ type: 'error', title: 'Bulk Update Failed', message: res.error });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-400" /> Customer Leads & Site Visits
          </h1>
          <p className="text-xs text-slate-400">
            Incoming direct messages and free site visit pickup appointment requests
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <form method="GET" action="/admin/messages" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Search Name / Phone / Email</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <Input
                name="query"
                defaultValue={currentParams.query || ''}
                placeholder="Ramesh / 9876543210"
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Lead Type</label>
            <select
              name="type"
              defaultValue={currentParams.type || ''}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
            >
              <option value="">All Types</option>
              <option value="contact">Contact Message</option>
              <option value="site_visit">Site Visit Appointment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
            <select
              name="status"
              defaultValue={currentParams.status || ''}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="site_visit_scheduled">Site Visit Scheduled</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
              <option value="spam">Spam</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
            </button>
            {Object.values(currentParams).some(Boolean) && (
              <Link
                href="/admin/messages"
                className="py-2 px-3 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-300">
          <span className="font-bold">{selectedIds.length} lead(s) selected</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" isLoading={isBulkProcessing} onClick={handleBulkMarkRead}>
              <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={isBulkProcessing}
              onClick={() => handleBulkUpdateStatus('site_visit_scheduled')}
            >
              Set Scheduled
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={isBulkProcessing}
              onClick={() => handleBulkUpdateStatus('spam')}
              className="text-red-400 border-red-900"
            >
              Mark Spam
            </Button>
          </div>
        </div>
      )}

      {/* Messages Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 uppercase text-[10px] font-bold text-slate-400">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === messages.length && messages.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="p-4">Type</th>
                <th className="p-4">Name & Contact</th>
                <th className="p-4">Context Property</th>
                <th className="p-4">Preferred Visit Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Received</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No leads found matching current filter rules.
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr
                    key={m.id}
                    className={`hover:bg-slate-800/40 transition-colors ${!m.read_at ? 'bg-amber-500/5 font-semibold' : ''}`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(m.id)}
                        onChange={(e) => handleSelectOne(m.id, e.target.checked)}
                      />
                    </td>
                    <td className="p-4">
                      {m.message_type === 'site_visit' ? (
                        <Badge variant="gold">
                          <Calendar className="w-3 h-3 mr-1" /> Site Visit
                        </Badge>
                      ) : (
                        <Badge variant="slate">
                          <MessageSquare className="w-3 h-3 mr-1" /> Contact
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white block">{m.name}</span>
                      <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" /> {m.phone}
                      </span>
                      {m.email && (
                        <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {m.email}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-slate-200 block">
                        {m.project?.name || m.location?.name || 'General Inquiry'}
                      </span>
                      {m.property_configuration?.name && (
                        <span className="text-[10px] text-amber-400 font-mono block">
                          {m.property_configuration.name}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-amber-400">
                      {m.preferred_visit_date ? `${m.preferred_visit_date} (${m.preferred_visit_time || 'General'})` : 'N/A'}
                    </td>
                    <td className="p-4">
                      <Badge variant={m.status === 'new' ? 'emerald' : m.status === 'spam' ? 'red' : 'slate'}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-[11px] text-slate-400 font-mono">
                      {new Date(m.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/messages/${m.id}`}
                        className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-colors"
                      >
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
