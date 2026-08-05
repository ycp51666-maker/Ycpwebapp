'use client';

import React, { useState } from 'react';
import { ShieldCheck, Edit3, Save, UserPlus } from 'lucide-react';
import { AdminProfile, AdminRole } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { updateAdminUserAction } from '@/app/actions/crud';
import { useToast } from '@/components/ui/toast';

export const UsersClientManager: React.FC<{ initialUsers: AdminProfile[] }> = ({ initialUsers }) => {
  const { toast } = useToast();
  const [users] = useState<AdminProfile[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);

  const [formData, setFormData] = useState<{
    full_name: string;
    role: AdminRole;
    is_active: boolean;
  }>({
    full_name: '',
    role: 'sales_admin',
    is_active: true,
  });

  const handleEdit = (user: AdminProfile) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name || '',
      role: user.role || 'sales_admin',
      is_active: user.is_active !== false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const res = await updateAdminUserAction(selectedUser.id, formData);

    if (res.success) {
      toast({ type: 'success', title: 'Admin Profile Updated' });
      setSelectedUser(null);
      window.location.reload();
    } else {
      toast({ type: 'error', title: 'Update Failed', message: res.error });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" /> Admin Access & User Roles
          </h1>
          <p className="text-xs text-slate-400">
            Manage permissions, active statuses, and executive access levels
          </p>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-800">
              <tr>
                <th className="p-3">Full Name</th>
                <th className="p-3">User ID (UUID)</th>
                <th className="p-3">Access Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">{u.full_name || 'System Admin'}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">{u.id}</td>
                  <td className="p-3">
                    <Badge variant={u.role === 'super_admin' ? 'gold' : u.role === 'content_admin' ? 'emerald' : 'slate'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={u.is_active ? 'emerald' : 'slate'}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleEdit(u)}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adding New Admin User Guide Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <UserPlus className="w-4 h-4" /> Adding New Admin Accounts
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          To create a new admin login, create a user in your Supabase Auth Dashboard or SQL Editor, then link their authentication UUID into <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 font-mono">public.admin_profiles</code>.
        </p>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
          <code>
            INSERT INTO public.admin_profiles (id, full_name, role, is_active)<br />
            SELECT id, &apos;Admin User Name&apos;, &apos;super_admin&apos;, true<br />
            FROM auth.users WHERE email = &apos;your-admin-email@domain.com&apos;;
          </code>
        </div>
      </div>

      {/* Edit User Modal Dialog */}
      <Dialog isOpen={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} title={`Edit Admin Profile: ${selectedUser?.full_name}`} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label required>Full Name</Label>
            <Input required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
          </div>

          <div>
            <Label required>Access Role Level</Label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
            >
              <option value="super_admin">Super Admin (Full Access)</option>
              <option value="content_admin">Content Admin (Layouts, Media & Content)</option>
              <option value="sales_admin">Sales Admin (Leads & Messages)</option>
            </select>
          </div>

          <div>
            <Label required>Account Active Status</Label>
            <select
              value={formData.is_active ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
            >
              <option value="true">Active (Access Allowed)</option>
              <option value="false">Disabled (Access Revoked)</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button type="submit" variant="gold" size="md" className="font-bold">
              <Save className="w-4 h-4 mr-1" /> Update Profile
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
