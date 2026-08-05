'use client';

import React, { useState } from 'react';
import { Building2, Plus, Edit3, Trash2, Eye, EyeOff, Search, MapPin, Video, Sparkles, Check } from 'lucide-react';
import { Location, Project, Amenity } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { saveProjectAction, deleteProjectAction, togglePublishProjectAction, getProjectAmenitiesAction, saveProjectAmenitiesAction } from '@/app/actions/crud';
import { generateSlug } from '@/lib/utils/slug';
import { useToast } from '@/components/ui/toast';

export interface ProjectsClientManagerProps {
  initialProjects: Project[];
  locations: Location[];
  masterAmenities: Amenity[];
}

interface ProjectAmenityLink {
  amenity_id: string;
  custom_description: string | null;
  display_order: number | null;
}

export const ProjectsClientManager: React.FC<ProjectsClientManagerProps> = ({
  initialProjects,
  locations,
  masterAmenities,
}) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Project Amenities Configuration State
  const [isAmenitiesDialogOpen, setIsAmenitiesDialogOpen] = useState(false);
  const [selectedProjectForAmenities, setSelectedProjectForAmenities] = useState<Project | null>(null);
  const [projectAmenitiesList, setProjectAmenitiesList] = useState<Array<{ amenity_id: string; custom_description: string; display_order: number }>>([]);
  const [isSavingAmenities, setIsSavingAmenities] = useState(false);

  const [formData, setFormData] = useState({
    location_id: locations[0]?.id || '',
    name: '',
    slug: '',
    short_description: '',
    full_description: '',
    project_status: 'Ongoing' as Project['project_status'],
    approval_type: 'DTCP Approved',
    approval_number: '',
    total_area: '',
    total_plots: '',
    total_villas: '',
    starting_price: '',
    latitude: '',
    longitude: '',
    address: '',
    map_url: '',
    phone: '',
    whatsapp: '',
    hero_image_path: '',
    hero_video_path: '',
    display_order: 0,
    published: true,
    featured: true,
  });

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      location_id: locations[0]?.id || '',
      name: '',
      slug: '',
      short_description: '',
      full_description: '',
      project_status: 'Ongoing',
      approval_type: 'DTCP Approved',
      approval_number: '',
      total_area: '',
      total_plots: '',
      total_villas: '',
      starting_price: '',
      latitude: '',
      longitude: '',
      address: '',
      map_url: '',
      phone: '',
      whatsapp: '',
      hero_image_path: '',
      hero_video_path: '',
      display_order: 0,
      published: true,
      featured: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setFormData({
      location_id: proj.location_id,
      name: proj.name,
      slug: proj.slug,
      short_description: proj.short_description || '',
      full_description: proj.full_description || '',
      project_status: proj.project_status || 'Ongoing',
      approval_type: proj.approval_type || 'DTCP Approved',
      approval_number: proj.approval_number || '',
      total_area: proj.total_area || '',
      total_plots: proj.total_plots ? String(proj.total_plots) : '',
      total_villas: proj.total_villas ? String(proj.total_villas) : '',
      starting_price: proj.starting_price ? String(proj.starting_price) : '',
      latitude: proj.latitude ? String(proj.latitude) : '',
      longitude: proj.longitude ? String(proj.longitude) : '',
      address: proj.address || '',
      map_url: proj.map_url || '',
      phone: proj.phone || '',
      whatsapp: proj.whatsapp || '',
      hero_image_path: proj.hero_image_path || '',
      hero_video_path: proj.hero_video_path || '',
      display_order: proj.display_order,
      published: proj.published,
      featured: proj.featured || true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedData = {
      ...formData,
      total_plots: formData.total_plots ? Number(formData.total_plots) : null,
      total_villas: formData.total_villas ? Number(formData.total_villas) : null,
      starting_price: formData.starting_price ? Number(formData.starting_price) : null,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      display_order: Number(formData.display_order),
    };
    const res = await saveProjectAction(sanitizedData, editingProject?.id);

    if (res.success) {
      toast({
        type: 'success',
        title: editingProject ? 'Project Updated' : 'Project Created',
      });
      setIsDialogOpen(false);
      window.location.reload();
    } else {
      toast({ type: 'error', title: 'Error Saving Project', message: res.error });
    }
  };

  const handleDelete = async (proj: Project) => {
    if (!confirm(`Are you sure you want to delete project "${proj.name}"?`)) return;
    const res = await deleteProjectAction(proj.id);

    if (res.success) {
      toast({ type: 'success', title: 'Project Deleted' });
      setProjects(projects.filter((p) => p.id !== proj.id));
    } else {
      toast({ type: 'error', title: 'Delete Failed', message: res.error });
    }
  };

  const handleTogglePublish = async (proj: Project) => {
    const res = await togglePublishProjectAction(proj.id, proj.published);
    if (res.success) {
      setProjects(
        projects.map((p) => (p.id === proj.id ? { ...p, published: !p.published } : p))
      );
      toast({ type: 'info', title: 'Publication Status Updated' });
    }
  };

  const handleOpenAmenities = async (proj: Project) => {
    setSelectedProjectForAmenities(proj);
    setProjectAmenitiesList([]);
    setIsAmenitiesDialogOpen(true);

    const res = await getProjectAmenitiesAction(proj.id);
    if (res.success && res.data) {
      const list = (res.data as ProjectAmenityLink[]).map((pa) => ({
        amenity_id: pa.amenity_id,
        custom_description: pa.custom_description || '',
        display_order: pa.display_order || 0,
      }));
      setProjectAmenitiesList(list);
    } else if (res.error) {
      toast({ type: 'error', title: 'Error Loading Amenities', message: res.error });
    }
  };

  const handleSaveAmenities = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForAmenities) return;

    setIsSavingAmenities(true);
    const res = await saveProjectAmenitiesAction(selectedProjectForAmenities.id, projectAmenitiesList);
    setIsSavingAmenities(false);

    if (res.success) {
      toast({ type: 'success', title: 'Project Amenities Saved' });
      setIsAmenitiesDialogOpen(false);
    } else {
      toast({ type: 'error', title: 'Error Saving Amenities', message: res.error });
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" /> Township Projects Management
          </h1>
          <p className="text-xs text-slate-400">Manage residential gated community layouts, video links, addresses & map locations</p>
        </div>
        <Button variant="gold" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 uppercase text-[10px] font-bold text-slate-400">
              <tr>
                <th className="p-4">Project Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Approval</th>
                <th className="p-4">Video Link</th>
                <th className="p-4">Map & Address</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProjects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white">
                    {proj.name}
                    <span className="block text-[11px] font-mono text-amber-400 font-normal">{proj.slug}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{proj.location?.name}</td>
                  <td className="p-4">
                    <Badge variant="gold">{proj.project_status}</Badge>
                  </td>
                  <td className="p-4 font-semibold text-emerald-400">{proj.approval_type || 'DTCP'}</td>
                  <td className="p-4 text-[11px]">
                    {proj.hero_video_path ? (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" /> Video Set
                      </span>
                    ) : (
                      <span className="text-slate-500">No Video</span>
                    )}
                  </td>
                  <td className="p-4 text-[11px] text-slate-400 max-w-xs truncate">
                    {proj.map_url ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Map Set
                      </span>
                    ) : (
                      <span className="text-slate-500">No Map</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleTogglePublish(proj)} className="cursor-pointer">
                      {proj.published ? (
                        <Badge variant="emerald">
                          <Eye className="w-3 h-3 mr-1" /> Published
                        </Badge>
                      ) : (
                        <Badge variant="slate">
                          <EyeOff className="w-3 h-3 mr-1" /> Draft
                        </Badge>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenAmenities(proj)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Configure Amenities"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingProject ? 'Edit Township Project' : 'Add New Township Project'}
        className="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <Label required>Parent Location</Label>
            <select
              required
              value={formData.location_id}
              onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Project Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: editingProject ? formData.slug : generateSlug(e.target.value),
                  })
                }
                placeholder="Rasi Garden"
              />
            </div>

            <div>
              <Label required>URL Slug</Label>
              <Input
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                placeholder="rasi-garden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Project Status</Label>
              <select
                value={formData.project_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    project_status: e.target.value as Project['project_status'],
                  })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <Label>Approval Type</Label>
              <Input
                value={formData.approval_type}
                onChange={(e) => setFormData({ ...formData, approval_type: e.target.value })}
                placeholder="DTCP Approved"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Approval Number</Label>
              <Input
                value={formData.approval_number}
                onChange={(e) => setFormData({ ...formData, approval_number: e.target.value })}
                placeholder="DTCP No: 142/2024"
              />
            </div>
            <div>
              <Label>Total Area (e.g. 12.5 Acres)</Label>
              <Input
                value={formData.total_area}
                onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                placeholder="12.5 Acres"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Total Plots</Label>
              <Input type="number" value={formData.total_plots} onChange={(e) => setFormData({ ...formData, total_plots: e.target.value })} placeholder="45" />
            </div>
            <div>
              <Label>Total Villas</Label>
              <Input type="number" value={formData.total_villas} onChange={(e) => setFormData({ ...formData, total_villas: e.target.value })} placeholder="12" />
            </div>
            <div>
              <Label>Starting Price (₹)</Label>
              <Input type="number" value={formData.starting_price} onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })} placeholder="1800000" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Latitude</Label>
              <Input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} placeholder="11.2189" />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} placeholder="78.1674" />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })} placeholder="1" />
            </div>
          </div>

          <div>
            <Label>Project Walkthrough Video Link (YouTube / Instagram Reel URL)</Label>
            <Input
              value={formData.hero_video_path}
              onChange={(e) => setFormData({ ...formData, hero_video_path: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... or Instagram Reel link"
            />
            <p className="text-[11px] text-slate-500 mt-1">Paste YouTube video URL or Instagram Reel URL to play walkthrough video on the project page.</p>
          </div>

          <div>
            <Label>Google Maps Link / Share URL</Label>
            <Input
              value={formData.map_url}
              onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
              placeholder="https://maps.google.com/?q=Rasi+Garden+Namakkal"
            />
            <p className="text-[11px] text-slate-500 mt-1">Paste Google Maps share link or iframe embed URL for real interactive map.</p>
          </div>

          <div>
            <Label>Physical Street Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Main Road, Mohanur Road Junction, Namakkal - 637001"
            />
          </div>

          {/* Project-Specific Phone & WhatsApp Override Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
            <div>
              <Label>Project Specific Phone Hotline</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Leave blank to use location/common phone"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Overrides location &amp; global phone on this project page</p>
            </div>

            <div>
              <Label>Project Specific WhatsApp Number</Label>
              <Input
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="Leave blank to use location/common WhatsApp"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Overrides location &amp; global WhatsApp on this project page</p>
            </div>
          </div>

          <div>
            <Label>Short Card Summary</Label>
            <Input
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Premium DTCP approved villa plots and luxury independent homes."
            />
          </div>

          <div>
            <Label>Full Project Overview Description</Label>
            <Textarea
              rows={3}
              value={formData.full_description}
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
              placeholder="Detailed description of the township project..."
            />
          </div>

          <div>
            <MediaUploader
              label="Hero Layout Cover Image"
              value={formData.hero_image_path}
              folder="projects"
              cropAspectRatio={21 / 9}
              onChange={(url) => setFormData({ ...formData, hero_image_path: url })}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <label className="text-xs text-slate-300 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <span>Featured (Shown on Homepage)</span>
              </label>
              <label className="text-xs text-slate-300 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />
                <span>Published on Live Site</span>
              </label>
            </div>

            <Button type="submit" variant="gold" size="md">
              Save Project Record
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Amenities Linker Dialog */}
      <Dialog
        isOpen={isAmenitiesDialogOpen}
        onClose={() => setIsAmenitiesDialogOpen(false)}
        title={`Configure Amenities: ${selectedProjectForAmenities?.name}`}
        description="Select amenities for this project and customize their descriptions and display order."
        className="max-w-3xl"
      >
        <form onSubmit={handleSaveAmenities} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="space-y-3">
            {masterAmenities.map((am) => {
              const currentLink = projectAmenitiesList.find((pa) => pa.amenity_id === am.id);
              const isChecked = !!currentLink;

              const handleToggle = () => {
                if (isChecked) {
                  setProjectAmenitiesList(projectAmenitiesList.filter((pa) => pa.amenity_id !== am.id));
                } else {
                  setProjectAmenitiesList([
                    ...projectAmenitiesList,
                    {
                      amenity_id: am.id,
                      custom_description: '',
                      display_order: projectAmenitiesList.length + 1,
                    },
                  ]);
                }
              };

              const handleDescriptionChange = (val: string) => {
                setProjectAmenitiesList(
                  projectAmenitiesList.map((pa) =>
                    pa.amenity_id === am.id ? { ...pa, custom_description: val } : pa
                  )
                );
              };

              const handleOrderChange = (val: number) => {
                setProjectAmenitiesList(
                  projectAmenitiesList.map((pa) =>
                    pa.amenity_id === am.id ? { ...pa, display_order: val } : pa
                  )
                );
              };

              return (
                <div
                  key={am.id}
                  className={`p-4 border rounded-xl transition-colors space-y-3 ${
                    isChecked
                      ? 'bg-slate-900/60 border-amber-500/30'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleToggle}
                      className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-amber-500 border-amber-500 text-slate-950'
                            : 'border-slate-700 group-hover:border-slate-500 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-white">{am.name}</span>
                        {am.description && !isChecked && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{am.description}</p>
                        )}
                      </div>
                    </button>
                    {isChecked && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold tracking-wider border border-emerald-500/20">
                        Selected
                      </span>
                    )}
                  </div>

                  {isChecked && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60">
                      <div className="md:col-span-3">
                        <Label className="text-[11px]">Custom Description (leave empty to use default: &ldquo;{am.description || 'Included'}&rdquo;)</Label>
                        <Input
                          value={currentLink.custom_description}
                          onChange={(e) => handleDescriptionChange(e.target.value)}
                          placeholder={am.description || 'Included in layout'}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Display Order</Label>
                        <Input
                          type="number"
                          value={currentLink.display_order}
                          onChange={(e) => handleOrderChange(parseInt(e.target.value, 10) || 0)}
                          placeholder="1"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAmenitiesDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-750 cursor-pointer"
            >
              Cancel
            </button>
            <Button type="submit" variant="gold" size="md" isLoading={isSavingAmenities}>
              Save Project Amenities
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
