import * as React from 'react';
import {Component} from 'react';
import {Button} from 'react-native-elements';
import {View} from 'react-native';
import {DeleteConfirm} from '../DeleteConfirm';

export class SavedWord extends Component {
  public props!: {
    text: string;
    onDelete?: () => void;
  };

  public state: {
    showDelete: boolean;
  } = {
    showDelete: false,
  };

  public render() {
    const marginTopStyle = {marginTop: 5};
    return (
      <View style={marginTopStyle}>
        <Button title={this.props.text} onPress={() => this.toggle()} />
        <DeleteConfirm
          itemToDelete={this.props.text}
          isVisible={this.state.showDelete !== false}
          onAbort={() => this.toggle()}
          onDelete={() => this.delete()}
        />
      </View>
    );
  }

  private toggle() {
    this.setState({showDelete: !this.state.showDelete});
  }

  private delete() {
    this.toggle();
    if (this.props.onDelete) {
      this.props.onDelete();
    }
  }
}
