import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface HomeSponsorsSectionProps {
  onViewAllSponsors?: () => void;
}

const FESTIVAL_IMAGES = [
  {
    id: 'murti',
    title: 'Shri Ganesh Murti',
    src: '/ganesh_murti_sponsor.jpg',
    borderColor: '#f59e0b',
  },
  {
    id: 'decor',
    title: 'Grand Mandap & Illumination',
    src: '/dagdusheth_decoration.jpg',
    borderColor: '#d97706',
  },
];

const FLOWER_PARTICLES = [
  { emoji: '🌸', left: '8%', delay: '0s', duration: '5s', size: 18 },
  { emoji: '🌺', left: '25%', delay: '1.8s', duration: '6.5s', size: 20 },
  { emoji: '🌼', left: '45%', delay: '3.2s', duration: '5.5s', size: 16 },
  { emoji: '🏵️', left: '68%', delay: '0.9s', duration: '7s', size: 18 },
  { emoji: '🌸', left: '88%', delay: '2.5s', duration: '6s', size: 22 },
  { emoji: '✨', left: '35%', delay: '4.1s', duration: '4.5s', size: 14 },
  { emoji: '🌺', left: '78%', delay: '4.8s', duration: '5.8s', size: 17 },
];

export const HomeSponsorsSection: React.FC<HomeSponsorsSectionProps> = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div style={{ margin: '0 14px 20px', position: 'relative' }}>
      <style>{`
        @keyframes homeGlossyShimmer {
          0% { transform: translateX(-150%) skewX(-25deg); }
          50% { transform: translateX(200%) skewX(-25deg); }
          100% { transform: translateX(200%) skewX(-25deg); }
        }
        @keyframes homePulseGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15); }
          50% { box-shadow: 0 8px 30px rgba(245, 158, 11, 0.35); }
        }
        @keyframes homeFlowerFall {
          0% {
            transform: translateY(-25px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          85% {
            opacity: 0.95;
          }
          100% {
            transform: translateY(270px) translateX(35px) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes lightboxFlowerFall {
          0% {
            transform: translateY(-40px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(92vh) translateX(50px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* 50% 50% Pure Image Showcase with Falling Flowers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
          alignItems: 'stretch',
        }}
      >
        {FESTIVAL_IMAGES.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedImage(item.src)}
            style={{
              position: 'relative',
              borderRadius: 20,
              overflow: 'hidden',
              height: 240,
              cursor: 'pointer',
              border: `2px solid ${item.borderColor}`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              background: '#0f172a',
              animation: 'homePulseGlow 4s infinite ease-in-out',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {/* The High-Resolution Picture */}
            <img
              src={item.src}
              alt={item.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: item.id === 'murti' ? 'center 20%' : 'center 25%',
                display: 'block',
              }}
            />

            {/* Glossy Glass Reflection Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '50%',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.02) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Animated Glossy Shimmer Beam */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '60%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent)',
                animation: 'homeGlossyShimmer 3.5s infinite ease-in-out',
                pointerEvents: 'none',
              }}
            />

            {/* Falling Flower Petals Animation directly over the Picture */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                zIndex: 2,
              }}
            >
              {FLOWER_PARTICLES.map((f, i) => (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: f.left,
                    fontSize: f.size,
                    animation: `homeFlowerFall ${f.duration} infinite ease-in-out`,
                    animationDelay: f.delay,
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                  }}
                >
                  {f.emoji}
                </span>
              ))}
            </div>

            {/* Subtle Zoom button indicator */}
            <div
              style={{
                position: 'absolute',
                right: 12,
                bottom: 12,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                zIndex: 3,
              }}
            >
              <ZoomIn size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Full-Screen Image Lightbox Preview Modal with Falling Flowers */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 15, 30, 0.94)',
            backdropFilter: 'blur(12px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeEnter 0.25s ease-out forwards',
          }}
          onClick={() => setSelectedImage(null)}
        >
          {/* Falling Flowers Shower in Lightbox */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {['🌸', '🌺', '🌼', '🏵️', '✨', '🌸', '🌺', '🌼', '🏵️'].map((emoji, idx) => (
              <span
                key={idx}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${(idx * 11) + 5}%`,
                  fontSize: 22,
                  animation: `lightboxFlowerFall ${4 + (idx % 3) * 1.5}s infinite linear`,
                  animationDelay: `${idx * 0.4}s`,
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <div
            style={{
              position: 'relative',
              maxWidth: '94vw',
              maxHeight: '90vh',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              border: '2px solid rgba(253, 224, 71, 0.5)',
              background: '#020617',
              zIndex: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <img
              src={selectedImage}
              alt="Festival Preview"
              style={{
                maxWidth: '92vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
