import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { user_id, role, profile, skills } = req.body;
  try {
    await supabase.from('users').update({ role, profile, onboarding_status: 'complete' }).eq('id', user_id);
    if (Array.isArray(skills)) {
      const rows = skills.map((s:any) => ({ user_id, skill: s }));
      await supabase.from('user_skills').insert(rows);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to save onboarding' });
  }
}
