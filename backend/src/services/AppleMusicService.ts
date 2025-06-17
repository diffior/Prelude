import jwt from 'jsonwebtoken';
import fs from 'fs';
import axios, { AxiosInstance } from 'axios';
import { Track, Playlist } from '../types';

export class AppleMusicService {
  private api: AxiosInstance;
  private developerToken?: string;
  private teamId: string;
  private keyId: string;
  private privateKeyPath: string;

  constructor() {
    this.teamId = process.env.APPLE_MUSIC_TEAM_ID!;
    this.keyId = process.env.APPLE_MUSIC_KEY_ID!;
    this.privateKeyPath = process.env.APPLE_MUSIC_PRIVATE_KEY_PATH!;

    this.api = axios.create({
      baseURL: 'https://api.music.apple.com/v1',
    });

    this.api.interceptors.request.use((config) => {
      if (this.developerToken) {
        config.headers.Authorization = `Bearer ${this.developerToken}`;
      }
      return config;
    });
  }

  async authenticate(): Promise<string> {
    const privateKey = fs.readFileSync(this.privateKeyPath, 'utf8');

    this.developerToken = jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      expiresIn: '180d',
      issuer: this.teamId,
      header: {
        alg: 'ES256',
        kid: this.keyId
      }
    });

    return this.developerToken;
  }

  async searchTrack(artist: string, album: string, track: string, userToken: string): Promise<Track[]> {
    const query = `${track} ${artist} ${album}`;
    
    const response = await this.api.get('/catalog/us/search', {
      params: {
        term: query,
        types: 'songs',
        limit: 10
      },
      headers: {
        'Music-User-Token': userToken
      }
    });

    return response.data.results.songs?.data.map((song: any) => this.formatTrack(song)) || [];
  }

  async addToLibrary(trackIds: string[], userToken: string): Promise<void> {
    await this.api.post('/me/library', {
      data: trackIds.map(id => ({
        id,
        type: 'songs'
      }))
    }, {
      headers: {
        'Music-User-Token': userToken
      }
    });
  }

  async createPlaylist(name: string, description: string, trackIds: string[], userToken: string): Promise<string> {
    const response = await this.api.post('/me/library/playlists', {
      attributes: {
        name,
        description
      },
      relationships: {
        tracks: {
          data: trackIds.map(id => ({
            id,
            type: 'songs'
          }))
        }
      }
    }, {
      headers: {
        'Music-User-Token': userToken
      }
    });

    return response.data.data[0].id;
  }

  private formatTrack(song: any): Track {
    return {
      id: song.id,
      name: song.attributes.name,
      artists: [song.attributes.artistName],
      album: song.attributes.albumName,
      duration: song.attributes.durationInMillis,
      externalUrls: {
        apple: song.attributes.url
      }
    };
  }
}