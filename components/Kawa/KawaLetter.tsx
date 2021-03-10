import * as React from 'react';
import {Component} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text} from 'react-native';
import {Input} from 'react-native-elements';

export class KawaLetter extends Component {
  public props!: {
    letter: string;
    index: string;
    onChangeText?: (text: string) => void;
  };

  public state: {
    text: string;
  } = {
    text: '',
  };

  public componentDidMount(): void {
    AsyncStorage.getItem(
      'KawaItem_' + this.props.letter + '_' + this.props.index,
    ).then((data) => {
      if (data) {
        this.setState({text: JSON.parse(data).text});
      }
    });
  }

  public render() {
    return (
      <View>
        <Text>{this.props.letter.toUpperCase()}</Text>
        <Input
          defaultValue={this.state.text}
          onChangeText={(text: string) => this.onChangeText(text)}
        />
      </View>
    );
  }

  protected onChangeText(text: string) {
    this.saveLetter(text).then(() => {
      if (this.props.onChangeText) {
        this.props.onChangeText(text);
      }
    });
  }

  protected saveLetter(text: string) {
    return AsyncStorage.setItem(
      'KawaItem_' + this.props.letter + '_' + this.props.index,
      JSON.stringify({text}),
    ).then();
  }
}
