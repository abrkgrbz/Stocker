# Stocker Mobile App

React Native mobile application for Stocker inventory management system, built with Expo.

## Features

- 📱 Cross-platform (iOS, Android, Web)
- 🔐 Authentication & Authorization
- 📦 Inventory Management
- 💰 Sales Tracking
- 📊 Reports & Analytics
- ⚙️ User Settings
- 🎨 Modern UI with custom theme system
- 🔄 State management with Zustand
- 🚀 Type-safe with TypeScript

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **State Management**: Zustand
- **API Client**: Axios with interceptors
- **Storage**: AsyncStorage
- **Forms**: React Hook Form
- **Validation**: Zod
- **UI**: Custom components with Expo Vector Icons
- **Language**: TypeScript

## Project Structure

```
stocker-mobile/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/      # Common components (Button, Input, etc.)
│   │   ├── auth/        # Auth-specific components
│   │   ├── inventory/   # Inventory components
│   │   ├── sales/       # Sales components
│   │   └── reports/     # Report components
│   ├── screens/         # Screen components
│   │   ├── auth/        # Login, Register
│   │   ├── home/        # Dashboard
│   │   ├── inventory/   # Inventory screens
│   │   ├── sales/       # Sales screens
│   │   ├── reports/     # Report screens
│   │   └── settings/    # Settings screens
│   ├── navigation/      # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── services/        # API and service layers
│   │   ├── api/         # API clients and services
│   │   └── storage/     # AsyncStorage utilities
│   ├── store/           # Zustand stores
│   │   └── authStore.ts
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── constants/       # App constants
│   │   ├── colors.ts
│   │   └── theme.ts
│   ├── config/          # Configuration files
│   │   └── env.ts
│   └── assets/          # Static assets
│       ├── images/
│       ├── fonts/
│       └── icons/
├── App.tsx              # Root component
├── app.json             # Expo configuration
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

1. Navigate to the project directory:
```bash
cd stocker-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
   - Edit `src/config/env.ts` to set your API endpoints

### Running the App

Start the Expo development server:
```bash
npm start
```

#### Run on specific platforms:

- **iOS Simulator** (macOS only):
```bash
npm run ios
```

- **Android Emulator**:
```bash
npm run android
```

- **Web Browser**:
```bash
npm run web
```

- **Physical Device**:
  1. Install Expo Go app from App Store or Google Play
  2. Scan the QR code from the terminal

### Development Commands

```bash
# Start with cache cleared
npm run clear

# Type checking
npm run type-check

# Lint code (when configured)
npm run lint
```

## Configuration

### Environment Variables

Edit `src/config/env.ts`:

```typescript
const ENV = {
  dev: {
    API_URL: 'http://localhost:5000/api',
    API_TIMEOUT: 30000,
    ENABLE_LOGGING: true,
  },
  // ... other environments
};
```

### Theme Customization

Modify `src/constants/colors.ts` and `src/constants/theme.ts` to customize the app's appearance.

## State Management

The app uses Zustand for state management:

- **authStore**: Authentication state and user management
- Add more stores as needed in `src/store/`

## API Integration

API services are located in `src/services/api/`:

- `client.ts`: Axios client with interceptors
- `authService.ts`: Authentication endpoints
- Add more service files as needed

### API Client Features

- Automatic token refresh
- Request/response interceptors
- Error handling
- Configurable timeout
- Development logging

## Navigation Flow

```
AppNavigator
├── AuthNavigator (when not authenticated)
│   ├── LoginScreen
│   └── RegisterScreen
└── MainNavigator (when authenticated)
    ├── HomeScreen (Dashboard)
    ├── InventoryScreen
    ├── SalesScreen
    ├── ReportsScreen
    └── SettingsScreen
```

## Type Safety

All components, services, and stores are fully typed with TypeScript. Type definitions are in `src/types/index.ts`.

## Building for Production

### Android

```bash
expo build:android
```

### iOS

```bash
expo build:ios
```

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android/iOS
eas build --platform android
eas build --platform ios
```

## Troubleshooting

### Metro bundler issues
```bash
npm run clear
```

### Node modules issues
```bash
rm -rf node_modules
npm install
```

### iOS specific issues
```bash
cd ios && pod install && cd ..
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private - All rights reserved

## Support

For issues and questions, contact the development team.
