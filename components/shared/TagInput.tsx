import React, { useState } from 'react';
import { X, Plus, Hash } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  language: 'fr' | 'darija';
}

const POPULAR_TAGS = ['cash', 'carte', 'dar', 'maouche', 'marjane', 'bim', 'ramadan', 'aid', 'daret', 'souq'];

export function TagInput({
  tags,
  onChange,
  language
}: TagInputProps) {
  const [inputVal, setInputVal] = useState('');

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/#/g, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      onChange([...tags, cleanTag]);
      setInputVal('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputVal);
    }
  };

  return (
    <div className="space-y-1.5 font-sans">
      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        Mots-clés / Tags (Wousoum)
      </label>
      
      <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-100 rounded-2xl min-h-12 items-center">
        {tags.map((tag, idx) => (
          <span 
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-black uppercase tracking-wider"
          >
            <Hash size={10} className="text-slate-400" />
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(idx)}
              className="hover:bg-slate-300 p-0.5 rounded-full text-slate-500 cursor-pointer"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 bg-transparent border-none outline-hidden text-xs font-bold text-slate-700 min-w-20 p-0.5"
          placeholder="Ajouter un tag..."
        />
      </div>

      {/* Suggested popular Moroccan tags */}
      <div className="flex flex-wrap gap-1 items-center">
        <span className="text-[9px] font-bold text-slate-400 mr-1 select-none">Suggestions:</span>
        {POPULAR_TAGS.filter(pt => !tags.includes(pt)).slice(0, 5).map(pt => (
          <button
            key={pt}
            type="button"
            onClick={() => handleAddTag(pt)}
            className="px-2 py-0.5 bg-white border border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-700 rounded-md text-[9px] font-bold transition-all cursor-pointer"
          >
            #{pt}
          </button>
        ))}
      </div>
    </div>
  );
}
