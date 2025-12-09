import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function SkillsSelection({ userId, onComplete }: { userId: string; onComplete?: () => void }) {
  const [skills, setSkills] = useState<string[]>([]);
  const toggle = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev,s]);
  const save = async () => {
    await supabase.from('user_skills').upsert(skills.map(skill=>({ user_id:userId, skill })), { onConflict: ['user_id','skill'] });
    onComplete && onComplete();
  };

  const options = ['Visual Inspection', 'GMAW', 'SMAW', 'WPS Interpretation', 'NDT Basics'];
  return (
    <div className="skills-selection">
      <h2>Select skills</h2>
      <div className="skills-grid">
        {options.map(o => (
          <label key={o}>
            <input type="checkbox" checked={skills.includes(o)} onChange={()=>toggle(o)} /> {o}
          </label>
        ))}
      </div>
      <button onClick={save}>Save skills</button>
    </div>
  );
}
