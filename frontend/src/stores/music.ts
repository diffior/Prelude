import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiService } from '@/services/api';
import type { Playlist, Track, Platform } from '@/types';

export const useMusicStore = defineStore('music', () => {
  const spotifyPlaylists = ref<Playlist[]>([]);
  const appleMusicPlaylists = ref<Playlist[]>([]);
  const selectedPlaylist = ref<Playlist | null>(null);
  const playlistTracks = ref<Track[]>([]);
  const loading = ref(false);

  const loadPlaylists = async (platform: Platform, token: string): Promise<void> => {
    loading.value = true;
    try {
      const playlists = await apiService.getPlaylists(platform, token);
      if (platform === 'spotify') {
        spotifyPlaylists.value = playlists;
      } else {
        appleMusicPlaylists.value = playlists;
      }
    } catch (error) {
      console.error(`Failed to load ${platform} playlists:`, error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const loadPlaylistTracks = async (
    platform: Platform,
    playlistId: string,
    token: string
  ): Promise<void> => {
    loading.value = true;
    try {
        const playlists = await apiService.getPlaylists(platform, token);
      if (platform === 'spotify') {
        spotifyPlaylists.value = playlists;
      } else {
        appleMusicPlaylists.value = playlists;
      }
    } catch (error) {
      console.error(`Failed to load ${platform} playlists:`, error);
      throw error;
    } finally {
      loading.value = false;
    }
  };
  const loadPlaylistTracks = async (
    platform: Platform,
    playlistId: string,
    token: string
  ): Promise<void> => {
    loading.value = true;
    try {
      const tracks = await apiService.getPlaylistTracks(platform, playlistId, token);
      playlistTracks.value = tracks;
    } catch (error) {
      console.error(`Failed to load playlist tracks:`, error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const selectPlaylist = (playlist: Playlist): void => {
    selectedPlaylist.value = playlist;
  };

  const clearSelection = (): void => {
    selectedPlaylist.value = null;
    playlistTracks.value = [];
  };

  return {
    spotifyPlaylists,
    appleMusicPlaylists,
    selectedPlaylist,
    playlistTracks,
    loading,
    loadPlaylists,
    loadPlaylistTracks,
    selectPlaylist,
    clearSelection
  };
});