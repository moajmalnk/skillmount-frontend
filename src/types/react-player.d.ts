declare module 'react-player/lazy' {
  import { Component } from 'react';
  import { ReactPlayerProps } from 'react-player';

  export default class ReactPlayer extends Component<ReactPlayerProps> {
    static canPlay(url: string): boolean;
    static addCustomPlayer(player: any): void;
    static removeCustomPlayers(): void;
    seekTo(amount: number, type?: 'seconds' | 'fraction'): void;
    getCurrentTime(): number;
    getDuration(): number;
    getInternalPlayer(key?: string): any;
  }
}
