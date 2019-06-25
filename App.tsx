import React  from 'react';
import { createStackNavigator, createAppContainer, createDrawerNavigator } from 'react-navigation';
import { NavigationDrawerStructure } from './components/NavigationDrawerStructure';
import { List } from './components/List/List';
import { ListItem } from './components/List/ListItem';

const AppContainer = createAppContainer(createDrawerNavigator({
    'ABC-Listen'   : {
      screen: createStackNavigator({
        'ABC-Listen': {
          screen           : List,
          navigationOptions: ({ navigation }) => {
            return {
              title     : navigation.state.routeName,
              headerLeft: <NavigationDrawerStructure navigationProps={navigation}/>,
            };
          },
        },
        'ListItem' : {
          screen: ListItem,
          navigationOptions: ({ navigation }) => {
            let item = navigation.getParam('item');
            return {
              title     : item,
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