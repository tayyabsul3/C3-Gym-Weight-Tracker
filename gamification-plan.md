# Gamification Plan — LiftLog

## Vision
Turn workout tracking into a rewarding progression system. Every rep, set, and logged session earns XP and coins. Coins become currency for a virtual shop with character outfits, themes, and cosmetics.

---

## Phase 1: Core Systems (MVP)

### XP System
| Action | XP Gained |
|---|---|
| Log an exercise (weight or reps) | +10 XP |
| Log a new Personal Record (PR) | +50 XP |
| Log all 6 days in a week (Mon-Sun) | +100 XP |
| Login streak milestone (7, 14, 30 days) | +25 / +50 / +100 |
| First log of the day | +5 XP |

### Level System
| Level | XP Needed |
|---|---|
| 1 (Beginner) | 0 |
| 2 | 200 |
| 3 | 500 |
| 4 | 1000 |
| 5 | 1800 |
| 6 | 2800 |
| 7 | 4000 |
| 8 | 5500 |
| 9 | 7500 |
| 10 (Elite) | 10000 |
| +1 each level | previous + 1000 |

Formula: `xpForLevel(lvl) = lvl * (lvl - 1) * 50`

### Coin Economy (Points)
| Action | Coins |
|---|---|
| Log an exercise | +5 coins |
| Personal Record | +25 coins |
| Weekly streak (all 6 days) | +50 coins |
| Level up | +100 coins |

### Virtual Shop (Future)
- Character outfits (hats, shirts, accessories)
- Theme colors (unlock accent color presets)
- Special badge frames
- Title/Flair shown next to name in drawer

### Streaks
- Consecutive days logged (any exercise)
- Show streak count in drawer and/or header
- `🔥 12-day streak`

### Personal Records
- Auto-detect: weight PR, reps PR, volume PR per exercise
- Show `🏆 PR!` toast with confetti effect on new record
- Display in history pills with a crown icon

---

## Phase 2: UI Integration

### Drawer Profile Card (Updated)
```
[Trainee] Lvl 4
████████░░░░░░░░ 400 / 1000 XP
🪙 250 coins  🔥 6 day streak
```

### Toast Enhancements
- PR detection triggers special toast: `🏆 New PR: 25kg! +50 XP 🪙25`
- Level up triggers: `🎉 Level 4! +100 XP 🪙100`

### Progress Page Additions
- XP graph over time
- Total coins earned
- Achievement showcase (badge grid)

### Achievements Gallery
Tab or section with locked/unlocked achievements:
| Achievement | Requirement | Reward |
|---|---|---|
| First Steps | Log your first exercise | 50 XP, 🪙25 |
| Consistency I | 7-day streak | 100 XP, 🪙50 |
| Consistency II | 30-day streak | 500 XP, 🪙250 |
| Consistency III | 90-day streak | 2000 XP, 🪙1000 |
| Volume I | 1000 total volume on one exercise | 100 XP, 🪙50 |
| Volume II | 10000 total volume on one exercise | 500 XP, 🪙250 |
| Iron Will | Log all 6 days in a week | 200 XP, 🪙100 |
| Comeback Kid | Log after 7+ days missed | 75 XP, 🪙30 |
| Level 5 | Reach level 5 | 250 XP, 🪙150 |
| Level 10 | Reach level 10 | 1000 XP, 🪙500 |
| Explorer | Log every day of the week at least once | 300 XP, 🪙150 |

---

## Phase 3: Virtual Shop (Down the Road)

### Shop UI
- New page or modal: "🛒 Shop"
- Categories: Outfits, Themes, Titles, Badges

### Virtual Character
- Simple pixel/minimal avatar in drawer
- Unlockable hats, shirts, glasses, backgrounds
- Cosmetic only — no gameplay advantage

### Theme Unlocks
- Buy alternate accent colors: neon pink, gold, ice blue
- Buy dark/light variants
- Buy card border styles

### Pricing
- Basic items: 100-500 coins
- Rare items: 1000-3000 coins
- Legendary: 5000+ coins

---

## Phase 4: Social (Future)

- Share weekly stats as image
- Leaderboard (optional, local only — compare to your past self)
- Workout streak badges on social share cards

---

## Technical Notes

### State Additions (`state.gamification`)
```json
{
  "xp": 0,
  "coins": 0,
  "level": 1,
  "streak": 0,
  "lastLogDate": "2026-06-17",
  "prs": {},
  "achievements": [],
  "inventory": [],
  "equipped": {}
}
```

### PR Detection
- Compare current log value against all previous logs for same exercise key
- Track per exercise: `{weight: 25, reps: 12, volume: 300}`
- Only trigger PR toast once per session per exercise

### Streak Logic
- Streak = consecutive calendar days with at least one log
- If today is logged, streak continues
- If yesterday logged, streak continues
- If missed a day since last log → streak resets to 1
- Display: fire emoji + number

### XP Persistence
- Save `state.gamification` on every XP/coin change
- Load on app init
- No migration needed — new field defaults to 0
