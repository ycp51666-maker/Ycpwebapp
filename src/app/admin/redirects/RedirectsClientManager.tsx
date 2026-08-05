'use client';

import React, { useState } from 'react';
import { CornerDownRight, Save, Trash2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveSiteSettingAction } from '@/app/actions/crud';
import { useToast } from '@/components/ui/toast';
import { SiteSettingRecord } from '../settings/SettingsClientManager';

export interface RedirectRecord {
  source: string;
  destination: string;
  permanent: boolean;
}

export interface ActiveRouteItem {
  path: string;
  label: string;
}

export const RedirectsClientManager: React.FC<{
  initialSettings: SiteSettingRecord[];
  activeRoutes: ActiveRouteItem[];
}> = ({ initialSettings, activeRoutes }) => {
  const { toast } = useToast();

  const [redirectsList, setRedirectsList] = useState<RedirectRecord[]>(() => {
    const rec = initialSettings.find((s) => s.key === 'url_redirects')?.value;
    return Array.isArray(rec) ? (rec as RedirectRecord[]) : [];
  });

  const [newRedirect, setNewRedirect] = useState({
    source: '',
    destination: '',
    permanent: true,
  });

  const handleAddRedirect = () => {
    let src = newRedirect.source.trim();
    let dest = newRedirect.destination.trim();
    if (!src || !dest) {
      toast({ type: 'error', title: 'Invalid Paths', message: 'Both source and destination paths are required.' });
      return;
    }
    if (!src.startsWith('/')) src = '/' + src;
    if (!dest.startsWith('/')) dest = '/' + dest;

    if (redirectsList.some((r) => r.source.toLowerCase() === src.toLowerCase())) {
      toast({ type: 'error', title: 'Duplicate Rule', message: 'A redirect rule for this source path already exists.' });
      return;
    }

    setRedirectsList((prev) => [...prev, { source: src, destination: dest, permanent: newRedirect.permanent }]);
    setNewRedirect({ source: '', destination: '', permanent: true });
    toast({ type: 'success', title: 'Rule Added', message: 'Remember to save all changes.' });
  };

  const handleSaveRedirects = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveSiteSettingAction('url_redirects', redirectsList.map((redirect) => ({ ...redirect })));
    if (res.success) {
      toast({ type: 'success', title: 'Redirect Rules Saved' });
    } else {
      toast({ type: 'error', title: 'Save Failed', message: res.error });
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <CornerDownRight className="w-6 h-6 text-amber-400" /> SEO URL Redirects Manager
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Create and manage 301 (Permanent) and 302 (Temporary) redirects directly at the Next.js routing level.
        </p>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSaveRedirects} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Link2 className="w-4 h-4 text-amber-400" /> Active Redirect Mappings
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded">
              {redirectsList.length} Active Rules
            </span>
          </div>

          {/* Current Redirect Rules */}
          {redirectsList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              No active custom URL redirects. Use the input panel below to map paths.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                    <th className="p-3">Source Route (Old Link)</th>
                    <th className="p-3">Destination Route (New Link)</th>
                    <th className="p-3 w-32">Type</th>
                    <th className="p-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {redirectsList.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/30 text-white transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-300 select-all">{r.source}</td>
                      <td className="p-3 font-mono text-[11px] text-amber-400 select-all">{r.destination}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.permanent ? 'bg-emerald-950 border border-emerald-900/60 text-emerald-400' : 'bg-blue-950 border border-blue-900/60 text-blue-450'}`}>
                          {r.permanent ? '301 Permanent' : '302 Temporary'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setRedirectsList((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Input Form Panel to Add New Redirect Rule */}
          <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-3">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">➕ Add New Redirect Rule</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Source Path (Old URL)</Label>
                <div className="space-y-1.5">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) setNewRedirect({ ...newRedirect, source: e.target.value });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-[10px] text-slate-300 select-none cursor-pointer focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Quick Select Active Route --</option>
                    {activeRoutes.map((route, rIdx) => (
                      <option key={rIdx} value={route.path}>{route.label}</option>
                    ))}
                  </select>
                  <Input
                    value={newRedirect.source}
                    onChange={(e) => setNewRedirect({ ...newRedirect, source: e.target.value })}
                    placeholder="/projects/old-slug"
                    className="text-xs"
                  />
                </div>
              </div>
              <div>
                <Label>Destination Path (New URL)</Label>
                <div className="space-y-1.5">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) setNewRedirect({ ...newRedirect, destination: e.target.value });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-[10px] text-slate-300 select-none cursor-pointer focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Quick Select Active Route --</option>
                    {activeRoutes.map((route, rIdx) => (
                      <option key={rIdx} value={route.path}>{route.label}</option>
                    ))}
                  </select>
                  <Input
                    value={newRedirect.destination}
                    onChange={(e) => setNewRedirect({ ...newRedirect, destination: e.target.value })}
                    placeholder="/projects/new-slug"
                    className="text-xs"
                  />
                </div>
              </div>
              <div>
                <Label>Redirect Type</Label>
                <div className="flex gap-2 items-end pt-5.5">
                  <select
                    value={newRedirect.permanent ? 'true' : 'false'}
                    onChange={(e) => setNewRedirect({ ...newRedirect, permanent: e.target.value === 'true' })}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white"
                  >
                    <option value="true">301 Permanent</option>
                    <option value="false">302 Temporary</option>
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRedirect}
                    className="text-amber-400 border-amber-900/60 hover:bg-amber-950 font-bold"
                  >
                    Add Rule
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="gold" size="sm" className="font-bold">
              <Save className="w-3.5 h-3.5 mr-1" /> Save Redirect Rules
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
