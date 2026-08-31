# Installation Verification Checklist

Use this checklist to verify the extension is working correctly after installation.

## ✅ Build Verification

- [x] `npm install` completed without errors
- [x] `npm run build` completed successfully
- [x] `/dist` folder created with the following structure:
  - `manifest.json`
  - `service-worker-loader.js`
  - `icon16.png`, `icon48.png`, `icon128.png`
  - `/assets` folder (compiled JS/CSS)
  - `/src/extpage/index.html`

## ✅ Chrome Installation Steps

1. Open Chrome browser
2. Navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Navigate to the `basketball-film-tool/dist` folder
6. Click **Select Folder**

Expected result: Extension appears in the list with name "Basketball Film Study"

## ✅ Extension Icon Verification

Look for the Basketball Film Study icon in:
- Chrome toolbar (puzzle piece icon → should see "Basketball Film Study")
- Extensions list at `chrome://extensions`

Note: Icons are currently placeholders. See `public/ICONS_README.txt` for instructions to create custom basketball-themed icons.

## ✅ Folder Setup (First-Time)

1. Click the extension icon in Chrome toolbar
2. Side panel opens on the right
3. You should see "Set up a folder to save game reports and season stats"
4. Click **Choose Folder**
5. File picker opens
6. Create or select a folder (e.g., create "Film Study Reports" in Documents)
7. Click **Select Folder**

Expected result: "✓ Folder access configured" message appears

## ✅ Roster Setup (First-Time)

1. Navigate to any YouTube video
   - Example: Search "basketball game full" on YouTube
   - Click any video to open it
2. The Film Study panel should appear on the right side of the page
3. You should see the "Roster Setup" screen

Test roster entry:
1. Team Name: Enter "Test Team"
2. Players: Paste this sample roster:
   ```
   1 John Smith, 4 Alex Lee, 23 Sam Cooper, 10 Taylor Jordan, 15 Chris Brown
   ```
3. Click **Save Roster**

Expected result: Panel updates to show game header, on-court toggle strip, and event buttons

## ✅ Event Logging Test

With the roster saved:

1. **Start a game:**
   - Opponent: "Test Opponent"
   - Date: (default to today is fine)
   - Click **Start Game**

2. **Toggle on-court players:**
   - Click 5 player chips (they should turn green)
   - Verify the count shows "On Court (5/5)"

3. **Log an event:**
   - Click **2PT Make** button
   - Form appears with timestamp captured
   - Select a player from the dropdown
   - Comment should auto-fill (e.g., "#1 John Smith — 2PT MAKE")
   - Click **Save**

4. **Verify timeline:**
   - Event appears in the timeline below
   - Click the timestamp (e.g., "0:15")
   - YouTube video should seek to that time

5. **Test undo:**
   - Click **Undo Last**
   - Event should disappear from timeline

6. **Test delete:**
   - Log another event
   - Click the **Delete** button on the event in the timeline
   - Confirm deletion
   - Event should disappear

## ✅ PDF & CSV Export Test

1. Log a few more events (at least 5-10 for a good report)
2. Click **End Game & Generate Report**
3. Side panel should open automatically
4. Status message: "Generating report..."
5. Wait a few seconds

Expected result: Status shows "Export complete! Saved game_YYYY-MM-DD_test-opponent.pdf and updated season_stats.csv"

6. Navigate to your chosen folder (e.g., Documents/Film Study Reports)
7. Verify two files exist:
   - `game_YYYY-MM-DD_test-opponent.pdf`
   - `season_stats.csv`

8. Open the PDF:
   - Should show box score table
   - Should show advanced stats table
   - Should show event timeline
   - Should show problem areas summary

9. Open the CSV:
   - Should have one row per player (5 rows total for the test roster)
   - Columns should match the spec (date, opponent, player_number, player_name, points, fg_m, fg_a, etc.)

## ✅ SPA Navigation Test

1. While on a YouTube video with the panel open, click to a different video
2. The panel should persist and detect the new video
3. You should be prompted to start a new game (or resume if you navigate back to the same video)

## ✅ Collapse/Expand Test

1. Click the blue header bar at the top of the panel ("Film Study")
2. Panel should collapse (only header visible)
3. Click again
4. Panel should expand back to full view

## ✅ Console Errors Check

1. Open Chrome DevTools (`F12` or right-click → Inspect)
2. Click the **Console** tab
3. Navigate to a YouTube video
4. Start a game and log a few events
5. Check for errors (red text)

Expected result: No errors should appear. Warnings (yellow) are acceptable.

## Common Issues & Fixes

### Panel doesn't appear on YouTube
- Make sure you're on a `youtube.com/watch?v=...` page (not the homepage)
- Refresh the page (`F5`)
- Check `chrome://extensions` — make sure the extension is enabled

### "Error: No folder access" when ending game
- Open the side panel (click extension icon)
- Click "Choose Folder" and select a folder again
- Permission may have been revoked — re-granting fixes this

### Events not logging
- Make sure you've clicked "Start Game" first
- Check that a game session is active (opponent name should be visible in the header)

### Build errors when running `npm run build`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Run `npm run build`

### Icons showing as generic puzzle piece
- This is expected — icons are placeholders
- See `public/ICONS_README.txt` for instructions to create custom icons
- Extension works fine with placeholder icons

## Development Mode (Optional)

For development with hot reload:

```bash
npm run dev
```

This starts Vite's dev server. Any changes to `src/` files will auto-rebuild. You'll need to:
1. Keep the `npm run dev` command running
2. Click the refresh icon on the extension card at `chrome://extensions` after changes

## Uninstall (If Needed)

1. Navigate to `chrome://extensions`
2. Find "Basketball Film Study"
3. Click **Remove**
4. Confirm

Your saved PDFs and CSV remain in the folder you chose — they won't be deleted.

---

## ✅ Verification Complete

If all checklist items pass, the extension is installed correctly and ready to use for real film study sessions.

See [QUICKSTART.md](QUICKSTART.md) for a 5-minute tutorial or [README.md](README.md) for full documentation.
