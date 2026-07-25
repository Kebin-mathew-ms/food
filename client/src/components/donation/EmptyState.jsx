import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  title = 'No donations found',
  description = 'Try adjusting your search filters or add a new donation listing.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card border border-border border-dashed rounded-xl max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
        <PackageOpen className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
};

export default EmptyState;
