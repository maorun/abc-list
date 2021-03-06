import * as React from 'react';
import {Component} from 'react';
import {View, Text, StyleProp, ViewStyle} from 'react-native';
import {Input, Button, Overlay} from 'react-native-elements';
import {getRandomBytesAsync} from 'expo-random';
import {Theme} from '../themes/default';

export interface NewItemWithSaveKey {
  key: string;
  text: string;
}

export class NewStringItem extends Component {
  public props!: {
    title: string;
    onSave?: (item: NewItemWithSaveKey) => void;
    onAbort?: () => void;
  };
  public state: {
    isVisible: boolean;
    newItem: string;
  } = {
    isVisible: false,
    newItem: '',
  };

  public render() {
    const margin: StyleProp<ViewStyle> = {margin: 5};
    return (
      <View>
        <Overlay
          isVisible={this.state.isVisible}
          // height={'auto'}
          onRequestClose={() => this.abort()}
          onBackdropPress={() => this.abort()}>
          <View>
            <Text style={Theme.HeaderText}>{this.props.title}:</Text>
            <Input
              containerStyle={margin}
              onChangeText={(text: string) => this.setState({newItem: text})}
            />
            <Button
              title={'Speichern'}
              containerStyle={margin}
              onPress={() => this.onSave()}
            />
            <Button
              title={'Abbrechen'}
              containerStyle={margin}
              onPress={() => this.abort()}
            />
          </View>
        </Overlay>
        <Button
          title={this.props.title}
          containerStyle={margin}
          onPress={() => this.setState({isVisible: true})}
        />
      </View>
    );
  }

  private abort() {
    this.setState({isVisible: false, newItem: ''});
  }

  private onSave() {
    getRandomBytesAsync(10).then((random) => {
      if (this.props.onSave) {
        this.props.onSave({key: random.toString(), text: this.state.newItem});
      }
      this.abort();
    });
  }
}
