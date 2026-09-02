# Court-Based Event Tracking System - Design Document

## Overview

Transform the Basketball Film Study extension to use an interactive court diagram as the primary interface for logging ALL events (shots, turnovers, steals, blocks, fouls, assists, rebounds). This enables location-based analytics and heat maps.

## Core Concept

**Current Flow:**
1. Click event button (e.g., "Shot")
2. Fill out form (player, make/miss)
3. Submit

**New Flow:**
1. Click event button (e.g., "Shot", "Turnover", "Steal")
2. **Court diagram appears** with clickable zones
3. Click zone on court (e.g., "Corner 3 Left")
4. Event-specific options appear (make/miss for shots, etc.)
5. Select player(s)
6. Optional: Add tags (e.g., "baseline_drive", "help_defense")
7. Submit → Event logged with location data

## Data Model Changes

### Update GameEvent Type

```typescript
// src/types/index.ts

export type CourtZone =
  | 'paint'
  | 'midrange_left'
  | 'midrange_right'
  | 'corner3_left'
  | 'corner3_right'
  | 'wing3_left'
  | 'wing3_right'
  | 'top3'
  | 'baseline_left'
  | 'baseline_right'
  | 'unknown';

export type EventTag =
  | 'baseline_drive'
  | 'help_defense'
  | 'transition'
  | 'fast_break'
  | 'pick_and_roll'
  | 'isolation'
  | 'off_screen'
  | 'putback'
  | 'and1'
  | 'technical'
  | 'intentional';

export interface GameEvent {
  id: string;
  timestampSec: number;
  wallClock: string;
  eventType: EventType;
  primaryPlayerId?: string;
  secondaryPlayerId?: string;
  opponentNumber?: string;
  onCourtPlayerIds: string[];
  comment: string;

  // NEW FIELDS
  location?: CourtZone;           // Where the event happened
  shotResult?: 'make' | 'miss';   // For shots
  tags?: EventTag[];              // Contextual tags
}
```

## Component Architecture

### 1. CourtDiagram Component

**File:** `src/components/CourtDiagram.tsx`

**Props:**
```typescript
interface CourtDiagramProps {
  onZoneClick: (zone: CourtZone) => void;
  selectedZone?: CourtZone;
  highlightZones?: CourtZone[];  // For showing hot/cold zones
  events?: GameEvent[];          // For showing event markers
  mode: 'select' | 'view';       // Interactive vs display-only
}
```

**Features:**
- SVG-based basketball court (half-court view)
- Clickable zones with hover effects
- Visual feedback for selected zone
- Can display event markers (makes/misses/fouls/etc)
- Responsive sizing to fit panel

**Zone Definitions:**
```typescript
const COURT_ZONES = {
  paint: { x: 200, y: 350, width: 160, height: 190 },
  midrange_left: { x: 50, y: 250, width: 150, height: 200 },
  midrange_right: { x: 360, y: 250, width: 150, height: 200 },
  corner3_left: { x: 20, y: 480, width: 100, height: 80 },
  corner3_right: { x: 440, y: 480, width: 100, height: 80 },
  wing3_left: { x: 60, y: 150, width: 120, height: 100 },
  wing3_right: { x: 380, y: 150, width: 120, height: 100 },
  top3: { x: 200, y: 50, width: 160, height: 100 },
  baseline_left: { x: 50, y: 500, width: 150, height: 40 },
  baseline_right: { x: 360, y: 500, width: 150, height: 40 },
};
```

### 2. EventForm Component (Enhanced)

**File:** `src/panel/EventForm.tsx` (modify existing)

**New Flow:**
```typescript
interface EventFormState {
  step: 'zone' | 'details' | 'player' | 'tags';
  selectedZone?: CourtZone;
  shotResult?: 'make' | 'miss';
  selectedTags: EventTag[];
}
```

**UI Sequence:**

**Step 1: Zone Selection**
```
┌─────────────────────────────┐
│   Where did this happen?    │
│                             │
│   [CourtDiagram Component]  │
│   (click a zone)            │
│                             │
└─────────────────────────────┘
```

**Step 2: Event Details** (event-specific)

For **Shots:**
```
┌─────────────────────────────┐
│   Shot in: Corner 3 Left    │
│                             │
│   [Make ✓]    [Miss ✗]      │
│                             │
└─────────────────────────────┘
```

For **Turnovers:**
```
┌─────────────────────────────┐
│  Turnover in: Paint          │
│                             │
│  Type:                      │
│  [Travel] [Bad Pass]        │
│  [Offensive Foul] [Other]   │
│                             │
└─────────────────────────────┘
```

For **Steals/Blocks:**
```
┌─────────────────────────────┐
│   Steal in: Wing 3 Left     │
│                             │
│   (Select player below)     │
│                             │
└─────────────────────────────┘
```

**Step 3: Player Selection**
```
┌─────────────────────────────┐
│   Our Player:               │
│   [Dropdown: Roster]        │
│                             │
│   Opponent #: [___]         │
│   (optional)                │
└─────────────────────────────┘
```

**Step 4: Tags** (optional, advanced)
```
┌─────────────────────────────┐
│   Add context tags:         │
│   ☐ Baseline Drive          │
│   ☐ Help Defense            │
│   ☐ Transition              │
│   ☐ Pick and Roll           │
│                             │
│   [Skip]  [Add & Submit]    │
└─────────────────────────────┘
```

### 3. TagManager Component

**File:** `src/components/TagManager.tsx`

```typescript
interface TagManagerProps {
  eventType: EventType;
  selectedTags: EventTag[];
  onTagsChange: (tags: EventTag[]) => void;
}
```

Shows relevant tags based on event type:
- **Shots:** transition, fast_break, pick_and_roll, isolation, off_screen, putback, and1
- **Defensive events:** help_defense, baseline_drive
- **Fouls:** technical, intentional

### 4. EventMarker Component

**File:** `src/components/EventMarker.tsx`

Small visual markers to display on court diagrams:

```typescript
interface EventMarkerProps {
  event: GameEvent;
  size?: 'small' | 'medium' | 'large';
}
```

**Visual Symbols:**
- ✓ (green) = Made shot
- ✗ (red) = Missed shot
- 🛡️ = Block
- 💪 = Steal
- ⚠️ = Foul
- 🔄 = Turnover
- 🎯 = Assist
- 🏀 = Rebound

## Timeline Visualization Enhancement

**Current:** Simple list of events with timestamps

**Enhanced:** Show mini court diagram for each event

```
Timeline:
┌─────────────────────────────┐
│ 2:34 - Shot by #23          │
│  ┌───┐                      │
│  │ ✓ │ Corner 3 Left        │
│  └───┘ +3 pts               │
├─────────────────────────────┤
│ 2:15 - Steal by #15         │
│  ┌───┐                      │
│  │💪 │ Wing Left             │
│  └───┘                      │
├─────────────────────────────┤
│ 1:58 - Turnover by #10      │
│  ┌───┐                      │
│  │🔄 │ Paint                 │
│  └───┘ Bad pass             │
└─────────────────────────────┘
```

## Analytics Unlocked

With location data for all events, you can generate:

### Team Offense Analytics
- **Shot selection heat map:** Where do we shoot most?
- **Efficiency by zone:** Which zones have highest FG%?
- **Assist origin map:** Where do assists come from?
- **Turnover hot spots:** Where do we turn it over most?
- **Offensive tendencies:** Do we attack paint? Live at 3PT line?

### Team Defense Analytics
- **Opponent shot chart:** Where do we allow shots?
- **Defensive weak zones:** Where is opponent FG% highest?
- **Steal/block locations:** Where do we get stops?
- **Foul trouble zones:** Where do we foul most?
- **Paint protection:** How well do we defend the rim?

### Player-Specific Analytics
- **Individual shot charts:** Each player's hot/cold zones
- **Defensive assignments:** Where does player allow points?
- **Impact zones:** Where does player make plays (steals/blocks)?
- **Turnover tendencies:** Where does player lose ball?

### Advanced Insights
- **Lineup efficiency by zone:** Do certain lineups score better in paint? From 3?
- **Matchup analysis:** How do we perform vs opponent in specific zones?
- **Game flow:** Visualize how shot locations change throughout game
- **Scouting report generation:** Auto-generate opponent tendencies

## Implementation Phases

### Phase 1: Core Court Diagram (Immediate)
- [ ] Create `CourtDiagram.tsx` with clickable SVG zones
- [ ] Update `GameEvent` type with `location`, `shotResult`, `tags` fields
- [ ] Modify `EventForm.tsx` to use court diagram for shot events
- [ ] Test shot logging with location data

### Phase 2: Expand to All Events (Week 1)
- [ ] Add court diagram to all event types
- [ ] Create event-specific detail steps (make/miss, turnover type, etc.)
- [ ] Implement tag system with `TagManager` component
- [ ] Update storage schema (backward compatible)

### Phase 3: Timeline Visualization (Week 1)
- [ ] Create `EventMarker` component with symbols
- [ ] Update `Timeline` component to show mini court diagrams
- [ ] Add zone labels to event list items
- [ ] Implement click-to-filter by zone

### Phase 4: Basic Analytics (Week 2)
- [ ] Create `src/lib/analytics.ts` with zone aggregation functions
- [ ] Add team shot chart to export (show all makes/misses by zone)
- [ ] Calculate shooting % by zone
- [ ] Show most efficient zones in PDF export

### Phase 5: Advanced Analytics (Week 3)
- [ ] Player-specific shot charts
- [ ] Defensive heat maps
- [ ] Tag-based filtering ("Show all transition shots")
- [ ] Zone comparison (our offense vs opponent defense in same zone)

### Phase 6: AI Report Generation (Week 4)
- [ ] Export data format for Claude analysis
- [ ] Integrate with `FILM_STUDY_REPORT_GENERATOR.md` prompts
- [ ] Auto-generate insights ("Attack corner 3s more, 75% FG%")
- [ ] PDF export with visual court diagrams

## UI/UX Considerations

### Court Diagram Design
- **Size:** ~400x560px to fit in side panel
- **Colors:**
  - Court: Light wood (#D4A574)
  - Lines: White
  - Zones: Transparent, highlight on hover (#3498db20)
  - Selected: Solid blue (#3498db)
- **Accessibility:** Large click targets (min 80x80px per zone)
- **Responsive:** Scale based on panel width

### Mobile/Small Screen
- Stack court diagram vertically
- Larger tap targets for touch
- Zoom option for detailed view

### Performance
- Cache court SVG as component
- Lazy load event markers (only visible events)
- Debounce zone hover effects

### User Feedback
- Zone highlights on hover
- Click animation (brief pulse)
- Success confirmation after event submit
- Undo shows which zone/event was removed

## Data Export Format

Update export to include location data:

```json
{
  "game": { /* ... */ },
  "roster": { /* ... */ },
  "analytics": {
    "teamOffense": {
      "byZone": {
        "paint": { "fga": 12, "fgm": 8, "points": 16, "assists": 3 },
        "corner3_left": { "fga": 5, "fgm": 3, "points": 9 }
      }
    },
    "teamDefense": {
      "byZone": {
        "paint": { "oppFga": 15, "oppFgm": 10, "ptsAllowed": 20, "blocks": 2 }
      }
    },
    "playerStats": [
      {
        "playerId": "uuid",
        "offense": {
          "byZone": { /* ... */ }
        },
        "defense": {
          "byZone": { /* ... */ }
        }
      }
    ]
  }
}
```

## Testing Strategy

1. **Unit Tests:**
   - Zone click detection accuracy
   - Event data serialization with location
   - Analytics calculations (FG% by zone)

2. **Integration Tests:**
   - Full event flow: click zone → select details → submit
   - Timeline rendering with location markers
   - Export includes location data

3. **User Testing:**
   - Can users quickly select correct zones?
   - Is multi-step form intuitive?
   - Do visual markers make sense?

## Future Enhancements

- **Opponent tracking:** Log opponent events with same court diagram
- **Live shot comparison:** Side-by-side our shots vs opponent
- **Historical trends:** Compare game-to-game shot selection
- **Practice mode:** Track practice sessions for player development
- **Video playback integration:** Click event marker → jump to timestamp
- **AR overlay:** Project shot chart over live video (advanced)

---

**Next Steps:** Approve design, then start with Phase 1 (Core Court Diagram for shots).
