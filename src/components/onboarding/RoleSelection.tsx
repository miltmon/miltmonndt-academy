import React from 'react';

type Role = 'Welder' | 'Pipefitter' | 'Inspector' | 'Enterprise';
interface Props {
  initial?: Role | null;
  onSelect: (role: Role) => void;
}

export default function RoleSelection({ initial = null, onSelect }: Props) {
  const roles: Role[] = ['Welder','Pipefitter','Inspector','Enterprise'];
  return (
    <div className="role-selection">
      <h2>Choose your role</h2>
      <div className="roles-grid">
        {roles.map(r => (
          <button key={r} onClick={() => onSelect(r)} className="role-btn">
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
