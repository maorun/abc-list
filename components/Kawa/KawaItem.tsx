import * as React from 'react';
import {Component} from 'react';
import {ScrollView} from 'react-native';
import {KawaLetter} from './KawaLetter';
import {NewItemWithSaveKey} from '../NewStringItem';
import {StackNavigationProp} from '@react-navigation/stack';

export class KawaItem extends Component {
  public props!: {
    navigation: StackNavigationProp<any>;
    route: {
      name: string;
      params: {
        item: {
          key: string;
          text: string;
        };
      };
    };
  };

  public componentDidMount() {
    this.props.navigation.setOptions({
      title: 'Kawa für ' + this.props.route.params.item.text,
    });
  }

  public render() {
    const word: NewItemWithSaveKey = this.props.route.params.item;
    const letters: string[] = [];
    for (let i = 0; i < word.text.length; i++) {
      letters.push(word.text.charAt(i));
    }
    return (
      <ScrollView>
        {letters.map((letter, index) => {
          return (
            <KawaLetter
              key={index}
              letter={letter}
              index={word.key + '_' + index}
            />
          );
        })}
      </ScrollView>
    );
  }
}
