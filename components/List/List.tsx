import React, { Component } from 'react';
import { View, ScrollView, AsyncStorage, FlatList, Text, StyleProp, ViewStyle } from 'react-native';
import { Button, Overlay, Input } from 'react-native-elements';
import { NavigationScreenProp } from 'react-navigation';
import { ListItem } from './ListItem';

export class List extends Component {
  public props: {
    navigation: NavigationScreenProp<any, { item: string, dataToRemove?: string }>;
    data: string[];
  };

  public static cacheKey = 'abcLists';

  public state: {
    newItem: string;
    isVisible: boolean;
    data: string[];
  } = {
    newItem  : '',
    isVisible: false,
    data     : [],
  };

  public constructor(props) {
    super(props);

    AsyncStorage.getItem(List.cacheKey).then((data: string) => {
      if (data) {
        this.setState({ data: JSON.parse(data) });
      }
    });
  }

  public render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    const margin: StyleProp<ViewStyle> = { margin: 5 };
    return (
      <View style={{ marginBottom: 60 }}>
        <Overlay isVisible={this.state.isVisible} width="auto" height="auto">
          <View>
            <Text>Neue Liste:</Text>
            <Input containerStyle={margin} onChangeText={(text) => this.setState({ newItem: text })}/>
            <Button title="Speichern" containerStyle={margin} onPress={() => this.createNewItem()}/>
            <Button title="Abbrechen" containerStyle={margin} onPress={() => this.setState({ isVisible: false })}/>
          </View>
        </Overlay>
        <Button title="Neue ABC-Liste" containerStyle={margin} onPress={() => this.setState({ isVisible: true })}/>
        <Text>Bisherige ABC-Listen</Text>
        <ScrollView>
          <FlatList keyExtractor={((item) => item)} data={this.state.data} refreshing={true} renderItem={({ item }) =>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch',margin: 5}} >
              <Button title={item} containerStyle={{width: '85%', marginRight: 5}} onPress={() => this.showAbcList(item)}/>
              <Button title="X" containerStyle={{width: '10%'}} onPress={() => this.deleteItem(item)} />
            </View>
          }/>
        </ScrollView>
      </View>
    );
  }

  private deleteItem(item) {
    const items  = this.state.data.map((i) => i);
    items.splice(items.indexOf(item), 1);

    this.setState({ isVisible: this.state.isVisible, newItem: '', data: items });
    AsyncStorage.setItem(List.cacheKey, JSON.stringify(items)).then(() => {
      AsyncStorage.removeItem(ListItem.cacheKey + item).then(() => { });
    });

  }

  private showAbcList(data: string) {
    const { navigation } = this.props;
    navigation.state.listItem = data;
    navigation.navigate('ListItem', { item: data });
  }

  private createNewItem() {
    const newItem = this.state.newItem;
    const data    = this.state.data.map((i) => i);
    if (data.indexOf(newItem) === -1) {
      data.push(newItem);
    }
    this.setState({ isVisible: false, newItem: '', data: data });

    AsyncStorage.setItem(List.cacheKey, JSON.stringify(data)).then(() => { });

    this.showAbcList(newItem);
  }
}