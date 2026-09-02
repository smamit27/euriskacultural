import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import type { GalleryImage, GalleryAlbum } from '../../types';
import { galleryService } from '../../services/galleryService';

interface GalleryGridProps {}

export const GalleryGrid: React.FC<GalleryGridProps> = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('ALL');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([galleryService.getAlbums(), galleryService.getImages()]).then(([a, imgs]) => {
      setAlbums(a);
      setImages(imgs);
      setLoading(false);
    });
  }, []);

  const filteredImages = selectedAlbum === 'ALL'
    ? images
    : images.filter((img) => img.albumId === selectedAlbum);

  const handleLike = async (e: React.MouseEvent, imgId: string) => {
    e.stopPropagation();
    const newLikes = await galleryService.likeImage(imgId);
    setImages((prev) => prev.map((img) => img.id === imgId ? { ...img, likes: newLikes } : img));
  };

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);

  const goPrev = useCallback(() => {
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx - 1 + filteredImages.length) % filteredImages.length);
  }, [lightboxIdx, filteredImages.length]);

  const goNext = useCallback(() => {
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx + 1) % filteredImages.length);
  }, [lightboxIdx, filteredImages.length]);

  // Touch swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    setTouchStart(null);
  };

  return (
    <div>
      {/* Album Filter Pills */}
      <div style={{ padding: '0 14px 12px' }}>
        <div style={{ marginBottom: 14 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Photo Gallery</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Euriska Cultural & Festive 2026–27 Moments</p>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            onClick={() => setSelectedAlbum('ALL')}
            className={`filter-chip ${selectedAlbum === 'ALL' ? 'active' : ''}`}
          >
            📸 All Photos ({images.length})
          </button>
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbum(album.id)}
              className={`filter-chip ${selectedAlbum === album.id ? 'active' : ''}`}
            >
              {album.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2-column lazy grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading gallery...</div>
      ) : filteredImages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>No photos in this album yet</div>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              className="gallery-grid-item"
              onClick={() => openLightbox(idx)}
            >
              <img
                src={img.imageUrl}
                alt={img.title}
                loading="lazy"
                className="gallery-img"
              />
              <div className="gallery-item-overlay">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, flex: 1 }}>{img.caption || img.title}</span>
                  <button
                    onClick={(e) => handleLike(e, img.id)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}
                  >
                    <Heart size={12} fill="rgba(255,255,255,0.6)" />
                    {img.likes || 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && filteredImages[lightboxIdx] && (
        <div
          className="lightbox-overlay"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="lightbox-header">
            <button onClick={closeLightbox} className="icon-btn" style={{ color: '#fff' }}>
              <X size={22} />
            </button>
            <span>{lightboxIdx + 1} / {filteredImages.length}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={goPrev} className="icon-btn" style={{ color: '#fff' }}><ChevronLeft size={22} /></button>
              <button onClick={goNext} className="icon-btn" style={{ color: '#fff' }}><ChevronRight size={22} /></button>
            </div>
          </div>

          <div className="lightbox-img-wrapper">
            <img
              src={filteredImages[lightboxIdx].imageUrl}
              alt={filteredImages[lightboxIdx].title}
              className="lightbox-img"
            />
          </div>

          <div className="lightbox-footer">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              {filteredImages[lightboxIdx].title}
            </div>
            {filteredImages[lightboxIdx].caption && (
              <div style={{ color: '#94a3b8', fontSize: 12 }}>
                {filteredImages[lightboxIdx].caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
