import * as React from 'react';
import { Component } from 'react';
import { View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { KawaLetter } from './KawaLetter';
import { NewItemWithSaveKey } from '../NewStringItem';

export class KawaItem extends Component {
  public props: {
    navigation: NavigationScreenProp<any, { item: string, dataToRemove?: string }>;
  };

  public render() {
    const word: NewItemWithSaveKey = this.props.navigation.getParam('item') as any;
    const letters: string[]        = [];
    for (let i = 0; i < word.text.length; i++) {
      letters.push(word.text.charAt(i));
    }
    return (
      <View>
        {
          letters.map((letter, index) => {
            return (
              <KawaLetter key={index} letter={letter} index={word.key + '_' + index}/>
            );
          })
        }
      </View>
    );
  }
}
