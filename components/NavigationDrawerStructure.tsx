import * as React from 'react';
import { Component } from 'react';
import { NavigationScreenProp } from "react-navigation";
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'react-native-elements';

export class NavigationDrawerStructure extends Component {
  public props: {
    navigationProps: NavigationScreenProp<any>,
  };

  //Structure for the navigatin Drawer
  toggleDrawer = () => {
    //Props to open/close the drawer
    this.props.navigationProps.toggleDrawer();
  };

  render() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
          <Image
            source={require('../assets/drawer-150x150.png')}
            style={{ width: 50, height: 25, marginLeft: 5 }}
          />
        </TouchableOpacity>
      </View>
    );
  }
}
