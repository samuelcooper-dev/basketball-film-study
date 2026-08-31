# Quick Start Guide

Get the extension running in 5 minutes.

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Build the extension
npm run build
```

This creates a `/dist` folder with the compiled extension.

## Load into Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `/dist` folder from this project

The extension is now installed.

## First-Time Setup

### 1. Set Up Output Folder

Before you can save reports, you need to choose a folder:

1. Click the extension icon in the Chrome toolbar (puzzle piece → Basketball Film Study)
2. A side panel opens
3. Click **Choose Folder**
4. Create or select a folder (e.g., "Film Study Reports")
5. Click **Select Folder** to grant access

This folder will store all your PDF reports and season CSV.

### 2. Create Your Roster

1. Navigate to any YouTube video (e.g., search "basketball game full" on YouTube)
2. The Film Study panel appears on the right side of the page
3. Enter your team name (e.g., "Varsity Eagles")
4. Paste your roster in the format: `1 John Smith, 4 Alex Lee, 23 Sam Cooper`
   - Format: `jersey# FirstName LastName`, separated by commas
5. Click **Save Roster**

## Log Your First Game

### Start a Game Session

1. Navigate to a YouTube video of a basketball game
2. The Film Study panel is on the right
3. Enter the opponent name (e.g., "Central High")
4. Enter the game date (defaults to today)
5. Click **Start Game**

### Toggle On-Court Players

Click player chips to mark who's on the floor (up to 5). They turn green when "on."

### Log Events

1. Click an event button (e.g., **2PT Make**)
2. A form appears with the timestamp already captured
3. Select the player(s) involved
4. Edit the auto-generated comment if needed
5. Click **Save**

The event appears in the timeline below. Click the timestamp to jump the video to that moment.

### End the Game

1. Click **End Game & Generate Report**
2. The side panel opens automatically
3. The extension generates:
   - `game_YYYY-MM-DD_opponent.pdf` (full game report)
   - `season_stats.csv` (updated with this game's stats)

Check your chosen folder — both files are there.

## Event Types Cheat Sheet

| Category | Events |
|----------|--------|
| **Scoring (Ours)** | 2PT Make/Miss, 3PT Make/Miss, FT Make/Miss |
| **Ball Movement** | Assist, Rebound (Off), Rebound (Def) |
| **Defense** | Steal, Block, Foul |
| **Turnovers** | Turnover |
| **Advanced** | Screen Assist, Deflection, Charge Taken, Blown Coverage, Help D Breakdown |
| **Opponent** | Opp Score (2PT/3PT/FT) — enter opponent jersey # |
| **Other** | Custom — free-form comment |

## Tips

- **Undo:** Click "Undo Last" to quickly remove the most recent event
- **Edit/Delete:** Each timeline event has a Delete button
- **Seek Video:** Click any event's timestamp to jump the video to that moment
- **On-Court Tracking:** Toggle players before logging events so plus/minus is calculated correctly
- **Collapse Panel:** Click the blue header bar to collapse/expand the panel if it's in the way

## Troubleshooting

**Panel doesn't appear**
- Make sure you're on a `youtube.com/watch?v=...` page (not the homepage)
- Refresh the page
- Check that the extension is enabled in `chrome://extensions`

**Can't save reports**
- Open the side panel (click extension icon)
- Make sure folder access is granted
- If permission was revoked, click "Change Folder"

**Events not logging**
- Make sure you've clicked "Start Game" first
- Check the browser console (`F12` → Console) for errors

**Video timestamp not captured**
- The extension reads the video's `currentTime` when you click the button
- Make sure the video is loaded (not just buffering)

## Next Steps

- Review the full [README.md](README.md) for architecture details
- Check `public/ICONS_README.txt` to replace placeholder icons with custom ones
- Run `npm run dev` for development mode with hot reload
- Open a GitHub issue if you find bugs or have feature requests

---

That's it! You're ready to log stats during film study.
