import { registerRootComponent } from 'expo';
const storybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';
const Root = storybookEnabled
  ? require('./.storybook/index').default
  : require('./App').default;
registerRootComponent(Root);