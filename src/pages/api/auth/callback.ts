import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This is a simplified OAuth callback handler stub
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).send('Missing code');
    // In production exchange code with Google and create session.
    // For now, acknowledge and redirect to app
    res.writeHead(302, { Location: '/onboarding' });
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('oauth callback error');
  }
}
