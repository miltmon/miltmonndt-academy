import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const OnboardingComplete: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    async function verify() {
      // FIXED: Use async getUser()
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate("/login");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("onboarding_status")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        setOk(false);
      } else {
        setOk(data?.onboarding_status === "completed");
      }
      setLoading(false);
    }
    verify();
  }, [navigate]);

  if (loading) return <div>Verifying...</div>;

  return (
    <div>
      {ok ? (
        <>
          <h2>You're all set 🎉</h2>
          <p>Welcome to the Academy. Click below to go to your dashboard.</p>
          <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
        </>
      ) : (
        <>
          <h2>Onboarding incomplete</h2>
          <p>Something didn't finish. Please retry onboarding.</p>
          <button onClick={() => navigate("/onboarding/role")}>Restart</button>
        </>
      )}
    </div>
  );
};

export default OnboardingComplete;
