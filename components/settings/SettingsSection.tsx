import React from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="border-b border-slate-50 pb-3">
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">{title}</h3>
        {description && <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{description}</p>}
      </div>
      <div className="pt-2">{children}</div>
    </div>
  );
}
export default SettingsSection;
