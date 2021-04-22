import * as React from 'react';
import {Component} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text, StyleProp, ViewStyle, ScrollView} from 'react-native';
import {NewStringItem, NewItemWithSaveKey} from '../NewStringItem';
import {Button} from 'react-native-elements';
import {DeleteConfirm} from '../DeleteConfirm';
import {StackNavigationProp} from '@react-navigation/stack';

export class Kawa extends Component {
  public props!: {
    navigation: StackNavigationProp<any>;
  };

  public state: {
    kawas: NewItemWithSaveKey[];
    itemToDelete?: NewItemWithSaveKey;
  } = {
    kawas: [],
    itemToDelete: undefined,
  };

  public componentDidMount(): void {
    AsyncStorage.getItem('Kawas').then((data) => {
      if (data) {
        this.setState({kawas: JSON.parse(data)});
      }
    });
  }

  public render() {
    const margin: StyleProp<ViewStyle> = {margin: 5};
    return (
      <View>
        <NewStringItem
          title={'neues Kawa'}
          onSave={(newKawa: NewItemWithSaveKey) => this.saveKawa(newKawa)}
        />
        <Text style={{textAlign: 'center'}}>{'Bisherige Kawas'}</Text>

        <DeleteConfirm
          isVisible={this.state.itemToDelete !== undefined}
          itemToDelete={this.state.itemToDelete}
          onDelete={(kawa) => {
            this.setState({itemToDelete: undefined}, () => {
              if (kawa) {
                this.deleteKawa(kawa);
              }
            });
          }}
          onAbort={() => this.setState({itemToDelete: null})}
        />

        <ScrollView>
          {this.state.kawas.map((kawa: NewItemWithSaveKey, index: number) => (
            <Button
              containerStyle={margin}
              key={index}
              title={kawa.text}
              onPress={() =>
                this.props.navigation.navigate('kawaItem', {item: kawa})
              }
              onLongPress={() => this.showDelete(kawa)}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  private showDelete(itemToDelete: NewItemWithSaveKey) {
    this.setState({itemToDelete});
  }

  private saveKawa(newKawa: NewItemWithSaveKey) {
    if (newKawa.text !== '') {
      this.state.kawas.push(newKawa);
      this.saveState();
    }
  }

  private deleteKawa(kawaToDelete: NewItemWithSaveKey) {
    this.state.kawas.splice(this.state.kawas.indexOf(kawaToDelete));
    this.saveState();
  }

  private async saveState() {
    await AsyncStorage.setItem('Kawas', JSON.stringify(this.state.kawas));
    this.setState({kawas: this.state.kawas});
  }
}
