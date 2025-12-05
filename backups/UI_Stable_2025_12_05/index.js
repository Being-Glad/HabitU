import { registerRootComponent } from 'expo';
import App from './App';
import { registerWidgetTask } from './src/widget/widgetTask';

// Register the widget task
registerWidgetTask();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
