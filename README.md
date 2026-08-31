# Basketball Film Study — YouTube Stat Logger & Report Generator

Film study shouldn't require a stopwatch, a notebook, manual CSV data entry, and remembering who was on court at every play. This Chrome extension turns any YouTube game video into a full-featured stat-tracking workspace — timestamped events, automatic plus/minus, and one-click PDF + CSV exports.

**Current capabilities:** Real-time event logging · On-court lineup tracking · Advanced stats (screen assists, deflections, charges, blown coverages) · Auto-generated PDF game reports · Season-long CSV export · All data stored locally, no cloud dependency

## The Problem

Coaches and players reviewing game film on YouTube have to:
- Manually track timestamps on paper or in a separate spreadsheet
- Remember who was on court during each play for plus/minus calculations
- Aggregate stats across multiple games by hand
- Export data into multiple formats for different audiences (box score vs. film breakdown)
- Switch between the video player, a stopwatch, and a stats sheet constantly

Film study tools are either enterprise-level ($$$) or require uploading video to a third-party platform. There's no lightweight, privacy-first tool that works directly on YouTube where most coaches already host their film.

## What It Does

- **Timestamped event logging** — Click a button ("2PT Make", "Turnover", etc.) and the video's current timestamp is captured instantly. Add player(s) and a comment, then save.
- **On-court tracking** — Toggle which players are on the floor; lineup changes are recorded with timestamps. Plus/minus is calculated automatically based on who was on-court during scoring events.
- **Advanced stats** — Screen assists, deflections, charges taken, blown coverages, help defense breakdowns — stats that don't show up in traditional box scores.
- **PDF game reports** — Box score, advanced stats table, opponent scoring by jersey number, full event timeline, and a problem areas summary (turnovers/breakdowns by player).
- **Season CSV export** — One row per player per game, saved to a local folder. Re-running a game overwrites its rows (allows corrections). Open in Excel/Sheets to pivot for season totals.
- **Timeline scrubbing** — Click any logged event in the timeline to seek the video to that timestamp. Edit or delete events inline.
- **File System Access API** — Reports and CSVs are saved directly to a folder you choose (no clunky browser downloads every time).

## How It Works — From Roster to Report

### 1. Set Up Your Roster (One-Time)

The first time you open the extension on a YouTube video, you'll paste a comma-separated list of players:

```
1 John Smith, 4 Alex Lee, 23 Sam Cooper, 10 Taylor Jordan, 15 Chris Brown
```

Format: `number name`, separated by commas. The extension parses this into a roster and stores it locally. You can re-paste a new list anytime to update (old game data stays intact via stable player IDs).

### 2. Start a Game Session

Navigate to a YouTube game video. The Film Study panel appears as a docked sidebar on the right side of the page.

- **Opponent name:** e.g., "Central High"
- **Game date:** Defaults to today
- Click **Start Game**

The extension creates an in-progress game session tied to this video's ID. If you navigate away and come back to the same video, it resumes the session.

### 3. Log Events During Film Review

#### On-Court Toggle Strip

All roster players appear as chips. Click to toggle them "on" (highlighted green). The extension tracks lineup changes with timestamps. When a scoring event happens, it knows who was on court and calculates plus/minus automatically.

#### Event Button Grid

Organized into categories:

- **Scoring (Ours):** 2PT Make/Miss, 3PT Make/Miss, FT Make/Miss
- **Ball Movement/Defense:** Assist, Rebound (Off/Def), Steal, Block, Turnover, Foul
- **Advanced:** Screen Assist, Deflection, Charge Taken, Blown Coverage, Help D Breakdown
- **Opponent:** Opp Score (2PT/3PT/FT) — enter opponent jersey number only (no full roster)
- **Custom:** Free-form event with just a comment

#### Logging Flow

1. Click an event button → timestamp captured from `video.currentTime` immediately
2. Form appears: select player(s), edit auto-generated comment
3. Click Save → event stored with timestamp, players, on-court snapshot, and comment

#### Timeline

Reverse-chronological list of all logged events. Each row shows:
- **Timestamp** (clickable → seeks video)
- **Event type badge**
- **Player(s) involved**
- **Comment**
- **Delete button**

Also: **Undo Last** button for quick corrections.

### 4. End Game & Generate Report

Click **End Game & Generate Report**. The extension:

1. Marks the game as completed
2. Opens the side panel (if not already open)
3. Generates a PDF report: `game_YYYY-MM-DD_opponent.pdf`
4. Appends/updates the season CSV: `season_stats.csv`

Both files are saved to a folder you choose once (via File System Access API).

#### PDF Report Contents

- **Header:** Team name, opponent, date, video URL
- **Box Score:** Points, FG/3PT/FT makes/attempts, rebounds (off/def), assists, turnovers, steals, blocks, fouls
- **Advanced Stats:** Plus/minus, screen assists, deflections, charges taken, blown coverages, help D breakdowns
- **Opponent Scoring:** By jersey number, sorted by points
- **Event Timeline:** Full play-by-play (timestamp, event, player, comment)
- **Problem Areas Summary:** Grouped counts of turnovers, blown coverages, and opponent scores by player (makes issues jump out)

#### Season CSV

One row per player per game:

```csv
date,opponent,player_number,player_name,points,fg_m,fg_a,three_m,three_a,ft_m,ft_a,reb_off,reb_def,ast,tov,stl,blk,fouls,screen_ast,deflections,charges,blown_coverage,help_d_breakdown,plus_minus
2024-01-15,Central High,23,Sam Cooper,14,5,9,2,4,2,2,3,5,4,2,1,0,2,1,3,0,1,0,+8
```

If you regenerate a game (edit events and re-export), the extension removes old rows for that `date+opponent` and appends the new ones. The CSV never bloats — it's always the latest version of each game.

## Stack

| Layer | Tech | Why |
|-------|------|-----|
| Extension | Manifest V3 | Required for new Chrome extensions (v2 deprecated) |
| UI | React 18 + TypeScript | Shadow DOM mount avoids YouTube CSS conflicts |
| Build | Vite + `@crxjs/vite-plugin` | Fast dev server, MV3-aware bundling |
| Storage | `chrome.storage.local` + IndexedDB | Roster/games in chrome.storage; directory handle in IDB (not structured-cloneable) |
| PDF | jsPDF + jspdf-autotable | Client-side PDF generation, no server needed |
| CSV | Papa Parse | Robust CSV parsing/unparsing with type safety |
| File Access | File System Access API | Write directly to disk without download prompts |
| Content Injection | Shadow DOM | Panel injected into YouTube without CSS leakage |

## Architecture

```
YouTube page (youtube.com/watch?v=...)
  ↓
Content script (src/content/index.tsx)
  · Detects video navigation (yt-navigate-finish + polling)
  · Injects shadow DOM container
  · Mounts React panel inside shadow root
  ↓
FilmStudyPanel (src/panel/)
  · RosterSetup → one-time player list parsing
  · GameHeader → start/end game, display current timestamp
  · OnCourtToggle → 5-player lineup tracking
  · EventButtons → categorized event types
  · EventForm → player selection + comment editing (timestamp already captured)
  · Timeline → clickable event list with delete/undo
  ↓
Storage layer (src/lib/storage.ts)
  chrome.storage.local
    · Roster (team name + players)
    · GameSessions (in_progress / completed)
    · Settings (hasDirectoryHandle flag)
  IndexedDB
    · FileSystemDirectoryHandle (persisted across sessions)
  ↓
Stats computation (src/lib/stats.ts)
  · Per-player aggregation from GameEvent[]
  · Plus/minus: for each scoring event, add/subtract points to all onCourtPlayerIds
  · FG/3PT/FT: makes = event count, attempts = makes + misses
  · Opponent scoring: Map<jerseyNumber, points>
  ↓
Export triggered by "End Game" → message to side panel
  ↓
Side panel (src/extpage/)
  · Listens for REQUEST_EXPORT message
  · Calls File System Access API (needs user-gesture context)
  · generateGamePDF() → Blob
  · updateSeasonCSV() → read existing, merge, rewrite
  · Saves to chosen folder: game_YYYY-MM-DD_opponent.pdf + season_stats.csv
```

## Key Technical Decisions

### Why inject the panel via content script instead of using Chrome's built-in side panel for logging?

Chrome's `sidePanel` API is great for settings/export UI, but it's separate from the page DOM — it can't read `document.querySelector('video').currentTime` directly. The logging UI needs instant access to the video element to capture timestamps on button clicks. A content-script-injected panel lives in the page context, so `videoRef.current.currentTime` works immediately. We use the side panel only for File System Access operations (which require a proper extension-owned document with user gesture).

### Why store the directory handle in IndexedDB instead of `chrome.storage.local`?

`FileSystemDirectoryHandle` objects are not structured-cloneable — they can't be serialized into JSON for `chrome.storage`. IndexedDB natively supports storing non-cloneable objects. The extension stores the handle once in IDB, retrieves it on later sessions, and calls `.requestPermission()` to re-verify access. If permission is revoked, it re-prompts the user to pick the folder.

### Why capture the timestamp immediately on button click instead of waiting for the user to fill out the form?

The user might pause, rewind, or scrub the video while filling out the player selection form. If we waited to capture `currentTime` until form submission, the timestamp would be wrong. By capturing it in the button's `onClick` handler (before opening the form), we freeze the exact moment the event happened, even if the user takes 30 seconds to enter a comment.

### Why use a rolling upsert for lineup history instead of storing every toggle event separately?

Each lineup toggle creates a `{ atSec: number, onCourtPlayerIds: string[] }` entry. This is append-only during a game. At export time, the stats engine walks through events and lineup changes in chronological order to determine who was on court at each scoring event. If we stored lineup state as a single "current" value, we'd lose the ability to calculate plus/minus for events logged earlier in the video (common when scrubbing back and forth during film review).

### Why allow more than 5 players on court instead of hard-blocking it?

Data entry mistakes happen — a coach might click the wrong player and then click the right one without noticing the count. Hard-blocking would prevent logging events until the user figures out which toggle is wrong. Instead, we show a non-blocking warning. The stats engine treats `onCourtPlayerIds` as-is (if you log 6 players, all 6 get the plus/minus credit). The warning is enough to catch accidents without breaking the workflow.

## Installation

### Prerequisites

- Node.js 18+ and npm
- Chrome browser

### Setup Steps

```bash
# 1. Clone and install
git clone <repo-url>
cd basketball-film-tool
npm install

# 2. Build for production
npm run build
# → Creates /dist folder

# 3. Load into Chrome
# Open chrome://extensions
# Enable "Developer mode"
# Click "Load unpacked"
# Select the /dist folder

# 4. First-time folder setup
# Click the extension icon in Chrome toolbar
# Click "Choose Folder" in the side panel
# Select/create a folder for saving reports
```

### Icons (Optional)

The extension will work without icons, but Chrome may show warnings. Create three PNG files in `/public`:

- `icon16.png` (16×16)
- `icon48.png` (48×48)
- `icon128.png` (128×128)

Use any basketball-themed icon (🏀, clipboard, etc.). See `public/ICONS_README.txt` for details.

## Development

```bash
npm run dev
# → Vite dev server with hot reload
# Load /dist as unpacked extension
# Changes to src/ auto-rebuild
```

## Local Testing Workflow

1. Navigate to any YouTube video
2. The Film Study panel appears on the right
3. Set up roster (one-time)
4. Start a game (opponent name + date)
5. Toggle 5 players "on court"
6. Click event buttons and fill out forms
7. Check the timeline — click timestamps to seek video
8. Click "End Game" → side panel opens → PDF + CSV saved to your folder

## What I'd Do Next

- **Keyboard shortcuts** — Number keys 1–9 for quick event selection; arrow keys for undo/redo; enter to submit forms. The architecture already supports it (just map `keydown` events to button clicks), but v1 prioritizes mouse/touch workflows.

- **Opponent roster tracking** — Right now opponent scoring is logged by jersey number only (no names, no full stat lines). Adding a second roster and treating opponent events the same as ours would enable full two-team box scores. The stats engine already handles per-player aggregation — it just needs a second roster entity and a "team" field on `GameEvent`.

- **Cloud sync / multi-device** — All data is stored in `chrome.storage.local`, which is per-browser. A sync backend (Firebase, Supabase, etc.) would let coaches review film on a desktop and access reports on a tablet. The storage layer is already abstracted (`src/lib/storage.ts`) — swapping in a network-backed implementation would be straightforward.

- **Auto-event detection** — The holy grail: automatically detect makes/misses, rebounds, turnovers from the video itself. This would require:
  - Frame extraction from the `<video>` element
  - A computer vision model fine-tuned on basketball footage (YOLO, Detectron2, etc.)
  - Real-time inference in a Web Worker (or offload to a backend)
  - This is a completely separate project, but the event-logging architecture is designed to accept events from any source (manual button clicks or CV pipeline).

- **Autocomplete for comments** — The spec mentions autocomplete suggestions for common phrasings. Implementation: maintain a frequency map of past comments in `chrome.storage.local`, filter by prefix on user input, render a dropdown with the top 5 matches. Uses the same React state pattern as the player picker.

- **Export to coaching platforms** — Many teams use Hudl, SportsCode, or Google Sheets for stat aggregation. Adding export buttons for these formats (JSON for Hudl import, XML for SportsCode, direct Google Sheets API integration) would make this tool fit into existing workflows without replacing them.

## License

MIT

## Contributing

Pull requests welcome. Please open an issue first to discuss major changes.

---

**Quickstart for teammates:** `npm install && npm run build`, then load `/dist` into Chrome. First-time setup: roster entry + folder picker. Then start logging.
