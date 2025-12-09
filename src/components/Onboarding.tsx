import React from "react";
import { Routes, Route } from "react-router-dom";
import RoleSelection from "./onboarding/RoleSelection";
import ProfileForm from "./onboarding/ProfileForm";
import SkillsSelection from "./onboarding/SkillsSelection";
import OnboardingComplete from "./onboarding/OnboardingComplete";

const Onboarding: React.FC = () => {
  return (
    <Routes>
      <Route path="role" element={<RoleSelection />} />
      <Route path="profile" element={<ProfileForm />} />
      <Route path="skills" element={<SkillsSelection />} />
      <Route path="complete" element={<OnboardingComplete />} />
      {/* default to role selection */}
      <Route path="*" element={<RoleSelection />} />
    </Routes>
  );
};

export default Onboarding;
