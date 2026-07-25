import React from 'react';
import SettingsForm from '../../components/admin/SettingsForm.jsx';
import NotificationComposer from '../../components/admin/NotificationComposer.jsx';
import { Settings } from 'lucide-react';

export default function SystemSettingsView() {
  return (
    <div className="w-full flex flex-col gap-6 text-foreground">
      {/* Header bar */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> System Configurations & Announcements
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Adjust operating constants, upload limit parameters, and broadcast messages target groups.
        </p>
      </div>

      {/* Forms Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SettingsForm />
        </div>
        <div>
          <NotificationComposer />
        </div>
      </div>
    </div>
  );
}
