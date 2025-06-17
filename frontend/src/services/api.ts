import axios, { AxiosInstance } from 'axios';
import type { Playlist, Track, TransferProgress, Platform } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      withCredentials: true
    });
  }

  // Auth endpoints
  async getSpotifyAuthUrl(): Promise<string> {
    const response = await this.api.get('/auth/spotify/url');
    return response.data.url;
  }

  async handleSpotifyCallback(code: string): Promise<{ token: string }> {
    const response = await this.api.post('/auth/spotify/callback', { code });
    return response.data;
  }

  async getAppleMusicToken(): Promise<{ developerToken: string }> {
    const response = await this.api.get('/auth/apple/token');
    return response.data;
  }

  // Music endpoints
  async getPlaylists(platform: Platform, token: string): Promise<Playlist[]> {
    const response = await this.api.get(`/music/${platform}/playlists`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getPlaylistTracks(platform: Platform, playlistId: string, token: string): Promise<Track[]> {
    const response = await this.api.get(`/music/${platform}/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Transfer endpoints
  async transferPlaylist(
    tracks: Track[],
    targetPlatform: Platform,
    playlistName: string,
    token: string
  ): Promise<{ transferId: string }> {
    const response = await this.api.post('/transfer/playlist', {
      tracks,
      targetPlatform,
      playlistName
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getTransferProgress(transferId: string): Promise<TransferProgress> {
    const response = await this.api.get(`/transfer/${transferId}/progress`);
    return response.data;
  }
}

export const apiService = new ApiService();