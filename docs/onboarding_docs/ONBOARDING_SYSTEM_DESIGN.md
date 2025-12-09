# Onboarding System Design (summary)
- Purpose: Collect role, profile and skills then route user to role-specific dashboard.
- Flow: OAuth -> Onboarding stepper (role -> profile -> skills) -> mark onboarding_status = complete -> redirect to dashboard
- Data model: users.onboarding_status, users.role, user_skills table
- Security: Use RLS and server-side 'users/onboard' endpoint for writes.
