# Ready-to-run commands

# Label + assign issue
gh issue edit 29 --repo miltmon/clausebot-api --add-label "qa,high-priority,deployment"
gh issue edit 29 --repo miltmon/clausebot-api --add-assignee MANUS_GITHUB_USERNAME

# Smoke checks
curl -I https://academy.miltmonndt.com
./academy_smoke_check.sh
