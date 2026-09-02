import { localStore } from './storageService';
import type { GalleryAlbum, GalleryImage } from '../types';
import { DEFAULT_EVENT_ID } from '../firebase/collections';

export const galleryService = {
  async getAlbums(): Promise<GalleryAlbum[]> {
    return localStore.getAlbums();
  },

  async getImages(albumId?: string, category?: string): Promise<GalleryImage[]> {
    let list = localStore.getGalleryImages();
    if (albumId && albumId !== 'ALL') {
      list = list.filter((img) => img.albumId === albumId);
    }
    if (category && category !== 'ALL') {
      list = list.filter((img) => img.category === category);
    }
    return list;
  },

  async uploadImage(data: {
    albumId: string;
    title: string;
    imageUrl: string;
    category: string;
    caption?: string;
    uploaderName?: string;
  }): Promise<GalleryImage> {
    const list = localStore.getGalleryImages();
    const newImage: GalleryImage = {
      id: `img-${Date.now()}`,
      eventId: DEFAULT_EVENT_ID,
      albumId: data.albumId,
      title: data.title,
      imageUrl: data.imageUrl,
      category: data.category,
      caption: data.caption,
      uploadedAt: new Date().toISOString(),
      uploadedBy: data.uploaderName || 'Admin',
      likes: 1,
    };

    list.unshift(newImage);
    localStore.saveGalleryImages(list);
    return newImage;
  },

  async likeImage(id: string): Promise<number> {
    const list = localStore.getGalleryImages();
    const target = list.find((img) => img.id === id);
    if (target) {
      target.likes = (target.likes || 0) + 1;
      localStore.saveGalleryImages(list);
      return target.likes;
    }
    return 0;
  },
};
