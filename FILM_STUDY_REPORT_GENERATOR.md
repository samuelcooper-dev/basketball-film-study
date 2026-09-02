# Film Study Visual Report Generator

## Purpose
This prompt enables Claude to analyze basketball film study data exported from the Basketball Film Study Chrome Extension and generate comprehensive visual reports with court diagrams, player statistics, and team analytics.

## Input Data Format

The user will provide JSON data exported from a game session containing:

```json
{
  "game": {
    "id": "uuid",
    "date": "YYYY-MM-DD",
    "opponentName": "Team Name",
    "videoUrl": "youtube.com/watch?v=...",
    "events": [
      {
        "id": "uuid",
        "timestampSec": 123.45,
        "eventType": "shot|assist|turnover|steal|block|foul|rebound",
        "primaryPlayerId": "uuid",
        "secondaryPlayerId": "uuid or null",
        "opponentNumber": "string or null",
        "location": "paint|midrange_left|midrange_right|corner3_left|corner3_right|wing3_left|wing3_right|top3",
        "result": "make|miss (for shots)",
        "tags": ["baseline_drive", "help_defense", "transition", etc],
        "onCourtPlayerIds": ["uuid1", "uuid2", ...],
        "comment": "text"
      }
    ]
  },
  "roster": {
    "teamName": "Team Name",
    "players": [
      { "id": "uuid", "number": "23", "name": "Player Name" }
    ]
  }
}
```

## Report Sections to Generate

### 1. Team Offensive Report

**Shot Chart:**
- ASCII or Unicode basketball court diagram
- Mark shot locations with symbols:
  - ✓ = Make
  - ✗ = Miss
  - Color code by zone efficiency

**Zone Statistics:**
```
Zone               | FGA | FGM | FG%  | Points
-------------------|-----|-----|------|-------
Paint              | 12  | 8   | 66.7%| 16
Midrange Left      | 5   | 2   | 40.0%| 4
Midrange Right     | 4   | 1   | 25.0%| 2
Corner 3 Left      | 3   | 2   | 66.7%| 6
Corner 3 Right     | 2   | 1   | 50.0%| 3
Wing 3 Left        | 6   | 3   | 50.0%| 9
Wing 3 Right       | 4   | 2   | 50.0%| 6
Top 3              | 8   | 4   | 50.0%| 12
-------------------|-----|-----|------|-------
TOTAL              | 44  | 23  | 52.3%| 58
```

**Offensive Tendencies:**
- Most frequent shot zones
- Best efficiency zones
- Assist locations (where assists led to baskets)
- Turnover locations (where turnovers happened)
- Transition vs half-court efficiency

### 2. Team Defensive Report

**Defensive Chart:**
- Court diagram showing where opponent scored
- Mark opponent shot locations allowed:
  - 🔴 = Opponent made shot (points allowed)
  - ⚫ = Opponent missed shot (defensive stop)
  - 🛡️ = Block location
  - 💪 = Steal location

**Defensive Zone Statistics:**
```
Zone               | Opp FGA | Opp FGM | Opp FG% | Pts Allowed | Stops
-------------------|---------|---------|---------|-------------|------
Paint              | 15      | 10      | 66.7%   | 20          | 5
Midrange Left      | 3       | 1       | 33.3%   | 2           | 2
Corner 3 Left      | 4       | 2       | 50.0%   | 6           | 2
...
```

**Defensive Weaknesses:**
- Zones with highest opponent FG%
- Most points allowed by zone
- Common tags (e.g., "baseline_drive", "help_defense_late")

### 3. Individual Player Offensive Reports

For each player who played significant minutes, generate:

**[Player Name] (#[Number]) - Offensive Impact**

**Shot Chart:**
```
        [TOP 3]
          ✓✗✓

 [WING3L]     [WING3R]
   ✓✗           ✓✓

[C3L]           [C3R]
 ✓                ✗

    [PAINT]
     ✓✓✓✓
     ✓✗✓
```

**Individual Stats:**
```
Category        | Count | Details
----------------|-------|------------------
FGM-FGA         | 8-15  | 53.3%
Points          | 18    |
2PT FGM-FGA     | 5-8   | 62.5%
3PT FGM-FGA     | 3-7   | 42.9%
Assists         | 4     | Locations: Paint (2), Wing3 (2)
Turnovers       | 2     | Locations: Paint (1), Midrange (1)
Rebounds        | 3     | Off: 1, Def: 2
```

**Hot Zones:** Zones with >50% shooting
**Cold Zones:** Zones with <40% shooting

**Offensive Impact Score:** (Points + Assists*2 - Turnovers*2) = [Calculate]

### 4. Individual Player Defensive Reports

**[Player Name] (#[Number]) - Defensive Impact**

**Defensive Chart:**
```
When [Player] was on court:

Opponent Shots Allowed:
        [TOP 3]
          🔴⚫

 [WING3L]     [WING3R]
   🔴           ⚫

    [PAINT]
     🔴🔴⚫

Defensive Plays:
  🛡️ Blocks at Paint (2)
  💪 Steals at Wing (1)
```

**Defensive Stats:**
```
Category              | Count | Notes
----------------------|-------|------------------
Opponent FGM-FGA      | 5-10  | 50.0% (while on court)
Points Allowed        | 12    |
Steals                | 3     | Locations: Wing (2), Paint (1)
Blocks                | 2     | All in paint
Fouls                 | 4     | Paint (2), Perimeter (2)
Defensive Rebounds    | 5     |
```

**Defensive Weaknesses:**
- Zones where opponent shot >60% when player was on court
- Foul-prone zones

**Defensive Impact Score:** (Steals*2 + Blocks*2 + DefReb - Fouls - PointsAllowed/4) = [Calculate]

### 5. Team Summary Dashboard

**Game Overview:**
- Final Score Estimate (based on makes)
- Shooting Efficiency: Team vs Opponent
- Turnover Differential
- Rebounding (if tracked)

**Key Insights:**
1. Strongest offensive zone: [Zone with best FG%]
2. Weakest defensive zone: [Zone where opponent shot best]
3. Top offensive player: [Player with highest impact score]
4. Top defensive player: [Player with highest defensive impact score]
5. Most efficient lineup: [5-man lineup with best +/- if calculable]

**Recommendations:**
- Attack [zone] more often (high efficiency, low volume)
- Improve defense in [zone] (opponent shooting well)
- Reduce turnovers in [zone] (high turnover frequency)
- Player development focus: [Player] needs work on [specific zone/skill]

## Court Diagram Templates

### ASCII Court (Top View - Half Court)
```
                    [TOP OF KEY / TOP 3]
                          _____
         [WING 3L]       /     \       [WING 3R]
                       /   🏀   \
        ______________|    KEY   |______________
       |              |  (PAINT) |              |
[C3L]  |              |__________|              |  [C3R]
       |                                        |
       |________________________________________| BASELINE
```

### Unicode Enhanced Court
```
                    ╔═════════╗
          ╱───╲    ║  TOP 3  ║    ╱───╲
    WING3L     ╲   ╚═════════╝   ╱     WING3R
         ╲      ╲               ╱      ╱
    ┌─────┴──────╲─────────────╱──────┴─────┐
    │             ╲           ╱             │
C3L │              ┌─────────┐              │ C3R
    │              │ PAINT   │              │
    │              │   🏀    │              │
    │              └─────────┘              │
    └────────────────────────────────────────┘
              BASELINE
```

## Usage Instructions

1. **User provides game data:** Either paste JSON export or describe the game file location
2. **Claude analyzes data:** Parse events, aggregate by player, zone, and event type
3. **Generate visualizations:** Create court diagrams with appropriate symbols
4. **Calculate statistics:** Compute shooting percentages, impact scores, zone efficiency
5. **Provide insights:** Identify patterns, strengths, weaknesses
6. **Format report:** Use markdown tables, diagrams, and clear section headers

## Advanced Analytics (Optional)

If data permits, also calculate:
- **Plus/Minus by lineup:** Score differential when specific 5-man units are on court
- **Shot selection:** First shot of possession vs late shot clock
- **Transition efficiency:** Fast break points vs half-court
- **Assist networks:** Who assists whom most frequently
- **Defensive matchups:** Performance against specific opponent numbers
- **Momentum analysis:** Scoring runs and how they correlate with lineup changes
- **Time-based patterns:** Performance by game quarter/half

## Example Prompts for User

To generate a report, the user can say:
- "Generate a full visual report from this game data: [paste JSON]"
- "Analyze player #23's offensive performance from this game"
- "Show me our defensive weaknesses by zone"
- "Create shot charts for all players"
- "Compare our paint scoring vs opponent paint defense"

## Output Format

Claude should produce a comprehensive markdown report with:
- Clear section headers (##, ###)
- ASCII/Unicode court diagrams
- Markdown tables for statistics
- Bullet-point insights
- **Bold** emphasis for key findings
- Color emoji symbols (✓✗🔴⚫🛡️💪) for visual clarity

The report should be ready to copy-paste into a markdown viewer or save as a .md file.

## Data Quality Notes

- If location data is missing for some events, note it in a "Data Gaps" section
- If small sample size (<10 events), add disclaimer about statistical significance
- Suggest which events/players need more tracking for better insights

---

**Ready to analyze!** Paste your Basketball Film Study game export JSON and specify which sections you want generated.
