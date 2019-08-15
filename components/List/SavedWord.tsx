import React, { Component } from 'react';
import { Button, Overlay, Text } from 'react-native-elements';
import { View } from 'react-native';

export class SavedWord extends Component {

  public props: {
    text: string,
    onDelete?: () => void
  };

  public state: {
    showDelete: boolean,
  } = {
    showDelete: false,
  };

  public render() {
    const marginTopStyle = { marginTop: 5 };
    return (
      <View style={marginTopStyle}>
        <Button title={this.props.text} onPress={() => this.toggle()}/>
        <Overlay isVisible={this.state.showDelete}
                 height={'auto'}
                 onRequestClose={() => this.toggle()}
                 onBackdropPress={() => this.toggle()}>
          <View>
            <Text style={{ textAlign: 'center' }}>{'Wirklich löschen?'}</Text>
            <Button containerStyle={marginTopStyle} title={'ja'} onPress={() => this.delete()}/>
            <Button containerStyle={marginTopStyle} title={'nein'} onPress={() => this.toggle()}/>
          </View>
        </Overlay>
      </View>
    );
  }

  private toggle() {
    this.setState({ showDelete: !this.state.showDelete });
  }

  private delete() {
    this.toggle();
    if (this.props.onDelete) {
      this.props.onDelete();
    }
  }
}
