param(
  [Parameter(Position = 0, Mandatory = $true)]
  [string]$Task
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$workflowPath = Join-Path $projectRoot "GEMINI_DIRECT_WORKFLOW.md"

$prompt = @"
You are Gemini acting as the primary implementation agent for this project.

Project:
- Next.js web product in the current workspace
- UI direction: Obsidian-inspired knowledge product
- visual system: calm dark workspace, premium, editorial, not generic AI SaaS
- product language: home, topic, guide, route, library, workspace

Your job:
1. Read the existing code before changing anything
2. Implement the requested task directly in code
3. Keep changes within the natural scope of the task
4. Preserve existing working behavior unless the task requires changing it
5. After editing, run:
   - npm run lint
   - npm run build
6. Report:
   - files changed
   - what changed
   - verification result

Important design rules:
- Follow the workflow and constraints in GEMINI_DIRECT_WORKFLOW.md
- Prefer calm, sharp, information-dense UI over flashy visuals
- Avoid generic AI startup styling
- Favor clarity, hierarchy, and strong next actions
- Do not rewrite unrelated files

User task:
$Task
"@

Write-Host ""
Write-Host "=== Gemini Direct Implementation ===" -ForegroundColor Cyan
Write-Host "Project root: $projectRoot"
Write-Host "Workflow: $workflowPath"
Write-Host "Task: $Task"
Write-Host ""

Set-Location $projectRoot

gemini -p $prompt --approval-mode yolo --output-format text
