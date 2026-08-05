'use client';

import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Sparkles, ShieldCheck, Road, Lock, Droplet, Sun, Trees, CheckCircle2, Car, Home, Utensils, Compass } from 'lucide-react';
import { Amenity } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { saveAmenityAction, deleteAmenityAction } from '@/app/actions/crud';
import { useToast } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';

type AmenityCategory = 'land' | 'house' | 'general';
type AmenityCategoryFilter = 'all' | AmenityCategory;

const ICON_OPTIONS = [
  { value: 'shield-check', label: '🛡️ Shield Check (Gated Security)' },
  { value: 'road', label: '🛣️ Road (Asphalt / Tar Roads)' },
  { value: 'lock', label: '🔒 Lock (Privacy / Gated Arch)' },
  { value: 'droplet', label: '💧 Droplet (Water Storage / Supply)' },
  { value: 'sun', label: '☀️ Sun (Street Lights / Solar Power)' },
  { value: 'trees', label: '🌳 Trees (Parks / Avenue Plantation)' },
  { value: 'car', label: '🚗 Car (Covered Parking)' },
  { value: 'home', label: '🏠 Home (Woodwork & UPVC)' },
  { value: 'utensils', label: '🍳 Utensils (Modular Kitchen)' },
  { value: 'compass', label: '🧭 Compass (100% Vaastu)' },
  { value: 'check-circle-2', label: '✅ Checkmark (General Feature)' },
];

const CATEGORY_OPTIONS = [
  { value: 'land', label: '🌳 Land & Plot Layout' },
  { value: 'house', label: '🏠 Villas & Houses' },
  { value: 'general', label: '✨ General Township' },
];

export const AmenitiesClientManager: React.FC<{ initialAmenities: Amenity[] }> = ({ initialAmenities }) => {
  const { toast } = useToast();
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<AmenityCategoryFilter>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_key: 'check-circle-2',
    category: 'general' as 'land' | 'house' | 'general',
    active: true,
  });

  const handleOpenCreate = () => {
    setEditingAmenity(null);
    setFormData({ name: '', description: '', icon_key: 'check-circle-2', category: 'general', active: true });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (a: Amenity) => {
    setEditingAmenity(a);
    setFormData({
      name: a.name,
      description: a.description || '',
      icon_key: a.icon_key || 'check-circle-2',
      category: a.category || 'general',
      active: a.active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await saveAmenityAction(formData, editingAmenity?.id);

    if (res.success) {
      toast({ type: 'success', title: 'Amenity Record Saved' });
      setIsDialogOpen(false);
      window.location.reload();
    } else {
      toast({ type: 'error', title: 'Error Saving Amenity', message: res.error });
    }
  };

  const handleDelete = async (a: Amenity) => {
    if (!confirm(`Delete amenity "${a.name}"?`)) return;
    const res = await deleteAmenityAction(a.id);

    if (res.success) {
      toast({ type: 'success', title: 'Amenity Deleted' });
      setAmenities(amenities.filter((item) => item.id !== a.id));
    } else {
      toast({ type: 'error', title: 'Delete Failed', message: res.error });
    }
  };

  const getIcon = (key: string | null) => {
    switch (key) {
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      case 'road':
        return <Road className="w-5 h-5 text-emerald-400" />;
      case 'lock':
        return <Lock className="w-5 h-5 text-amber-500" />;
      case 'droplet':
        return <Droplet className="w-5 h-5 text-blue-400" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'trees':
        return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'car':
        return <Car className="w-5 h-5 text-emerald-400" />;
      case 'home':
        return <Home className="w-5 h-5 text-amber-500" />;
      case 'utensils':
        return <Utensils className="w-5 h-5 text-blue-400" />;
      case 'compass':
        return <Compass className="w-5 h-5 text-amber-400" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-slate-400" />;
    }
  };

  const filteredAmenities = activeCategoryFilter === 'all'
    ? amenities
    : amenities.filter((a) => (a.category || 'general') === activeCategoryFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" /> Township Amenities Master List
          </h1>
          <p className="text-xs text-slate-400">Manage master list of township infrastructure features (Water, Blacktop Roads, Electricity, Parks)</p>
        </div>
        <Button variant="gold" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add Amenity
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Categories' },
          { key: 'land', label: '🌳 Land & Plot Layout' },
          { key: 'house', label: '🏠 Villas & Houses' },
          { key: 'general', label: '✨ General Township' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategoryFilter(tab.key as AmenityCategoryFilter)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeCategoryFilter === tab.key
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAmenities.map((item) => (
          <div key={item.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl shrink-0 mt-0.5">
                {getIcon(item.icon_key)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{item.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-950 text-amber-400 border border-slate-800">
                    {item.category === 'land' ? 'Land' : item.category === 'house' ? 'Villa' : 'General'}
                  </span>
                </div>
                {item.description && (
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-amber-400 cursor-pointer">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(item)} className="p-1.5 text-slate-400 hover:text-red-400 cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={editingAmenity ? 'Edit Amenity' : 'Add New Amenity'} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label required>Amenity Name</Label>
            <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Blacktop Roads" />
          </div>
          <div>
            <Label>Default Description / Subtitle</Label>
            <Textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="40ft & 30ft asphalt roads constructed to civic standards" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AmenityCategory })}
                className="w-full mt-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value} className="bg-slate-900">{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Display Icon Key</Label>
              <select
                value={formData.icon_key}
                onChange={(e) => setFormData({ ...formData, icon_key: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="gold" size="md">Save Amenity</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
