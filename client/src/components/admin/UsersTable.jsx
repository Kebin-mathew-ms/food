import React, { useState } from 'react';
import {
  useAdminUsersQuery,
  useAdminUpdateUserStatusMutation,
  useAdminDeleteUserMutation,
  useAdminRestoreUserMutation,
} from '../../hooks/useAdmin.js';
import { Search, ShieldAlert, ShieldCheck, Ban, Trash2, RefreshCw } from 'lucide-react';

export default function UsersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useAdminUsersQuery({ page, limit: 10, search, role, status });
  const updateStatus = useAdminUpdateUserStatusMutation();
  const deleteUser = useAdminDeleteUserMutation();
  const restoreUser = useAdminRestoreUserMutation();

  const handleStatusChange = (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateStatus.mutate({ id, status: nextStatus });
  };

  const handleBlockUser = (id, currentStatus) => {
    const nextStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    updateStatus.mutate({ id, status: nextStatus });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground animate-pulse">Loading users database list...</div>
      </div>
    );
  }

  const list = data?.data?.list || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="w-full flex flex-col bg-card border border-border rounded-2xl p-6 shadow-sm">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Platform Users Register</h3>
          <p className="text-xs text-muted-foreground">Total Registered accounts: {total}</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name/email..."
              className="bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full md:w-56"
            />
          </div>

          {/* Role Filter */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-background border border-border text-foreground rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DONOR">Donor</option>
            <option value="NGO">NGO</option>
            <option value="VOLUNTEER">Volunteer</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-background border border-border text-foreground rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Suspended</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      {list.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No registered users match these filters.</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">User Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4 font-semibold text-foreground">{u.full_name}</td>
                  <td className="px-4 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
                          : u.role === 'DONOR'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : u.role === 'NGO'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : u.status === 'BLOCKED'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right flex justify-end gap-2">
                    {/* Suspend/Activate Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(u.id, u.status)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        u.status === 'ACTIVE'
                          ? 'text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 border-border hover:border-rose-500/20'
                          : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                      title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                    >
                      {u.status === 'ACTIVE' ? <Ban className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    </button>

                    {/* Block/Unblock Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleBlockUser(u.id, u.status)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        u.status === 'BLOCKED'
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20'
                      }`}
                      title={u.status === 'BLOCKED' ? 'Unblock User' : 'Block User'}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </button>

                    {/* Soft Delete / Restore Trigger */}
                    {u.deleted_at ? (
                      <button
                        type="button"
                        onClick={() => restoreUser.mutate(u.id)}
                        className="p-1.5 rounded-lg border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all"
                        title="Restore Account"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => deleteUser.mutate(u.id)}
                        className="p-1.5 rounded-lg border border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                        title="Soft Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination buttons */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 border-t border-border pt-4 text-xs">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            className="px-3.5 py-1.5 font-bold border border-border rounded-lg hover:bg-muted text-foreground disabled:opacity-50 transition-all"
          >
            Prev Page
          </button>
          <span className="text-muted-foreground font-semibold">Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            className="px-3.5 py-1.5 font-bold border border-border rounded-lg hover:bg-muted text-foreground disabled:opacity-50 transition-all"
          >
            Next Page
          </button>
        </div>
      )}
    </div>
  );
}
