import * as React from 'react';
import { Component } from 'react';
import { View, Text, AsyncStorage } from 'react-native';
import { Input } from 'react-native-elements';

export class KawaLetter extends Component {
  public props: {
    letter: string;
    index: string;
    onChangeText?: (text) => void;
  };

  public state: {
    text: string;
  } = {
    text: '',
  };

  public componentDidMount(): void {
    AsyncStorage.getItem('KawaItem_' + this.props.letter + '_' + this.props.index).then((data) => {
      if (data) {
        this.setState({ text: JSON.parse(data).text });
      }
    });
  }

  public render() {
    return (
      <View>
        <Text>{this.props.letter.toUpperCase()}</Text>
        <Input onChangeText={(text) => this.onChangeText(text)}>{this.state.text}</Input>
      </View>

    );
  }

  protected onChangeText(text) {
    this.saveLetter(text).then(() => {
      this.props.onChangeText ? this.props.onChangeText(text) : null;
    });
  }

  protected saveLetter(text: string) {
    return AsyncStorage.setItem('KawaItem_' + this.props.letter + '_' + this.props.index, JSON.stringify({ text })).then();
  }
}
