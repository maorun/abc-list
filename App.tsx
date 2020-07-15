import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { Text } from 'react-native-elements';

const drawer = createDrawerNavigator();

const abcList = createStackNavigator();

class Test extends React.Component {
  public render() {
    return <View>
      <Text>{'nadsf'}</Text>
    </View>;
  }
}

export default class App extends React.Component {
  render() {
    return <NavigationContainer>
      <abcList.Navigator>
        <abcList.Screen name={'Test'} component={Test} />
      </abcList.Navigator>
        {
/*
            'ABC-Listen': {
              screen: createStackNavigator({

                'ABC-Listen': {
                  screen           : List,
                  navigationOptions: (nav) => {
                    const navigation = nav.navigation as any as NavigationScreenProp<any>;
                    return {
                      title     : navigation.state.routeName,
                      headerLeft: () => <NavigationDrawerStructure navigationProps={navigation}/>,
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
                      headerLeft:  () => <NavigationDrawerStructure navigationProps={navigation}/>,
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
        )
        );
          */
        }
    </NavigationContainer>
  }
}
