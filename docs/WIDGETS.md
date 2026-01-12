# Homescreen Widgets - User Guide

## Overview

ABC-List now supports homescreen widgets through Progressive Web App (PWA) technology! This feature provides quick access to your learning statistics, daily challenges, and quick actions directly from your device's homescreen.

## Features

### 1. Statistics Widget

View your learning progress at a glance:

- **Current Streak**: 🔥 Your active daily learning streak
- **Longest Streak**: 🏆 Your all-time best streak
- **Total Points**: ⭐ Accumulated gamification points
- **Level**: 📊 Your current experience level
- **Experience Progress**: Progress bar showing % to next level

### 2. Quick Actions (PWA Shortcuts)

Fast access to commonly used features:

- **Neue ABC-Liste**: Create a new ABC-List instantly
- **Neues KaWa**: Start a new KaWa word association
- **Sokrates Check**: Begin spaced repetition review
- **Stadt-Land-Fluss**: Start a new game round

### 3. Random Quiz

Daily German educational questions:

- New question every day
- Categories: Grundlagen, Methodik, Lerntechnik, Lernstrategie
- Track your daily quiz completion
- Example questions:
  - "Wie viele Buchstaben hat das ABC?"
  - "Welches Birkenbihl-Prinzip nutzt die KaWa-Methode?"
  - "Was bedeutet 'Sokrates' in dieser App?"

### 4. Learning Goals

Track your weekly progress:

- **Lists Created**: Monitor new ABC-Lists this week
- **Words Added**: Track vocabulary growth
- **Sokrates Sessions**: Count spaced repetition reviews
- Customizable weekly targets
- Visual progress indicators

## Installation

### Android (Chrome/Edge)

1. Open ABC-List in Chrome or Edge browser
2. Tap the menu (⋮) → "Add to Home screen"
3. Confirm by tapping "Add"
4. The ABC-List icon appears on your homescreen

### iOS (Safari)

1. Open ABC-List in Safari
2. Tap the Share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. The ABC-List icon appears on your homescreen

### Desktop (Chrome/Edge)

1. Open ABC-List in Chrome or Edge
2. Click the install icon in the address bar (⊕)
3. Click "Install" in the popup
4. ABC-List opens as a standalone app

## Using PWA Shortcuts

### Android

1. Long-press the ABC-List icon on your homescreen
2. A menu appears with 4 quick actions
3. Tap any action to open directly to that feature

### iOS (iOS 13+)

1. Long-press (haptic touch) the ABC-List icon
2. Quick Actions menu appears
3. Tap any action for instant access

### Desktop

1. Right-click the ABC-List icon
2. Hover over the app name
3. Select any shortcut from the submenu

## Widget Data

### Automatic Updates

Widget data updates automatically when:

- You complete learning activities
- You open the ABC-List app
- Background sync runs (Chrome/Edge only)

### Manual Refresh

To manually update widget data:

1. Open the ABC-List app
2. Widget data refreshes immediately
3. Close the app - data remains cached

### Offline Availability

Widget data is cached locally, so you can view:

- Your statistics even when offline
- Quick action shortcuts work offline
- Daily quiz question (current day only)
- Learning goals progress

## Browser Compatibility

### Full Support

- **Chrome (Android & Desktop)**: All features
- **Edge (Android & Desktop)**: All features
- **Safari (iOS 13+)**: All features

### Partial Support

- **Firefox**: Quick actions only (no background sync)
- **Safari (iOS 12 and below)**: Limited PWA support

### Feature Availability

| Feature              | Chrome/Edge | Safari iOS | Firefox |
| -------------------- | ----------- | ---------- | ------- |
| PWA Shortcuts        | ✅          | ✅         | ⚠️      |
| Background Sync      | ✅          | ❌         | ❌      |
| Periodic Sync        | ⚠️          | ❌         | ❌      |
| Offline Widget Data  | ✅          | ✅         | ✅      |
| Statistics Display   | ✅          | ✅         | ✅      |
| Daily Quiz           | ✅          | ✅         | ✅      |
| Learning Goals       | ✅          | ✅         | ✅      |

✅ Full support | ⚠️ Experimental/Limited | ❌ Not supported

## Customization

### Weekly Learning Goals

1. Open ABC-List app
2. Navigate to Settings (⚙️) or Gamification Dashboard
3. Adjust weekly targets:
   - Lists Created (default: 5)
   - Words Added (default: 50)
   - Sokrates Sessions (default: 7)
4. Goals automatically sync to widget

### Quiz Preferences

The daily quiz automatically rotates questions. To mark a quiz as answered:

1. View the quiz question in the widget
2. Open ABC-List app
3. Quiz automatically marks as answered for the day

## Troubleshooting

### Shortcuts Not Appearing

**Solution:**

- Ensure you installed ABC-List as a PWA
- Reinstall: Remove app, then add to homescreen again
- Check browser version (Chrome 84+, Safari iOS 13+)

### Widget Data Not Updating

**Solution:**

- Open ABC-List app to force update
- Check internet connection
- Clear browser cache and reinstall PWA

### Statistics Showing Zero

**Solution:**

- Complete some learning activities
- Ensure gamification is enabled
- Widget reflects real activity data

### Daily Quiz Not Changing

**Solution:**

- Quiz changes at midnight (local time)
- Mark previous quiz as answered
- Open app to trigger new question

## Privacy & Data

### Local Storage

All widget data is stored locally on your device:

- No data sent to external servers
- Privacy-first design
- Full offline functionality

### Data Synchronization

- Widget data syncs with ABC-List app
- Uses existing gamification service
- No additional accounts or login required

## Technical Details

### For Developers

Widget functionality is powered by:

- **WidgetService**: Singleton service (`src/lib/WidgetService.ts`)
- **Service Worker**: Background sync (`public/sw.js`)
- **PWA Manifest**: Shortcuts definition (`public/manifest.json`)

### Storage Keys

```typescript
WIDGET_STORAGE_KEYS = {
  DATA: "widget-data",
  QUIZ_STATE: "widget-quiz-state",
  GOALS: "widget-learning-goals",
};
```

### API Usage

```typescript
import {WidgetService} from "@/lib/WidgetService";

const widgetService = WidgetService.getInstance();
const widgetData = widgetService.getWidgetData();

// Access specific widget data
console.log(widgetData.statistics.currentStreak);
console.log(widgetData.randomQuiz.question);
console.log(widgetData.learningGoals.weekProgress);
```

## Support

For issues or feature requests related to widgets:

1. Check this guide's Troubleshooting section
2. Review AGENTS.md for technical documentation
3. Open an issue on GitHub with detailed description

## Future Enhancements

Planned improvements:

- More quiz categories and questions
- Customizable widget themes
- Additional quick actions
- Widget size variants (small, medium, large)
- Interactive widget controls (where supported)

---

**Enjoy your enhanced learning experience with ABC-List Homescreen Widgets!** 🚀
