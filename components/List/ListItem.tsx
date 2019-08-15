import React, { Component } from 'react';
import { AsyncStorage, ScrollView, FlatList, View } from 'react-native';
import { NavigationScreenProp } from "react-navigation";
import { Letter } from './Letter';

export class ListItem extends Component {
  public props: {
    navigation: NavigationScreenProp<any, {item: string}>;
  };

  public static cacheKey = 'abcList-';

  public state = {};

  public getCacheKey(): string {
    const { navigation } = this.props;
    return ListItem.cacheKey + navigation.getParam('item');
  }

  public render() {

    const abcList = [];
    for (let i = 0; i < 26; i++) {
      let char = String.fromCharCode(97 + i);
      let item = {
        char : char,
      };
      abcList.push(item);
    }

    return (
      <ScrollView>
          <FlatList keyExtractor={((item) => item.char)} data={abcList} renderItem={({ item }) =>
            <View key={item.char} style={{marginBottom: 10}}>
              <Letter letter={item.char} cacheKey={this.getCacheKey()} />
            </View>
          }/>
      </ScrollView>
    );
  }
}
