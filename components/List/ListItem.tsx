import React, { Component } from 'react';
import { AsyncStorage, ScrollView, FlatList, View, Text } from 'react-native';
import { Input } from 'react-native-elements';
import { NavigationScreenProp } from "react-navigation";

export class ListItem extends Component {
  public props: {
    navigation: NavigationScreenProp<any, {item: string}>;
  };

  public static cacheKey = 'abcList-';

  public state = {};

  public constructor(props) {
    super(props);


    for (let i = 0; i < 26; i++) {
      let char = String.fromCharCode(97 + i);
      this.state[char] = '';
    }

    AsyncStorage.getItem(this.getCacheKey()).then((data: string) => {
      console.log(this.getCacheKey(), data);
      if (data) {
        this.setState(JSON.parse(data));
      }
    });
  }

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
            <View>
              <Text>{item.char.toUpperCase()}</Text>
              <Input value={this.state[ item.char ]} onChangeText={(text) => this.getOnChangeText(item, text)}/>
            </View>
          }/>
      </ScrollView>
    );
    /**
     *
     <ScrollView style={{ flex: 1 }}>
     <Text>Cache: {this.state.data}</Text>
     <Input placeholder="input" onChangeText={(text) => this.setState({ text })}/>
     <Text>{this.state.data}</Text>
     <Text>{this.state.data}</Text>
     <Button onPress={this.onPressButton} title="Speichern"/>
     </ScrollView>
     */
  }

  private getOnChangeText(item, text) {
    this.setState({[item.char]: text}, () => {
      AsyncStorage.setItem(this.getCacheKey(), JSON.stringify(this.state)).then(() => {

      });
    });
  }

}