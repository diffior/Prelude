import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiService } from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const spotifyToken = ref<string | null>(localStorage.getItem('spotify_token'));
  const appleMusicToken = ref<string | null>(localStorage.getItem('apple_music_token'));
  const appleMusicUserToken = ref<string | null>(localStorage.getItem('apple_music_user_token'));

  const isSpotifyAuthenticated = computed(() => !!spotifyToken.value);
  const isAppleMusicAuthenticated = computed(() => !!appleMusicToken.value && !!appleMusicUserToken.value);

  const authenticateSpotify = async (): Promise<void> => {
    const authUrl = await apiService.getSpotifyAuthUrl();
    window.location.href = authUrl;
  };

  const handleSpotifyCallback = async (code: string): Promise<void> => {
    const { token } = await apiService.handleSpotifyCallback(code);
    spotifyToken.value = token;
    localStorage.setItem('spotify_token', token);
  };

  const authenticateAppleMusic = async (): Promise<void> => {
    try {
      // Get developer token from backend
      const { developerToken } = await apiService.getAppleMusicToken();
      appleMusicToken.value = developerToken;
      localStorage.setItem('apple_music_token', developerToken);

      // Initialize MusicKit (this would need to be loaded in index.html)
      if (window.MusicKit) {
        await window.MusicKit.configure({
          developerToken,
          app: {
            name: 'Music Transfer Service',
            build: '1.0'
          }
        });

        const musicKitInstance = window.MusicKit.getInstance();
        await musicKitInstance.authorize();
        
        appleMusicUserToken.value = musicKitInstance.musicUserToken;
        localStorage.setItem('apple_music_user_token', musicKitInstance.musicUserToken);
      }
    } catch (error) {
      console.error('Apple Music authentication failed:', error);
      throw error;
    }
  };

  const logout = (platform: 'spotify' | 'apple'): void => {
    if (platform === 'spotify') {
      spotifyToken.value = null;
      localStorage.removeItem('spotify_token');
    } else {
      appleMusicToken.value = null;
      appleMusicUserToken.value = null;
      localStorage.removeItem('apple_music_token');
      localStorage.removeItem('apple_music_user_token');
    }
  };

  return {
    spotifyToken,
    appleMusicToken,
    appleMusicUserToken,
    isSpotifyAuthenticated,
    isAppleMusicAuthenticated,
    authenticateSpotify,
    handleSpotifyCallback,
    authenticateAppleMusic,
    logout
  };
});