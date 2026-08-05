'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import {
  Image as ImageIcon, Plus, Trash2, Edit3, ChevronDown, ChevronRight,
  Camera, Film, Star, StarOff, Tv2, Share2,
} from 'lucide-react';
import { GalleryItem, Project } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { saveGalleryItemAction, deleteGalleryItemAction, getInstagramThumbnailAction } from '@/app/actions/crud';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import {
  getMediaThumb, getMediaKind, groupByKind, totalCount,
  getKindLabel, getKindBadgeClass, getYoutubeId, getYoutubeThumbnail, getInstagramThumbnail,
  GalleryMediaKind,
} from '@/lib/utils/gallery';
import { getMediaUrl } from '@/lib/utils/media';

export interface GalleryClientManagerProps {
  initialItems: GalleryItem[];
  projects: Project[];
}

// ─── Kind icon component ──────────────────────────────────────────────────────
function KindIcon({ kind, className = 'w-4 h-4' }: { kind: GalleryMediaKind; className?: string }) {
  if (kind === 'youtube') return <Tv2 className={className} />;
  if (kind === 'instagram') return <Share2 className={className} />;
  if (kind === 'video') return <Film className={className} />;
  return <Camera className={className} />;
}

// ─── Asset card ───────────────────────────────────────────────────────────────
function AssetCard({
  item, onEdit, onDelete, onToggleFeatured,
}: {
  item: GalleryItem;
  onEdit: (i: GalleryItem) => void;
  onDelete: (i: GalleryItem) => void;
  onToggleFeatured: (i: GalleryItem) => void;
}) {
  const kind = getMediaKind(item);
  const thumb = getMediaThumb(item);
  return (
    <div className="relative group/card rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-md">
      <div className="aspect-video relative bg-slate-950">
        <img src={thumb} alt={item.title || 'asset'} className="w-full h-full object-cover" />
        <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[8px] font-bold rounded-full border ${getKindBadgeClass(kind)}`}>
          {getKindLabel(kind)}
        </span>
        {item.featured && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-amber-500/90 text-slate-950 text-[8px] font-bold rounded-full">★ Featured</span>
        )}
      </div>
      <div className="p-2">
        <p className="text-[11px] font-bold text-white truncate">{item.title || 'Untitled'}</p>
        <div className="flex items-center justify-between mt-1.5">
          <Badge variant={item.published ? 'emerald' : 'slate'} className="text-[8px] px-1 py-0">
            {item.published ? 'Published' : 'Draft'}
          </Badge>
          <div className="flex items-center gap-0.5">
            <button onClick={() => onToggleFeatured(item)} title={item.featured ? 'Remove featured' : 'Mark featured'}
              className="p-1 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer">
              {item.featured ? <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> : <StarOff className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => onEdit(item)} title="Edit"
              className="p-1 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(item)} title="Delete"
              className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Per-project accordion section ────────────────────────────────────────────
function ProjectSection({
  label, locationLabel, items, defaultOpen = false, onAdd, onEdit, onDelete, onToggleFeatured,
}: {
  label: string; locationLabel: string; items: GalleryItem[];
  defaultOpen?: boolean;
  onAdd: () => void;
  onEdit: (i: GalleryItem) => void;
  onDelete: (i: GalleryItem) => void;
  onToggleFeatured: (i: GalleryItem) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeKind, setActiveKind] = useState<GalleryMediaKind>('photo');
  const grouped = groupByKind(items);
  const total = totalCount(grouped);

  const kindItems: Record<GalleryMediaKind, GalleryItem[]> = {
    photo: grouped.photos,
    youtube: grouped.youtube,
    instagram: grouped.instagram,
    video: grouped.videos,
  };

  const kinds: GalleryMediaKind[] = ['photo', 'youtube', 'instagram', 'video'];
  const visibleKinds = kinds.filter((k) => kindItems[k].length > 0);
  const safeKind = visibleKinds.includes(activeKind) ? activeKind : (visibleKinds[0] || 'photo');

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden">
      {/* Accordion Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-900/80 cursor-pointer hover:bg-slate-900 transition-colors"
        onClick={() => setOpen((v) => !v)}>
        <button type="button" className="text-slate-400">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-white">{label}</span>
          {locationLabel && <span className="ml-2 text-[10px] text-slate-500">{locationLabel}</span>}
        </div>
        <span className="text-[10px] font-mono text-slate-500 mr-2">{total} asset{total !== 1 ? 's' : ''}</span>
        <Button
          variant="gold" size="sm"
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="h-7 px-2.5 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" /> Add
        </Button>
      </div>

      {open && (
        <div className="bg-slate-950 p-4 space-y-3">
          {total === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No media yet —{' '}
              <button onClick={onAdd} className="text-amber-400 hover:underline cursor-pointer">add some</button>
            </div>
          ) : (
            <>
              {/* Kind Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {kinds.map((k) => {
                  const count = kindItems[k].length;
                  if (count === 0) return null;
                  const active = safeKind === k;
                  return (
                    <button key={k} onClick={() => setActiveKind(k)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        active ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}>
                      <KindIcon kind={k} className="w-3.5 h-3.5" />
                      {getKindLabel(k)} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Asset Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {kindItems[safeKind].map((item) => (
                  <AssetCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} onToggleFeatured={onToggleFeatured} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const GalleryClientManager: React.FC<GalleryClientManagerProps> = ({
  initialItems,
  projects,
}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Step-1: type selection ──
  const [step, setStep] = useState<1 | 2>(1);
  const [chosenKind, setChosenKind] = useState<GalleryMediaKind>('photo');

  // ── Step-2 shared ──
  const [sharedProjectId, setSharedProjectId] = useState('');
  const [sharedFeatured, setSharedFeatured] = useState(false);
  const [sharedPublished, setSharedPublished] = useState(true);

  // ── Step-2 photo ──
  const [batchImages, setBatchImages] = useState<{ url: string; title: string }[]>([]);

  // ── Step-2 YouTube ──
  const [ytUrl, setYtUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [ytThumb, setYtThumb] = useState('');

  // ── Step-2 Instagram ──
  const [igUrl, setIgUrl] = useState('');
  const [igTitle, setIgTitle] = useState('');
  const [igThumb, setIgThumb] = useState('');

  // ── Step-2 MP4 ──
  const [vidUrl, setVidUrl] = useState('');
  const [vidTitle, setVidTitle] = useState('');
  const [vidThumb, setVidThumb] = useState('');

  // ── Edit form ──
  const [editFormData, setEditFormData] = useState({
    title: '', media_type: 'image' as 'image' | 'video' | 'youtube' | 'instagram',
    storage_path_or_url: '', thumbnail_path: '', video_url: '',
    embed_type: null as 'supabase' | 'youtube' | 'instagram' | null,
    project_id: '', featured: false, published: true, display_order: 0,
  });

  const resetAddState = () => {
    setStep(1); setChosenKind('photo');
    setBatchImages([]); setYtUrl(''); setYtTitle(''); setYtThumb('');
    setIgUrl(''); setIgTitle(''); setIgThumb('');
    setVidUrl(''); setVidTitle(''); setVidThumb('');
    setSharedFeatured(false); setSharedPublished(true);
  };

  const openAdd = (projectId = '') => {
    setEditingItem(null);
    setSharedProjectId(projectId || projects[0]?.id || '');
    resetAddState();
    setIsDialogOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditingItem(item);
    const kind = getMediaKind(item);
    setEditFormData({
      title: item.title || '',
      media_type: kind === 'youtube' ? 'youtube' : kind === 'instagram' ? 'instagram' : kind === 'video' ? 'video' : 'image',
      storage_path_or_url: item.storage_path_or_url || '',
      thumbnail_path: item.thumbnail_path || '',
      video_url: item.video_url || item.storage_path_or_url || '',
      embed_type: item.embed_type || null,
      project_id: item.project_id || projects[0]?.id || '',
      featured: item.featured, published: item.published, display_order: item.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm(`Delete "${item.title || 'this item'}" from gallery?`)) return;
    const res = await deleteGalleryItemAction(item.id);
    if (res.success) {
      toast({ type: 'success', title: 'Deleted' });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      toast({ type: 'error', title: 'Delete Failed', message: res.error });
    }
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    const res = await saveGalleryItemAction({ featured: !item.featured }, item.id);
    if (res.success) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, featured: !i.featured } : i));
    } else {
      toast({ type: 'error', title: 'Update Failed', message: res.error });
    }
  };

  // ── Batch Save (Create) ──
  const handleBatchSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const saves: Promise<{ success: boolean; error?: string }>[] = [];
    const base = { project_id: sharedProjectId, featured: sharedFeatured, published: sharedPublished,
      display_order: items.length + 1, category: '', location_id: '', alt_text: '', caption: '' };

    if (chosenKind === 'photo') {
      if (batchImages.length === 0) { toast({ type: 'error', title: 'Add at least one photo' }); return; }
      batchImages.forEach((img, i) => saves.push(saveGalleryItemAction({
        ...base, media_type: 'image', title: img.title || `Photo ${i + 1}`,
        storage_path_or_url: img.url, video_url: img.url, embed_type: null, thumbnail_path: '',
        display_order: base.display_order + i,
      })));
    } else if (chosenKind === 'youtube') {
      if (!ytUrl) { toast({ type: 'error', title: 'Enter a YouTube URL' }); return; }
      saves.push(saveGalleryItemAction({ ...base, media_type: 'youtube', title: ytTitle || 'YouTube Video',
        storage_path_or_url: ytUrl, video_url: ytUrl, embed_type: 'youtube', thumbnail_path: ytThumb || getYoutubeThumbnail(ytUrl, 'hq') || '' }));
    } else if (chosenKind === 'instagram') {
      if (!igUrl) { toast({ type: 'error', title: 'Enter an Instagram URL' }); return; }
      setIsSaving(true);
      const autoIgThumb = !igThumb ? await getInstagramThumbnailAction(igUrl) : null;
      const finalIgThumb = igThumb || autoIgThumb || getInstagramThumbnail(igUrl) || '';
      saves.push(saveGalleryItemAction({ ...base, media_type: 'instagram', title: igTitle || 'Instagram Reel',
        storage_path_or_url: igUrl, video_url: igUrl, embed_type: 'instagram', thumbnail_path: finalIgThumb }));
    } else if (chosenKind === 'video') {
      if (!vidUrl) { toast({ type: 'error', title: 'Upload an MP4 video' }); return; }
      saves.push(saveGalleryItemAction({ ...base, media_type: 'video', title: vidTitle || 'Video Tour',
        storage_path_or_url: vidUrl, video_url: vidUrl, embed_type: 'supabase', thumbnail_path: vidThumb }));
    }

    setIsSaving(true);
    try {
      const results = await Promise.all(saves);
      const failures = results.filter((r) => !r.success);
      if (failures.length === 0) {
        toast({ type: 'success', title: `${results.length} asset${results.length > 1 ? 's' : ''} saved!` });
        setIsDialogOpen(false);
        window.location.reload();
      } else {
        toast({ type: 'error', title: 'Save Failed', message: failures[0]?.error || `${failures.length} of ${results.length} failed` });
      }
    } catch (err: unknown) {
      toast({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Unknown error' });
    } finally { setIsSaving(false); }
  };

  // ── Edit Save ──
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const payload = {
        ...editFormData,
        storage_path_or_url: ['youtube','instagram'].includes(editFormData.media_type)
          ? (editFormData.video_url || editFormData.storage_path_or_url)
          : editFormData.storage_path_or_url,
        video_url: editFormData.video_url || editFormData.storage_path_or_url,
        embed_type: editFormData.media_type === 'youtube' ? 'youtube'
          : editFormData.media_type === 'instagram' ? 'instagram'
          : editFormData.media_type === 'video' ? 'supabase' : null,
      };
      const res = await saveGalleryItemAction(payload, editingItem.id);
      if (res.success) {
        toast({ type: 'success', title: 'Updated' });
        setIsDialogOpen(false);
        window.location.reload();
      } else {
        toast({ type: 'error', title: 'Update Failed', message: res.error });
      }
    } catch (err: unknown) {
      toast({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Unknown error' });
    } finally { setIsSaving(false); }
  };

  // ── Group items by project ──
  const projectItemMap = new Map<string, GalleryItem[]>();
  const generalItems: GalleryItem[] = [];
  items.forEach((item) => {
    if (item.project_id && projects.find((p) => p.id === item.project_id)) {
      if (!projectItemMap.has(item.project_id)) projectItemMap.set(item.project_id, []);
      projectItemMap.get(item.project_id)!.push(item);
    } else {
      generalItems.push(item);
    }
  });

  const SELECT_CLS = 'w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-amber-400" /> Gallery & Media Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage photos, YouTube walkthroughs, Instagram reels and video tours per project</p>
        </div>
        <Button variant="gold" size="sm" onClick={() => openAdd()}>
          <Plus className="w-4 h-4" /> Add Gallery Media
        </Button>
      </div>

      {/* Project Accordions */}
      <div className="space-y-3">
        {projects.map((proj, idx) => (
          <ProjectSection
            key={proj.id}
            label={proj.name}
            locationLabel={proj.address || ''}
            items={projectItemMap.get(proj.id) || []}
            defaultOpen={idx === 0}
            onAdd={() => openAdd(proj.id)}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggleFeatured={handleToggleFeatured}
          />
        ))}
        <ProjectSection
          label="General / No Project"
          locationLabel="Shared assets not tied to a specific project"
          items={generalItems}
          defaultOpen={false}
          onAdd={() => openAdd('')}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
        />
      </div>

      {/* ── Dialog ── */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingItem ? `Edit: ${editingItem.title || 'Asset'}` : 'Add Gallery Media'}
        className="max-w-2xl"
      >
        {/* ── EDIT form ── */}
        {editingItem ? (
          <form onSubmit={handleEditSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Media Type</Label>
                <select value={editFormData.media_type}
                  onChange={(e) => setEditFormData({ ...editFormData, media_type: e.target.value as 'image'|'video'|'youtube'|'instagram' })}
                  className={SELECT_CLS}>
                  <option value="image">📷 Photo / Image</option>
                  <option value="youtube">🎥 YouTube Walkthrough</option>
                  <option value="instagram">📱 Instagram Reel</option>
                  <option value="video">🎞️ MP4 Direct Video</option>
                </select>
              </div>
              <div>
                <Label required>Project</Label>
                <select value={editFormData.project_id}
                  onChange={(e) => setEditFormData({ ...editFormData, project_id: e.target.value })}
                  className={SELECT_CLS}>
                  <option value="">— General / No Project —</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            {editFormData.media_type === 'image' ? (
              <MediaUploader label="Change Photo" value={editFormData.storage_path_or_url} folder="gallery"
                onChange={(url) => setEditFormData({ ...editFormData, storage_path_or_url: url, video_url: url })} />
            ) : editFormData.media_type === 'video' ? (
              <div className="space-y-3">
                <MediaUploader label="Change MP4 Video" value={editFormData.storage_path_or_url} folder="gallery"
                  onChange={(url) => setEditFormData({ ...editFormData, storage_path_or_url: url, video_url: url })} />
                <MediaUploader label="Thumbnail (Optional)" value={editFormData.thumbnail_path} folder="gallery"
                  onChange={(url) => setEditFormData({ ...editFormData, thumbnail_path: url })} />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label required>{editFormData.media_type === 'youtube' ? 'YouTube URL' : 'Instagram Reel URL'}</Label>
                  <Input value={editFormData.video_url}
                    onChange={(e) => setEditFormData({ ...editFormData, video_url: e.target.value, storage_path_or_url: e.target.value })}
                    placeholder={editFormData.media_type === 'youtube' ? 'https://youtu.be/...' : 'https://www.instagram.com/reel/...'} />
                </div>
                <MediaUploader label="Cover Image (Optional)" value={editFormData.thumbnail_path} folder="gallery"
                  onChange={(url) => setEditFormData({ ...editFormData, thumbnail_path: url })} />
              </div>
            )}

            <div>
              <Label required>Title</Label>
              <Input required value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} placeholder="Asset title..." />
            </div>
            <div className="flex items-center gap-5">
              <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editFormData.featured} onChange={(e) => setEditFormData({ ...editFormData, featured: e.target.checked })} />
                <span>Featured on Homepage</span>
              </label>
              <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editFormData.published} onChange={(e) => setEditFormData({ ...editFormData, published: e.target.checked })} />
                <span>Published</span>
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="gold" size="md" disabled={isSaving}>
                {isSaving ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          /* ── CREATE: Step 1 or Step 2 ── */
          <form onSubmit={handleBatchSave} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {step === 1 ? (
              /* STEP 1 — Choose type */
              <div className="space-y-4">
                <p className="text-xs text-slate-400">What type of media are you adding?</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { kind: 'photo' as GalleryMediaKind, icon: '📷', label: 'Photos', sub: 'Upload multiple images at once' },
                    { kind: 'youtube' as GalleryMediaKind, icon: '🎥', label: 'YouTube Walkthrough', sub: 'Paste a YouTube link' },
                    { kind: 'instagram' as GalleryMediaKind, icon: '📱', label: 'Instagram Reel', sub: 'Paste an Instagram link' },
                    { kind: 'video' as GalleryMediaKind, icon: '🎞️', label: 'MP4 Video', sub: 'Upload a video file' },
                  ] as const).map(({ kind, icon, label, sub }) => (
                    <button
                      key={kind} type="button"
                      onClick={() => { setChosenKind(kind); setStep(2); }}
                      className="flex flex-col items-center gap-2 p-5 bg-slate-900 border-2 border-slate-800 hover:border-amber-500/70 hover:bg-slate-800 rounded-2xl transition-all cursor-pointer group text-center"
                    >
                      <span className="text-3xl">{icon}</span>
                      <span className="text-sm font-bold text-white">{label}</span>
                      <span className="text-[11px] text-slate-500 group-hover:text-slate-400">{sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* STEP 2 — Fill details */
              <div className="space-y-4">
                {/* Back */}
                <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1">
                  ← Back to type selection
                </button>

                {/* Shared: Project + toggles */}
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <div>
                    <Label required>Tag Project</Label>
                    <select value={sharedProjectId} onChange={(e) => setSharedProjectId(e.target.value)} className={SELECT_CLS}>
                      <option value="">— General / No Project —</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-5">
                    <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sharedFeatured} onChange={(e) => setSharedFeatured(e.target.checked)} />
                      <span>Featured on Homepage</span>
                    </label>
                    <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sharedPublished} onChange={(e) => setSharedPublished(e.target.checked)} />
                      <span>Published</span>
                    </label>
                  </div>
                </div>

                {/* Photo-specific */}
                {chosenKind === 'photo' && (
                  <div className="space-y-3">
                    <MediaUploader id="batch-img-uploader" label="Select photos — multiple supported" folder="gallery" multiple={true}
                      onMultipleChange={(urls) => { if (urls?.length) setBatchImages((p) => [...p, ...urls.map((u) => ({ url: u, title: '' }))]); }}
                      onChange={(url) => { if (url) setBatchImages((p) => [...p, { url, title: '' }]); }} />
                    {batchImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {batchImages.map((img, idx) => (
                          <div key={idx} className="relative group/img rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                            <div className="aspect-video relative">
                              <img src={getMediaUrl(img.url)} alt="" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setBatchImages((p) => p.filter((_, i) => i !== idx))}
                                className="absolute top-0.5 right-0.5 p-0.5 bg-red-600/90 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                            <input type="text" value={img.title}
                              onChange={(e) => setBatchImages((p) => p.map((im, i) => i === idx ? { ...im, title: e.target.value } : im))}
                              placeholder={`Title ${idx + 1}`}
                              className="w-full px-1.5 py-1 bg-slate-950 text-[10px] text-white border-t border-slate-800 focus:outline-none" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* YouTube-specific */}
                {chosenKind === 'youtube' && (
                  <div className="space-y-3">
                    <div>
                      <Label required>YouTube Video URL</Label>
                      <Input value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} placeholder="https://youtu.be/VIDEO_ID  or  https://www.youtube.com/watch?v=..." />
                    </div>
                    {ytUrl && getYoutubeId(ytUrl) && (
                      <div className="flex items-center gap-3 p-2 bg-slate-900 border border-slate-800 rounded-lg">
                        <img src={'https://img.youtube.com/vi/' + getYoutubeId(ytUrl) + '/mqdefault.jpg'} className="w-24 h-14 object-cover rounded" alt="YT preview" />
                        <span className="text-xs text-green-400 font-semibold">YouTube video detected ✓</span>
                      </div>
                    )}
                    <div>
                      <Label>Video Title</Label>
                      <Input value={ytTitle} onChange={(e) => setYtTitle(e.target.value)} placeholder="e.g. Rasi Garden Site Walkthrough" />
                    </div>
                    <MediaUploader label="Custom Thumbnail (Optional)" value={ytThumb} folder="gallery" onChange={(url) => setYtThumb(url)} />
                  </div>
                )}

                {/* Instagram-specific */}
                {chosenKind === 'instagram' && (
                  <div className="space-y-3">
                    <div>
                      <Label required>Instagram Reel URL</Label>
                      <Input value={igUrl} onChange={(e) => setIgUrl(e.target.value)} placeholder="https://www.instagram.com/reel/REEL_ID/" />
                    </div>
                    <div>
                      <Label>Reel Title</Label>
                      <Input value={igTitle} onChange={(e) => setIgTitle(e.target.value)} placeholder="e.g. Influencer Visit — Kongu Nagar Layout" />
                    </div>
                    <MediaUploader label="Cover Thumbnail (Recommended)" value={igThumb} folder="gallery" onChange={(url) => setIgThumb(url)} />
                  </div>
                )}

                {/* MP4-specific */}
                {chosenKind === 'video' && (
                  <div className="space-y-3">
                    <MediaUploader label="Upload MP4 Video File" value={vidUrl} folder="gallery" onChange={(url) => setVidUrl(url)} />
                    <div>
                      <Label>Video Title</Label>
                      <Input value={vidTitle} onChange={(e) => setVidTitle(e.target.value)} placeholder="e.g. Kongu Garden Infrastructure Video" />
                    </div>
                    <MediaUploader label="Cover Thumbnail (Optional)" value={vidThumb} folder="gallery" onChange={(url) => setVidThumb(url)} />
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="gold" size="md" disabled={isSaving}>
                    {isSaving ? 'Saving...' : chosenKind === 'photo'
                      ? `Save ${batchImages.length || ''} Photo${batchImages.length !== 1 ? 's' : ''}`
                      : `Save ${chosenKind === 'youtube' ? 'YouTube Video' : chosenKind === 'instagram' ? 'Instagram Reel' : 'Video'}`}
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}
      </Dialog>
    </div>
  );
};
