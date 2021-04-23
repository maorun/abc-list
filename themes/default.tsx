import {StyleProp, ViewStyle, TextStyle} from 'react-native';

interface ThemeStyles {
  [name: string]: StyleProp<ViewStyle | TextStyle>;
}

export const Theme: ThemeStyles = {
  View: {
    marginBottom: 70,
  },
  HeaderText: {
    textAlign: 'center',
  },
  ListView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    margin: 5,
  },
  ButtonShowAbc: {
    width: '85%',
    marginRight: 5,
  },
  ButtonDelete: {width: '10%'},
  ElementMargin: {
    margin: 5,
  },
  LetterListView: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 5,
    justifyContent: 'space-around',
  },
};
