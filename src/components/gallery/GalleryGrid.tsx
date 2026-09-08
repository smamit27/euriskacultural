import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Trash2 } from 'lucide-react';
import type { GalleryImage, GalleryAlbum } from '../../types';
import { galleryService } from '../../services/galleryService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface GalleryGridProps {}

export const GalleryGrid: React.FC<GalleryGridProps> = () => {
  const { isAdmin } = useAuth();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('ALL');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = useCallback(() => {
    Promise.all([galleryService.getAlbums(), galleryService.getImages()]).then(([a, imgs]) => {
      setAlbums(a);
      setImages(imgs);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredImages = selectedAlbum === 'ALL'
    ? images
    : images.filter((img) => img.albumId === selectedAlbum);

  const handleLike = async (e: React.MouseEvent, imgId: string) => {
    e.stopPropagation();
    const newLikes = await galleryService.likeImage(imgId);
    setImages((prev) => prev.map((img) => img.id === imgId ? { ...img, likes: newLikes } : img));
  };

  const handleDelete = async (e: React.MouseEvent, imgId: string) => {
    e.stopPropagation();
    if (!isAdmin) {
      showToast('Admin privileges required to delete photos.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this photo from the gallery?')) {
      return;
    }
    await galleryService.deleteImage(imgId);
    setImages((prev) => prev.filter((img) => img.id !== imgId));
    if (lightboxIdx !== null) {
      setLightboxIdx(null);
    }
    showToast('Photo removed from gallery.', 'info');
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

        {(albums.length > 0 || images.length > 0) && (
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
        )}
      </div>

      {/* 2-column lazy grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading gallery...</div>
      ) : filteredImages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#f8fafc', borderRadius: 16, margin: '0 14px' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📷</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#334155' }}>No photos in this gallery</div>
          <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>Photos will appear here once uploaded for festival events.</div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {img.caption || img.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={(e) => handleLike(e, img.id)}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}
                      title="Like"
                    >
                      <Heart size={12} fill="rgba(255,255,255,0.6)" />
                      {img.likes || 0}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, img.id)}
                        style={{
                          background: 'rgba(220, 38, 38, 0.8)',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          padding: 0,
                        }}
                        title="Remove Photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
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
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {isAdmin && (
                <button
                  onClick={(e) => handleDelete(e, filteredImages[lightboxIdx].id)}
                  className="icon-btn"
                  style={{ color: '#ef4444', background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, border: 'none', cursor: 'pointer' }}
                  title="Remove Photo"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              )}
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
