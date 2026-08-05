'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Navigation } from 'lucide-react';
import { Landmark, Project } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { saveLandmarkAction, deleteLandmarkAction } from '@/app/actions/crud';
import { useToast } from '@/components/ui/toast';

export const LandmarksClientManager: React.FC<{
  initialLandmarks: Landmark[];
  projects: Project[];
}> = ({ initialLandmarks, projects }) => {
  const { toast } = useToast();
  const [landmarks, setLandmarks] = useState<Landmark[]>(initialLandmarks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLandmark, setEditingLandmark] = useState<Landmark | null>(null);

  const [formData, setFormData] = useState({
    project_id: projects[0]?.id || '',
    name: '',
    distance_label: '1.5 KM',
    travel_time_label: '5 Mins Drive',
    category: 'education',
    image_url: '',
    display_order: 0,
  });

  const handleOpenCreate = () => {
    setEditingLandmark(null);
    setFormData({
      project_id: projects[0]?.id || '',
      name: '',
      distance_label: '1.5 KM',
      travel_time_label: '5 Mins Drive',
      category: 'education',
      image_url: '',
      display_order: landmarks.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (l: Landmark) => {
    setEditingLandmark(l);
    setFormData({
      project_id: l.project_id,
      name: l.name,
      distance_label: l.distance_label,
      travel_time_label: l.travel_time_label || '',
      category: l.category || 'education',
      image_url: l.image_url || '',
      display_order: l.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveLandmarkAction(formData, editingLandmark?.id);

    if (res.success) {
      toast({ type: 'success', title: 'Landmark Saved' });
      setIsDialogOpen(false);
      window.location.reload();
    } else {
      toast({ type: 'error', title: 'Error Saving Landmark', message: res.error });
    }
  };

  const handleDelete = async (l: Landmark) => {
    if (!confirm(`Delete landmark "${l.name}"?`)) return;
    const res = await deleteLandmarkAction(l.id);

    if (res.success) {
      toast({ type: 'success', title: 'Landmark Deleted' });
      setLandmarks(landmarks.filter((item) => item.id !== l.id));
    } else {
      toast({ type: 'error', title: 'Delete Failed', message: res.error });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Navigation className="w-6 h-6 text-amber-400 pointer-events-none" /> Key Nearby Landmarks
          </h1>
          <p className="text-xs text-slate-400">Manage proximity landmarks with distance, travel time, and real site photos for public project pages</p>
        </div>
        <Button variant="gold" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 pointer-events-none" /> Add Landmark
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {landmarks.map((l) => {
          const projName = l.project?.name || projects.find((p) => p.id === l.project_id)?.name || 'Project';
          return (
            <div key={l.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                {l.image_url ? (
                  <img src={l.image_url} alt={l.name} className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-amber-400 font-bold text-xs">
                    LM
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">{projName}</span>
                  <h3 className="font-bold text-white text-sm leading-snug">{l.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                    <span className="text-amber-400 font-semibold">{l.distance_label}</span>
                    {l.travel_time_label && (
                      <span className="text-slate-400">({l.travel_time_label})</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleOpenEdit(l)} className="p-1.5 text-slate-400 hover:text-amber-400 cursor-pointer">
                  <Edit3 className="w-4 h-4 pointer-events-none" />
                </button>
                <button onClick={() => handleDelete(l)} className="p-1.5 text-slate-400 hover:text-red-400 cursor-pointer">
                  <Trash2 className="w-4 h-4 pointer-events-none" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingLandmark ? 'Edit Landmark' : 'Add New Landmark'} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Project</Label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label required>Category / Icon Type</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              >
                <option value="education">🎓 Education (School / College)</option>
                <option value="medical">🏥 Medical (Hospital / Clinic)</option>
                <option value="transit">🚌 Transit (Bus Stand / Railway)</option>
                <option value="shopping">🛍️ Shopping & Supermarket</option>
                <option value="transport">🛣️ Highway & Main Road</option>
                <option value="general">📍 General Landmark</option>
              </select>
            </div>
          </div>

          <div>
            <Label required>Landmark Name</Label>
            <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Namakkal Bus Stand / Green Park School" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label required>Distance Label</Label>
              <Input required value={formData.distance_label} onChange={(e) => setFormData({ ...formData, distance_label: e.target.value })} placeholder="1.5 KM" />
            </div>

            <div>
              <Label>Travel Time Label</Label>
              <Input value={formData.travel_time_label} onChange={(e) => setFormData({ ...formData, travel_time_label: e.target.value })} placeholder="5 Mins Drive" />
            </div>

            <div>
              <Label>Display Order</Label>
              <Input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })} placeholder="1" />
            </div>
          </div>

          <div>
            <MediaUploader
              label="Landmark Photo / Image (Optional)"
              value={formData.image_url}
              folder="landmarks"
              onChange={(url) => setFormData({ ...formData, image_url: url })}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="gold" size="md">Save Landmark</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
