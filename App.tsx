import * as React from 'react';
import { createAppContainer, NavigationScreenProp } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { NavigationDrawerStructure } from './components/NavigationDrawerStructure';
import { List } from './components/List/List';
import { ListItem } from './components/List/ListItem';
import { Kawa } from './components/Kawa/Kawa';
import { KawaItem } from './components/Kawa/KawaItem';
import { NewItemWithSaveKey } from './components/NewStringItem';

const AppContainer = createAppContainer(createDrawerNavigator({
    'ABC-Listen': {
      screen: createStackNavigator({
        'ABC-Listen': {
          screen           : List,
          navigationOptions: (nav) => {
            const navigation = nav.navigation as any as NavigationScreenProp<any>;
            return {
              title     : navigation.state.routeName,
              headerLeft: <NavigationDrawerStructure navigationProps={navigation}/>,
            };
          },
        },
        'ListItem'  : {
          screen           : ListItem,
          navigationOptions: (nav) => {
            const navigation = nav.navigation as any as NavigationScreenProp<any>;
            let item         = navigation.getParam('item');
            return {
              title: item,
            };
          },
        },
      }),
    },
    'Kawa'      : {
      screen: createStackNavigator({
        'Kawa'    : {
          screen           : Kawa,
          navigationOptions: (nav) => {
            const navigation = nav.navigation as any as NavigationScreenProp<any>;
            return {
              title     : navigation.state.routeName,
              headerLeft: <NavigationDrawerStructure navigationProps={navigation}/>,
            };
          },
        },
        'KawaItem': {
          screen           : KawaItem,
          navigationOptions: (nav) => {
            const navigation             = nav.navigation as any as NavigationScreenProp<any>;
            let item: NewItemWithSaveKey = navigation.getParam('item');
            return {
              title: item.text,
            };
          },
        },
      }),
    },
  },
));

export default class App extends React.Component {
  render() {
    return <AppContainer/>;
  }
}
