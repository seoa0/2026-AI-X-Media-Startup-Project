import {
  firebaseCreateSong,
  firebaseDeleteSong,
  firebaseGetSong,
  firebaseListSongs,
  firebaseUpdateSong,
} from '../../firebase/songsService';
import type { CreateSongRequest, SongStatus, UpdateSongRequest } from '../../types/song';

export const songsApi = {
  list: async (status?: SongStatus) => ({
    data: { songs: await firebaseListSongs(status) },
  }),

  getById: async (id: string) => ({
    data: { song: await firebaseGetSong(id) },
  }),

  create: async (data: CreateSongRequest) => ({
    data: { song: await firebaseCreateSong(data) },
  }),

  update: async (id: string, data: UpdateSongRequest) => ({
    data: { song: await firebaseUpdateSong(id, data) },
  }),

  delete: async (id: string) => {
    await firebaseDeleteSong(id);
    return { data: { ok: true as const } };
  },
};
