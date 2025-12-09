import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{firstName?:string; lastName?:string; phone?:string}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // pre-fill from session if available
    const cached = sessionStorage.getItem("onboarding_profile");
    if (cached) setProfile(JSON.parse(cached));
  }, []);

  async function saveAndNext() {
    setLoading(true);
    sessionStorage.setItem("onboarding_profile", JSON.stringify(profile));
    navigate("/onboarding/skills");
    setLoading(false);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); saveAndNext(); }}>
      <h2>Your profile</h2>
      <label>First name
        <input value={profile.firstName || ""} onChange={e => setProfile({...profile, firstName: e.target.value})}/>
      </label>
      <label>Last name
        <input value={profile.lastName || ""} onChange={e => setProfile({...profile, lastName: e.target.value})}/>
      </label>
      <label>Phone
        <input value={profile.phone || ""} onChange={e => setProfile({...profile, phone: e.target.value})}/>
      </label>
      <div>
        <button type="submit" disabled={loading}>Next: Skills</button>
      </div>
    </form>
  );
};

export default ProfileForm;
