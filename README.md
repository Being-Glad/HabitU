# HabitU

HabitU is a premium, distraction-free habit tracker built with React Native and Expo. It helps you build the identity of the person you want to become through consistent action, visual cues, and friction-free logging.

## Features

- **Direct Touch Widgets**: Interact with your habits directly from your home screen (Grid, List, Weekly, Streak views).
- **Consistency Score**: A sophisticated "Habit Strength" metric that weighs recent activity 1.5x more than older history.
- **Heatmaps**: Visual GitHub-style contribution graphs for every habit.
- **Privacy First**: 100% local data storage by default with Auto-Save persistence. No ads, no tracking.
- **Guest Mode**: Fully functional without creating an account.
- **Flexible Scheduling**: Track daily, weekly, or specific-day habits.

## Getting Started

### Prerequisites

- Node.js
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/HabitU.git
   cd HabitU
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app:
   ```bash
   # For Android
   npx expo run:android

   # For iOS (Mac only)
   npx expo run:ios
   ```

## Troubleshooting

### Widgets are Transparent/Black
If your widgets appear transparent or fail to load:
1. Ensure you have rebuilt the app (`npx expo run:android`) after any native changes.
2. Restart the app to refresh the widget rendering engine.
3. This is often caused by the React Native widget library needing a fresh context.

### Data Loss on Restart
We have implemented a robust **Auto-Save** feature. If you experienced data loss in older versions, it was due to in-memory state not persisting to disk. The current version saves changes instantly to `AsyncStorage`.

## Tech Stack

- **Framework**: React Native (Expo)
- **UI**: Custom components with Lucide Icons
- **Widgets**: `react-native-android-widget`
- **Charts**: `react-native-svg`
- **Storage**: `@react-native-async-storage/async-storage`
- **Date Handling**: `date-fns`
