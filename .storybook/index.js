import { getStorybookUI } from '@storybook/react-native';

import './storybook.requires';

const StorybookUIRoot = getStorybookUI({
  initialSelection: { kind: 'Design System/DataTable', name: 'Default' },
});

export default StorybookUIRoot;