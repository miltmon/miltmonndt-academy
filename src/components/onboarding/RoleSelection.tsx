import React from "react";
import { useNavigate } from "react-router-dom";

type Role = "welder" | "pipefitter" | "inspector" | "enterprise";

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  function choose(role: Role) {
    // store selection in session/local storage or navigate with state
    sessionStorage.setItem("onboarding_role", role);
    navigate("/onboarding/profile");
  }

  return (
    <div className="role-selection">
      <h2>Choose your role</h2>
      <div className="roles">
        {(["welder","pipefitter","inspector","enterprise"] as Role[]).map(r => (
          <button key={r} onClick={() => choose(r)} className="role-btn">
            {r[0].toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
