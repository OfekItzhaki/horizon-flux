import './src/sentry'; // Sentry init (optional when EXPO_PUBLIC_SENTRY_DSN is set)
import { registerRootComponent } from 'expo';
import * as Sentry from '@sentry/react-native';

import App from './App';

const Root = process.env.EXPO_PUBLIC_SENTRY_DSN ? Sentry.wrap(App) : App;
registerRootComponent(Root);
