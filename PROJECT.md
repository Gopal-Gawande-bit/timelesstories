# Timeless Stories Production House

Local production studio for the YouTube channel **Timeless Stories**. The app is a production house: it holds channel context, remembers preferences, turns a script into a scene/shot graph, and renders **coded motion-comic video** instead of a slideshow.

This file is the knowledge base for humans and for a future Director agent. Keep it accurate when the pipeline changes.

## Channel

- **Name:** Timeless Stories
- **Formats:** YouTube long-form (16:9, 1920×1080) and YouTube/Instagram Reels (9:16, 1080×1920)
- **Language:** Hindi voiceover and scripts by default
- **Genres:** folk stories, mystery, explanation / essay, kids, podcast-like talk

Today’s bottleneck is not “having an idea.” It is repeating the same LLM context, cutting scripts into scenes/shots by hand, generating inconsistent stills, editing a slideshow in Clipchamp, then writing titles and thumbnails — about two hours per video, for 10–60 views and a small subscriber base.

## Problems this studio exists to solve

1. **Repetitive production context.** Genre, tone, length, script type, character/environment rules, and Hindi narration style are re-explained to a chat model every time. Those belong in **named preference profiles** and a project graph.
2. **Slideshow visuals.** Still images with Ken Burns done by accident (or not at all) do not hold attention. The visual system here is **limited animation / motion-comic**, coded per shot.
3. **Thin edit.** Fear of copyright led to no BGM/SFX. Silence feels unfinished. The engine has licensed SFX cue slots per shot. Use YouTube Audio Library, Mixkit, Pixabay, or Epidemic — never scraped commercial tracks.
4. **Split tools.** Script in ChatGPT, VO in Gemini TTS, images in ChatGPT, edit in Clipchamp, metadata in ChatGPT, upload in YouTube Studio. One house should own the graph from script to export. Upload can stay manual at first.

**Time target:** 2 hours → about 5 minutes of operator time once agents and assets mature. v1 does not claim that speed yet.

## Quality bar (read this before asking for “anime”)

Japanese anime and Cartoon Network shows are not React packages. They need character rigs, walk cycles, lip sync, and hand-timed acting.

**v1 quality target: motion-comic / limited animation**

- Layered stills: background, midground, character, FX
- Camera language: angle, pan, zoom/dolly, Ken Burns, shake
- Parallax between layers
- Hard cuts between shots
- Voiceover-aligned timing
- Later: idle loops, mouth visemes, licensed SFX/BGM

That is how many premium story channels actually look, and it can be fully coded. Rigged 2D (Rive) or generative video per shot are later slots on the same shot object — not a rewrite.

## Three phases

The UI and the data follow the same three phases. Improve a phase in place; do not invent a fourth “misc” dump.

### Phase 1 — Script (current work)

One page: `/script`. Pick or write a small reusable preference, type a title, generate **version 1**, then add instructions and **revise**. Older versions stay. The UI stays loose; do not add fields unless the operator asked for them.

Frontend-only. Persistence is **localStorage**. Every save/load is commented `FUTURE: persist via backend API`.

**Operator loop**

1. Preference: name, genre, shape (story / dialogue / podcast / explainer / kids), voiceover length, language (default Hindi), optional informal instructions.
2. This video: title only (English is fine, e.g. `shapit tota`). Generate.
3. Versions: current body is the active script. “Change this version” + Revise writes the next version; previous bodies stay. “Use this” copies a version into `Project.script` for Phase 2.

**Hidden prompt engineering** (`src/ai/prompts/channelVoice.js`)

The app always tells the writer: you are the Timeless Stories Director / book writer; spoken Hindi voiceover; honor genre, shape, length (~125 words/min); title may be English; no subscribe/clickbait. Operator instructions are extra, not a replacement.

**Preferences (slim)**

`id`, `name`, `genre`, `scriptType`, `lengthId`, `language`, `instructions`. No tone/POV/audience/banned/world knobs in the UI.

**Director job** (`src/ai/director/runScriptJob.js`)

Same pipeline: retrieve → brief → draft → critique → length. `mode: "generate"` or `mode: "revise"` (previous body + new notes). Agents stay internal; the Script page does not show step logs.

**Who writes the words**

`localDirectorProvider` is the current writer. `llmProvider.js` is a stub. **FUTURE:** Gemini/OpenAI/backend. Same job, different provider.

### Phase 2 — Animation engine (ChatGPT outside the app)

The operator has **no API keys and no in-app LLM**. They have ChatGPT in a browser. This house is the **renderer**: Remotion, GSAP, Three, transitions, motion-blur. ChatGPT writes the cut.

**Flow**

1. **Details** (`/stage`) — voiceover, script, instructions, 2D/3D, format. Generate.
2. **Animation** (`/stage/play`) — copy **ChatGPT prompt**, **package.json**, and a **template**. Paste or upload the file ChatGPT returns. Play. Copy that file again to revise in ChatGPT.

No in-app scene planner, Lot, Cast, Sets, or local “improve this shot” director. Those files may still exist in the repo; they are out of the UI.

**FUTURE:** MP4 export. Hosted LLM only if someone later has keys.

### Phase 3 — Publish

Title, description, thumbnail, export. High-CTR/SEO copy later comes from an agent that reads the same script and shot list. YouTube Studio upload stays outside the app until an upload API is worth the auth cost.

## Canonical project graph

This is the Director’s language. Humans edit it. Agents fill it. Remotion renders it. Do not invent parallel JSON shapes per feature.

- **PreferenceProfile[]** — reusable briefing: name, genre, shape, length, language, instructions
- **Project** — `id`, `name`, `format` / `deliveryFormat` (`youtube` | `shorts` | `instagram`), `genre`, `fps`, `cast[]`, `sets[]`
- **Script** — working title, language, type, target length, `body` (canonical VO text for Phase 2)
- **scriptVersions[]** — `{ version, title, body, notes, createdAt }` ; generate/revise append, never overwrite
- **Scene[]** — intent, location, time of day, mood, ordered shots
- **Shot[]** — duration in frames, VO in/out, action, VO line, camera, layers (SVG `kit`+`variant` or painted demo), `sfxCue`
- **Lot assets** — IndexedDB `{ id, kind: character|background, name, kit, variant }`
- **cutVersions** — IndexedDB snapshots of the cut (not MP4 yet)
- **Publish** — title, description, thumbnail prompt/asset
- **Voiceover** — IndexedDB blob id, fileName, durationSeconds

## Director

The Director is not a chat widget. It is an orchestrator with:

- this file and channel taste (`src/ai/prompts/channelVoice.js`)
- the current `Project` graph
- tools to write scripts now, scenes/shots later
- local RAG over preference profiles and past scripts
- later: MCP/RAG over past videos that performed, and a real LLM provider

The operator still picks profile + topic. The local provider writes. The UI stays usable without a hosted model.

## Persistence

**Now:** `localStorage` for profiles + project JSON. IndexedDB (Dexie) for voiceover blobs, Lot assets, and cut versions.

**FUTURE:** backend API + object storage. Phase 1 still does not store scripts in Dexie.

## Package map

**Studio UI (Vite)**

| Package | Role |
| --- | --- |
| `react`, `vite`, `react-router-dom` | Production-house app |
| `tailwindcss` | Layout, no UI-kit lock-in |
| `zustand` | Current project + profiles in memory |
| `dexie` | Unused by Phase 1; leftover POC. FUTURE backend/DB |
| `motion` | Studio chrome only. Never inside Remotion frames |

**Video engine**

| Package | Role |
| --- | --- |
| `remotion`, `@remotion/player`, `@remotion/cli` | Frame-accurate preview and MP4 export |
| `@remotion/media-utils` | Voiceover duration / waveform later |
| `gsap`, `@remotion/gsap` | Shot choreography on Remotion’s clock |

**AI layout (frontend, no LangChain)**

`src/ai/director`, `agents`, `prompts`, `providers`, `rag`, `mcp`, `jobs`.

Vite serves the studio. Remotion Player previews inside Production. Remotion CLI still bundles with its own webpack to export.

**Not in this pass:** real LLM HTTP, API-key settings UI, backend, embeddings, MCP server, YouTube upload, in-app TTS, Rive/Spine, Three.js, Pixi, Theatre.js, LangChain.

## Local commands

```bash
npm install
npm run dev          # studio at Vite
npm run remotion     # Remotion Studio for the same compositions
npm run build        # studio production build
```

## What v1 is not

No hosted LLM calls, no Gemini TTS, no YouTube upload, no screenplay agent, no thumbnail generator, no 10-minute episode from one click. Those attach to this graph after the house and renderer exist.
