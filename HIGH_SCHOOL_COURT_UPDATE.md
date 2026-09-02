# High School Court Implementation

## Court Dimensions Updated

The basketball court has been updated from NBA to **HIGH SCHOOL** regulation dimensions.

### Dimension Changes

| Feature | NBA (Previous) | High School (New) |
|---------|---------------|-------------------|
| **Full Court Length** | 94 feet | 84 feet |
| **Half Court Length** | 47 feet (470 units) | **42 feet (420 units)** |
| **Court Width** | 50 feet | 50 feet (same) |
| **Paint Width** | 16 feet (160 units) | **12 feet (120 units)** |
| **3-Point Line** | 23.75 feet | **19 feet 9 inches (19.75 feet)** |
| **Free Throw Distance** | 19 feet from baseline | 15 feet from baseline |

### ViewBox Updated
- Previous: `viewBox="0 0 500 470"`
- **New: `viewBox="0 0 500 420"`** (shorter court)

## Zone Layout - Standard Shot Chart System

The zones have been redesigned to follow standard NBA shot chart methodology, adapted for high school dimensions.

### Zone Breakdown (10 Total Zones)

#### Inside the Arc (4 zones)
1. **Paint** - Restricted area + rest of key (12 ft wide)
2. **Mid-Range Left** - Between paint and 3pt arc (left side)
3. **Mid-Range Right** - Between paint and 3pt arc (right side)
4. **Baseline Left** - Short corner inside 3pt (left)
5. **Baseline Right** - Short corner inside 3pt (right)

#### Three-Point Zones (5 zones)
6. **Corner 3 Left** - Below the break on left (shortest 3pt distance)
7. **Corner 3 Right** - Below the break on right
8. **Wing 3 Left** - Left wing above the break
9. **Wing 3 Right** - Right wing above the break
10. **Top 3** - Top of key beyond the arc

### Zone Centers Updated

All zone center coordinates recalculated for high school court (420 units tall):

```typescript
paint: { x: 250, y: 305 }           // Center of 12ft paint
midrange_left: { x: 105, y: 270 }   // Left mid-range area
midrange_right: { x: 395, y: 270 }  // Right mid-range area
corner3_left: { x: 30, y: 320 }     // Left corner 3
corner3_right: { x: 470, y: 320 }   // Right corner 3
wing3_left: { x: 155, y: 200 }      // Left wing 3
wing3_right: { x: 345, y: 200 }     // Right wing 3
top3: { x: 250, y: 100 }            // Top of key 3
baseline_left: { x: 140, y: 320 }   // Left baseline
baseline_right: { x: 360, y: 320 }  // Right baseline
```

## Visual Theme - Dark Fantasy

Maintained the dark fantasy aesthetic with:
- ⚫ **Black stone floor** with mystical texture
- 💜 **Purple court lines** with glowing effect
- 🔴 **Crimson red 3-point arc** (19'9" high school spec)
- 🟡 **Golden rim** with amber glow
- 💎 **Purple paint shading** with mystical gradient

## Shot Chart Reference

This layout follows the standard shot chart methodology used by:
- [NBA Shot Charts Explained - 48 Minutes](https://48min.net/articles/nba-shot-charts-explained-how-to-read)
- [Reading Shot Charts Like a Pro - Scouting4U](https://basketball.scouting4u.com/blog/reading-shot-charts-like-a-pro-zone-analysis)

The zones enable accurate tracking of shooting efficiency and shot selection patterns across different areas of the court.

## Files Modified

1. **src/components/CourtDiagram.tsx** - Updated to high school dimensions & shot chart zones
2. **src/components/CourtSVG.ts** - Updated zone center coordinates

## Build Status

✅ **Extension builds successfully**
✅ **High school dimensions implemented**
✅ **Shot chart zones configured**
✅ **Zone centers recalculated**
✅ **Dark fantasy theme preserved**

## Usage

The court now accurately represents a high school basketball court with proper:
- 19'9" three-point line (vs NBA 23.75')
- 12-foot paint (vs NBA 16')
- 42-foot half court (vs NBA 47')
- Standard shot chart zone layout for analytics

All event tracking and zone selection will now use high school court specifications!
