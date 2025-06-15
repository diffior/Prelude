import axios, { AxiosInstance } from 'axios';
import { Track, Playlist } from '../types';

export class SpotifyService {
  private api: AxiosInstance;
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID!;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    
    this.api = axios.create({
      baseURL: 'https://api.spotify.com/v1',
    });

    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  async authenticate(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    this.accessToken = response.data.access_token;
    return this.accessToken;
  }

  async getUserPlaylists(userToken: string): Promise<Playlist[]> {
    const response = await this.api.get('/me/playlists', {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    return response.data.items.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      totalTracks: playlist.tracks.total,
      tracks: [], // Will be populated separately
      owner: playlist.owner.display_name
    }));
  }

  async getPlaylistTracks(playlistId: string, userToken: string): Promise<Track[]> {
    let tracks: Track[] = [];
    let url = `/playlists/${playlistId}/tracks`;

    while (url) {
      const response = await this.api.get(url, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      const newTracks = response.data.items
        .filter((item: any) => item.track && item.track.type === 'track')
        .map((item: any) => this.formatTrack(item.track));

      tracks = tracks.concat(newTracks);
      url = response.data.next ? response.data.next.replace('https://api.spotify.com/v1', '') : null;
    }

    return tracks;
  }

  async searchTrack(artist: string, album: string, track: string): Promise<Track[]> {
    const query = `artist:"${artist}" album:"${album}" track:"${track}"`;
    
    const response = await this.api.get('/search', {
      params: {
        q: query,
        type: 'track',
        limit: 10
      }
    });

    return response.data.tracks.items.map((track: any) => this.formatTrack(track));
  }

  async createPlaylist(name: string, description: string, userToken: string): Promise<string> {
    const response = await this.api.post('/me/playlists', {
      name,
      description,
      public: false
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    return response.data.id;
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[], userToken: string): Promise<void> {
    // Spotify allows max 100 tracks per request
    const chunks = this.chunkArray(trackUris, 100);

    for (const chunk of chunks) {
      await this.api.post(`/playlists/${playlistId}/tracks`, {
        uris: chunk
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
    }
  }

  private formatTrack(track: any): Track {
    return {
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist: any) => artist.name),
      album: track.album.name,
      duration: track.duration_ms,
      uri: track.uri,
      externalUrls: track.external_urls
    };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
