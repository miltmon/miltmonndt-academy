import React from 'react';

export default function OnboardingComplete({ onDone }: { onDone?: () => void }) {
  return (
    <div className="onboarding-complete">
      <h2>You're all set</h2>
      <p>Welcome to the Academy — your onboarding is complete.</p>
      <button onClick={() => onDone && onDone()}>Go to Dashboard</button>
    </div>
  );
}
