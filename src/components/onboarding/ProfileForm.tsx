import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnon);

export default function ProfileForm({ userId, onSaved }: { userId: string; onSaved?: () => void }) {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [experience, setExperience] = useState('');

  const save = async () => {
    await supabase.from('users').update({
      full_name: fullName,
      company,
      experience_level: experience
    }).eq('id', userId);
    onSaved && onSaved();
  };

  return (
    <div className="profile-form">
      <h2>Profile</h2>
      <label>Full name<input value={fullName} onChange={e=>setFullName(e.target.value)} /></label>
      <label>Company<input value={company} onChange={e=>setCompany(e.target.value)} /></label>
      <label>Years experience<input value={experience} onChange={e=>setExperience(e.target.value)} /></label>
      <button onClick={save}>Save & Continue</button>
    </div>
  );
}
