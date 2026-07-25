import React, { useState } from 'react';
import UsersTable from '../../components/admin/UsersTable.jsx';
import NGOTable from '../../components/admin/NGOTable.jsx';
import VolunteerTable from '../../components/admin/VolunteerTable.jsx';
import { Users, Shield, Award } from 'lucide-react';

export default function UserManagementView() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="w-full flex flex-col gap-6 text-foreground">
      {/* Title Header */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">👥 Platform Members Management</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Perform administrative controls across accounts register lists, NGO credentials, and volunteers.
        </p>
      </div>

      {/* Tabs selectors bar */}
      <div className="flex border-b border-border gap-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center gap-1.5 transition-all ${
            activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" /> Users Accounts
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ngos')}
          className={`pb-3 flex items-center gap-1.5 transition-all ${
            activeTab === 'ngos' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="w-4 h-4" /> NGO Verification
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('volunteers')}
          className={`pb-3 flex items-center gap-1.5 transition-all ${
            activeTab === 'volunteers' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="w-4 h-4" /> Volunteers Directory
        </button>
      </div>

      {/* Tab Panels Display */}
      <div className="w-full">
        {activeTab === 'users' && <UsersTable />}
        {activeTab === 'ngos' && <NGOTable />}
        {activeTab === 'volunteers' && <VolunteerTable />}
      </div>
    </div>
  );
}
