import * as React from 'react';
import {Component} from 'react';
import {Button, Overlay, Input} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View} from 'react-native';
import {SavedWord} from './SavedWord';

export class Letter extends Component {
  public props!: {
    cacheKey: string;
    letter: string;
  };
  private newText: string = '';

  public state: {
    createItem: boolean;
    words: string[];
  } = {
    createItem: false,
    words: [],
  };

  public componentDidMount(): void {
    AsyncStorage.getItem(this.getCacheKey()).then((data: string | null) => {
      if (data) {
        this.setState({words: JSON.parse(data)});
      }
    });
  }

  public render() {
    return (
      <View>
        <Button
          style={{width: 50}}
          title={this.props.letter.toUpperCase()}
          onPress={() => this.toggle()}
        />
        <Overlay
          isVisible={this.state.createItem}
          // height={'auto'}
          onRequestClose={() => this.toggle()}
          onBackdropPress={() => this.toggle()}>
          <View>
            <Input
              onChangeText={(text: string) => (this.newText = text)}
              autoFocus={true}
              style={{marginBottom: 5}}
            />
            <Button
              title={'Speichern'}
              onPress={() =>
                this.saveWords(this.newText).then(() => this.toggle())
              }
            />
          </View>
        </Overlay>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 5,
            justifyContent: 'space-around',
          }}>
          {this.state.words.map((text: string) => {
            return (
              <SavedWord
                key={text}
                text={text}
                onDelete={() => {
                  this.state.words.splice(this.state.words.indexOf(text), 1);
                  this.saveWords();
                }}
              />
            );
          })}
        </View>
      </View>
    );
  }

  private toggle() {
    this.setState({createItem: !this.state.createItem});
    this.newText = '';
  }

  private saveWords(word?: string) {
    return new Promise((resolve) => {
      if (word) {
        this.state.words.push(word);
      }
      this.setState(this.state, () => {
        AsyncStorage.setItem(
          this.getCacheKey(),
          JSON.stringify(this.state.words),
        ).then(() => {
          resolve(this.state.words);
        });
      });
    });
  }

  private getCacheKey() {
    return this.props.cacheKey + ':' + this.props.letter;
  }
}
