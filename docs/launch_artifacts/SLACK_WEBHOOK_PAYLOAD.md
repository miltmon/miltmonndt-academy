# Slack webhook example (JSON payload)
curl -X POST -H 'Content-type: application/json' --data '{
  "text":"MANUS: Run acceptance matrix & smoke script, attach screenshots/logs, and report PASS/FAIL in #academy-launch. Prioritize onboarding→role-routing checks.",
  "username":"AcademyBot"
}' https://hooks.slack.com/services/XXX/YYY/ZZZ
