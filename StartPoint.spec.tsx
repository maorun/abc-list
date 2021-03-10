//App.spec.tsx
import React from 'react';
import * as renderer from 'react-test-renderer';

import StartPoint from './StartPoint';

describe('<StartPoint />', () => {
  it('should match Snapshot', () => {
    const tree: any = renderer.create(<StartPoint />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
