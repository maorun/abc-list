import {StatusBar} from 'expo-status-bar';
import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {List} from './components/List/List';
import {ListItem} from './components/List/ListItem';
import {Kawa} from './components/Kawa/Kawa';
import {KawaItem} from './components/Kawa/KawaItem';

const abcList = createBottomTabNavigator();
const list = createStackNavigator();
const kawa = createStackNavigator();

function ListNavigation() {
  return (
    <list.Navigator>
      <list.Screen
        name="list"
        component={List}
        options={{title: 'ABC-Listen'}}
      />
      <list.Screen name="listItem" component={ListItem} />
    </list.Navigator>
  );
}

function KawaNavigation() {
  return (
    <kawa.Navigator>
      <kawa.Screen name="kawa" component={Kawa} options={{title: 'Kawa'}} />
      <kawa.Screen name="kawaItem" component={KawaItem} />
    </kawa.Navigator>
  );
}
// have to rename from App to StartPoint because of tests
export default class StartPoint extends Component {
  public render() {
    return (
      <NavigationContainer>
        <abcList.Navigator initialRouteName="kawa">
          <abcList.Screen name={'list'} component={ListNavigation} />
          <abcList.Screen name={'kawa'} component={KawaNavigation} />
        </abcList.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    );
  }
}
