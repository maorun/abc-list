import * as React from 'react';
import {Component} from 'react';
import {View} from 'react-native';
import {Text, Button, Overlay} from 'react-native-elements';
import {Theme} from '../themes/default';

export class DeleteConfirm<T> extends Component {
  public props!: {
    itemToDelete: T;
    onDelete?: (itemToDelete: T) => void;
    onAbort: () => void;
    isVisible: boolean;
  };

  public render() {
    const marginTopStyle = {marginTop: 5};
    return (
      <Overlay
        isVisible={!!this.props.isVisible}
        // height={'auto'}
        onRequestClose={() => this.abort()}
        onBackdropPress={() => this.abort()}>
        <View>
          <Text style={Theme.HeaderText}>{'Wirklich löschen?'}</Text>
          <Button
            containerStyle={marginTopStyle}
            title={'ja'}
            onPress={() => this.delete()}
          />
          <Button
            containerStyle={marginTopStyle}
            title={'nein'}
            onPress={() => this.abort()}
          />
        </View>
      </Overlay>
    );
  }

  private abort() {
    this.props.onAbort();
  }

  private delete() {
    if (this.props.onDelete) {
      this.props.onDelete(this.props.itemToDelete);
    } else {
      this.abort();
    }
  }
}
