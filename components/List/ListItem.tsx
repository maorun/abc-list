import * as React from 'react';
import {Component} from 'react';
import {ScrollView, FlatList, View} from 'react-native';
import {Letter} from './Letter';
import {StackNavigationProp} from '@react-navigation/stack';

export class ListItem extends Component {
  public props!: {
    navigation: StackNavigationProp<any>;
    route: {
      name: string;
      params: {
        item: string;
      };
    };
    item: string;
  };

  public static cacheKey = 'abcList-';

  public componentDidMount() {
    this.props.navigation.setOptions({
      title: 'ABC-Liste für ' + this.props.route.params.item,
    });
  }

  public getCacheKey(): string {
    return ListItem.cacheKey + this.props.route.params.item;
  }

  public render() {
    const abcList = [];
    for (let i = 0; i < 26; i++) {
      let char = String.fromCharCode(97 + i);
      let item = {
        char: char,
      };
      abcList.push(item);
    }

    return (
      <ScrollView>
        <FlatList
          keyExtractor={(item) => item.char}
          data={abcList}
          renderItem={({item}) => (
            <View key={item.char} style={{marginBottom: 10}}>
              <Letter letter={item.char} cacheKey={this.getCacheKey()} />
            </View>
          )}
        />
      </ScrollView>
    );
  }
}
