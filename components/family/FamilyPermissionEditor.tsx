import React from 'react';
import { ExtendedFamilyMember } from '../../hooks/use-family-members';
import { Shield, Eye, ToggleLeft, ToggleRight, Settings } from 'lucide-react';

interface FamilyPermissionEditorProps {
  members: ExtendedFamilyMember[];
  buckets: string[];
  onTogglePermission: (memberId: string, bucketName: string) => void;
}

export function FamilyPermissionEditor({ members, buckets, onTogglePermission }: FamilyPermissionEditorProps) {
  return (
    <div className="border border-slate-150 rounded-2xl bg-white p-5 shadow-xs">
      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
        <Settings className="w-4 h-4 text-emerald-600" />
        <h4 className="text-xs font-black text-slate-800 tracking-tight">Permissions de Sandoqs Partagés</h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Membre</th>
              {buckets.map((b) => (
                <th key={b} className="py-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">{b}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-7 h-7 rounded-lg bg-slate-100" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-[10px] font-black text-slate-800 leading-tight">{member.name.split(' ')[0]}</div>
                      <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">{member.role}</div>
                    </div>
                  </div>
                </td>

                {buckets.map((bucket) => {
                  const hasAccess = member.sharedBuckets.includes(bucket) || member.role === 'admin';
                  const isReadOnly = member.role === 'viewer';

                  return (
                    <td key={bucket} className="py-2.5 text-center">
                      {member.role === 'admin' ? (
                        <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md uppercase">
                          Admin complet
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onTogglePermission(member.id, bucket)}
                          className="focus:outline-none"
                        >
                          {hasAccess ? (
                            <ToggleRight className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-300" />
                          )}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default FamilyPermissionEditor;
