🔔 ACTION ITEMS — QA / MANUS / OPS

Team — run the launch checks and report back in this issue.

1) Run automated smoke script (attach output)
   - Linux/Mac: `./academy_smoke_check.sh`
   - Windows (PowerShell): `.cademy_smoke_check.ps1`
   - Paste stdout/stderr or attach as artifact

2) Execute acceptance matrix (ACADEMY_QA_RUNBOOK.md)
   - Complete all 11 test cases
   - Capture screenshots (incognito for auth flows)
   - For each test: PASS / FAIL + short notes + screenshot(s)

3) If any FAIL:
   - File a GitHub issue (link from this issue) or add a comment below:
     - Test case:
     - Steps to reproduce:
     - Expected result:
     - Actual result:
     - Time (UTC):
     - Request ID / Log snippet:
     - Screenshot(s)
   - Mark severity: Critical / High / Medium / Low

4) After tests complete:
   - Reply here with summary (PASS/FAIL table + attachments)
   - Assign any critical fixes to @dev-lead and tag #urgent
