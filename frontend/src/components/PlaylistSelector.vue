<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Select Playlist to Transfer</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Spotify Playlists -->
      <div v-if="authStore.isSpotifyAuthenticated">
        <h3 class="text-lg font-medium mb-3 text-green-600">Spotify Playlists</h3>
        <button
          @click="loadSpotifyPlaylists"
          :disabled="musicStore.loading"
          class="mb-3 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {{ musicStore.loading ? 'Loading...' : 'Load Playlists' }}
        </button>
        
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="playlist in musicStore.spotifyPlaylists"
            :key="playlist.id"
            @click="selectPlaylist(playlist, 'spotify')"
            class="p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'border-green-500 bg-green-50': selectedPlaylist?.id === playlist.id }"
          >
            <div class="font-medium">{{ playlist.name }}</div>
            <div class="text-sm text-gray-600">{{ playlist.totalTracks }} tracks</div>
            <div class="text-xs text-gray-500">by {{ playlist.owner }}</div>
          </div>
        </div>
      </div>

      <!-- Apple Music Playlists -->
      <div v-if="authStore.isAppleMusicAuthenticated">
        <h3 class="text-lg font-medium mb-3 text-red-600">Apple Music Playlists</h3>
        <button
          @click="loadAppleMusicPlaylists"
          :disabled="musicStore.loading"
          class="mb-3 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {{ musicStore.loading ? 'Loading...' : 'Load Playlists' }}
        </button>
        
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="playlist in musicStore.appleMusicPlaylists"
            :key="playlist.id"
            @click="selectPlaylist(playlist, 'apple')"
            class="p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'border-red-500 bg-red-50': selectedPlaylist?.id === playlist.id }"
          >
            <div class="font-medium">{{ playlist.name }}</div>
            <div class="text-sm text-gray-600">{{ playlist.totalTracks }} tracks</div>
            <div class="text-xs text-gray-500">by {{ playlist.owner }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Playlist Details -->
    <div v-if="selectedPlaylist" class="mt-6 p-4 bg-gray-50 rounded">
      <h4 class="font-medium mb-2">Selected: {{ selectedPlaylist.name }}</h4>
      <p class="text-sm text-gray-600 mb-3">{{ selectedPlaylist.totalTracks }} tracks</p>
      
      <div class="flex gap-2">
        <button
          @click="loadPlaylistTracks"
          :disabled="musicStore.loading"
          class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ musicStore.loading ? 'Loading...' : 'Load Tracks' }}
        </button>
        
        <button
          v-if="musicStore.playlistTracks.length > 0"
          @click="startTransfer"
          class="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
        >
          Start Transfer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useMusicStore } from '@/stores/music';
import type { Playlist, Platform } from '@/types';

const authStore = useAuthStore();
const musicStore = useMusicStore();

const selectedPlaylist = ref<Playlist | null>(null);
const selectedPlatform = ref<Platform | null>(null);

const emit = defineEmits<{
  transferStart: [playlist: Playlist, platform: Platform]
}>();

const loadSpotifyPlaylists = async () => {
  if (authStore.spotifyToken) {
    await musicStore.loadPlaylists('spotify', authStore.spotifyToken);
  }
};

const loadAppleMusicPlaylists = async () => {
  if (authStore.appleMusicUserToken) {
    await musicStore.loadPlaylists('apple', authStore.appleMusicUserToken);
  }
};

const selectPlaylist = (playlist: Playlist, platform: Platform) => {
  selectedPlaylist.value = playlist;
  selectedPlatform.value = platform;
  musicStore.selectPlaylist(playlist);
};

const loadPlaylistTracks = async () => {
  if (!selectedPlaylist.value || !selectedPlatform.value) return;
  
  const token = selectedPlatform.value === 'spotify' 
    ? authStore.spotifyToken! 
    : authStore.appleMusicUserToken!;
    
  await musicStore.loadPlaylistTracks(
    selectedPlatform.value,
    selectedPlaylist.value.id,
    token
  );
};

const startTransfer = () => {
  if (selectedPlaylist.value && selectedPlatform.value) {
    emit('transferStart', selectedPlaylist.value, selectedPlatform.value);
  }
};
</script>