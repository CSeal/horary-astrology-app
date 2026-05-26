Read docs/orchestration/handoff-log.md and display a status table of all stages:

| Stage | Agent | Status | Gate | Last Artifact |
|---|---|---|---|---|

Stages to check: Stage1-Research, Stage2-PRD, Stage3-Design, Stage4-Architecture, Stage5a-Foundation, Stage5b-Services, Stage5c-Screens, Stage5d-Polish, Stage6-QA

After the table, show:
- Next pending stage and the command to run it
- Any blockers recorded in handoff-log

If handoff-log.md does not exist, report: "No stages complete yet. Run /orchestrate-stage4 to begin (Stages 1-3 are already complete)."
