import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminDispatchNotificationMutation } from '../../hooks/useAdmin.js';
import { Send, Volume2 } from 'lucide-react';

const notificationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.').max(100),
  message: z.string().min(5, 'Message must be at least 5 characters.').max(500),
  target: z.enum(['ALL', 'DONORS', 'NGOS', 'VOLUNTEERS']),
});

export default function NotificationComposer() {
  const dispatchMutation = useAdminDispatchNotificationMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      target: 'ALL',
    },
  });

  const onSubmit = (formData) => {
    dispatchMutation.mutate(formData, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm text-foreground"
    >
      <h3 className="text-lg font-bold border-b border-border pb-3 mb-4 flex items-center gap-2 text-foreground">
        <Volume2 className="w-5 h-5 text-primary" /> Dispatch System Announcement
      </h3>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="target-select" className="text-xs text-muted-foreground font-semibold">Select Target Group</label>
        <select
          id="target-select"
          {...register('target')}
          className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          <option value="ALL" className="bg-card">All Registered Users</option>
          <option value="DONORS" className="bg-card">Only Food Donors</option>
          <option value="NGOS" className="bg-card">Only NGO Recipients</option>
          <option value="VOLUNTEERS" className="bg-card">Only Redistribution Volunteers</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title-input" className="text-xs text-muted-foreground font-semibold">Announcement Title</label>
        <input
          id="title-input"
          type="text"
          {...register('title')}
          placeholder="e.g. Schedule Maintenance Notice"
          className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
        {errors.title && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.title.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message-textarea" className="text-xs text-muted-foreground font-semibold">Message Body</label>
        <textarea
          id="message-textarea"
          rows={3}
          {...register('message')}
          placeholder="Type message content here..."
          className="bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
        {errors.message && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errors.message.message}</p>}
      </div>

      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={dispatchMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary border border-primary rounded-xl hover:bg-primary/90 transition-all shadow-sm"
        >
          <Send className="w-4 h-4" /> {dispatchMutation.isPending ? 'Sending...' : 'Broadcast Announcement'}
        </button>
      </div>
    </form>
  );
}
