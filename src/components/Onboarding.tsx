import React, { useState } from 'react';
import RoleSelection from './onboarding/RoleSelection';
import ProfileForm from './onboarding/ProfileForm';
import SkillsSelection from './onboarding/SkillsSelection';
import OnboardingComplete from './onboarding/OnboardingComplete';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function Onboarding({ user }: { user: any }) {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const next = () => setStep(s => s + 1);
  const finish = async () => {
    // mark user as onboarded
    await supabase.from('users').update({ onboarding_status: 'complete' }).eq('id', user.id);
    router.push('/dashboard');
  };

  return (
    <div className="onboarding-wrapper">
      {step === 0 && <RoleSelection onSelect={(r:any) => { supabase.from('users').update({ role: r }).eq('id', user.id); next(); }} />}
      {step === 1 && <ProfileForm userId={user.id} onSaved={next} />}
      {step === 2 && <SkillsSelection userId={user.id} onComplete={next} />}
      {step === 3 && <OnboardingComplete onDone={finish} />}
    </div>
  );
}
