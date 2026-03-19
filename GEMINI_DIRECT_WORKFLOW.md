# Gemini Direct Workflow

## Role Split
- `Gemini`: primary UI/design/implementation agent
- `Codex`: reviewer, integrator, verifier, cleanup, conflict control

## Product Direction
- Obsidian-inspired knowledge product
- Calm dark workspace
- Premium internal-tool quality
- High readability
- Strong information hierarchy
- No generic AI startup look

## Visual Principles
- Prefer zinc/slate/ink surfaces over loud gradients
- Keep cards sharp and restrained
- Use strong layout structure before decoration
- Make every page show one clear next action
- Let content and relationships lead, not chrome

## Page Intent
- `Home`: continue the most meaningful current note
- `Topic`: read one topic across Light / Core / Deep
- `Guide`: map a starting path from user intent
- `Route`: show learning progression with current and next transitions
- `Library`: behave like a personal knowledge vault
- `Workspace`: behave like a research board / thinking room

## Editing Rules
- Read relevant files first
- Do not change unrelated files
- Keep mobile usable
- Keep copy calm, intelligent, and concise
- Prefer implementation-ready decisions over vague suggestions

## Verification
After changes, Gemini should run:

```powershell
npm run lint
npm run build
```

Then it should report:
- changed files
- summary of changes
- verification outcome

## Typical Use

```powershell
npm run gemini:ui -- "Redesign the home page hero and recommendation area to feel more premium and focused."
```

```powershell
npm run gemini:ui -- "Refine the topic page so Light, Core, and Deep feel more distinct and easier to scan."
```
