import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Component} from 'react';
import {View, FlatList, Text} from 'react-native';
import {Button} from 'react-native-elements';
import {ListItem} from './ListItem';
import {NewStringItem} from '../NewStringItem';
import {StackNavigationProp} from '@react-navigation/stack';
import {Theme} from '../../themes/default';

export class List extends Component {
  public props!: {
    navigation: StackNavigationProp<any>;
    data: string[];
  };

  public static cacheKey = 'abcLists';

  public state: {
    newItem: string;
    isVisible: boolean;
    newItemVisible: boolean;
    newItemData: string;
    data: string[];
  } = {
    newItem: '',
    isVisible: false,
    newItemVisible: false,
    newItemData: '',
    data: [],
  };

  public componentDidMount(): void {
    AsyncStorage.getItem(List.cacheKey).then((data: string | null) => {
      if (data) {
        this.setState({data: JSON.parse(data)});
      }
    });
  }

  public render() {
    return (
      <View style={Theme.View}>
        <NewStringItem
          title={'Neue ABC-Liste'}
          onSave={(item) => this.createNewItem(item.text)}
        />
        <Text style={Theme.HeaderText}>Bisherige ABC-Listen</Text>
        <FlatList
          keyExtractor={(item) => item}
          data={this.state.data}
          refreshing={true}
          renderItem={({item}) => (
            <View style={Theme.ListView}>
              <Button
                title={item}
                containerStyle={Theme.ButtonShowAbc}
                onPress={() => this.showAbcList(item)}
              />
              <Button
                title="X"
                containerStyle={Theme.ButtonDelete}
                onPress={() => this.deleteItem(item)}
              />
            </View>
          )}
        />
      </View>
    );
  }

  private deleteItem(item: string) {
    const items = this.state.data.map((i) => i);
    items.splice(items.indexOf(item), 1);

    this.setState({isVisible: this.state.isVisible, newItem: '', data: items});
    AsyncStorage.setItem(List.cacheKey, JSON.stringify(items)).then(() => {
      AsyncStorage.removeItem(ListItem.cacheKey + item).then(() => {});
    });
  }

  private showAbcList(data: string) {
    this.props.navigation.navigate('listItem', {item: data});
  }

  private createNewItem(newItem: string) {
    const data = this.state.data.map((i) => i);
    if (data.indexOf(newItem) === -1) {
      data.push(newItem);
    }
    this.setState({isVisible: false, newItem: '', data: data});

    AsyncStorage.setItem(List.cacheKey, JSON.stringify(data)).then(() => {});

    this.showAbcList(newItem);
  }
}
