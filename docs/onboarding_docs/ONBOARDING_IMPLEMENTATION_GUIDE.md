# Onboarding Implementation Guide
- Components: RoleSelection, ProfileForm, SkillsSelection, OnboardingComplete, Onboarding wrapper
- API endpoints: POST /api/users/onboard (server-side persists data)
- Middleware: onboardingGuard to block protected routes until onboarding complete (or cookie)
- Testing: Unit test components and integration test flow with test user
