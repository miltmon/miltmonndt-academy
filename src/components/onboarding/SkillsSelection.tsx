import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SkillsSelection: React.FC = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem("onboarding_skills");
    if (cached) {
      const arr = JSON.parse(cached) as string[];
      setSelected(arr.reduce((acc, s) => ({...acc, [s]: true}), {} as Record<string,boolean>));
    }
    setSkills(["SMAW","GMAW","TIG","Flux-Cored","Inspection","Rigging"]);
  }, []);

  function toggle(skill: string) {
    setSelected(prev => ({...prev, [skill]: !prev[skill]}));
  }

  async function finish() {
    setSaving(true);
    const chosen = Object.keys(selected).filter(k => selected[k]);
    sessionStorage.setItem("onboarding_skills", JSON.stringify(chosen));

    // FIXED: Use async getUser()
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      setSaving(false);
      navigate("/login");
      return;
    }

    const profile = JSON.parse(sessionStorage.getItem("onboarding_profile") || "{}");
    const role = sessionStorage.getItem("onboarding_role") || null;

    // Upsert user profile
    const { error: upsertErr } = await supabase
      .from("users")
      .upsert({ 
        id: user.id, 
        onboarding_status: "completed", 
        role, 
        profile 
      }, {
        onConflict: 'id'
      });

    if (upsertErr) {
      console.error("Failed to upsert user", upsertErr);
      setSaving(false);
      return;
    }

    // FIXED: Batch upsert skills
    const skillRows = chosen.map(skill => ({ user_id: user.id, skill }));
    const { error: skillsError } = await supabase
      .from("user_skills")
      .upsert(skillRows, { 
        onConflict: 'user_id,skill' 
      });

    if (skillsError) {
      console.error("Failed to save skills", skillsError);
    }

    setSaving(false);
    navigate("/onboarding/complete");
  }

  return (
    <div>
      <h2>Select your skills</h2>
      <div className="skills-grid">
        {skills.map(s => (
          <button
            key={s}
            className={`skill ${selected[s] ? "on" : ""}`}
            onClick={() => toggle(s)}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>
      <div>
        <button onClick={() => navigate("/onboarding/profile")}>Back</button>
        <button onClick={finish} disabled={saving}>
          {saving ? "Saving..." : "Finish Onboarding"}
        </button>
      </div>
    </div>
  );
};

export default SkillsSelection;
