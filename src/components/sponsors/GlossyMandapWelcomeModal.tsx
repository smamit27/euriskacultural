import React, { useState, useEffect, useCallback } from 'react';
import { X, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GlossyMandapWelcomeModalProps {
  onNavigateToSponsors?: () => void;
}

// Generate animated floating flower petals
const FLOATING_PETALS = [
  { id: 1, emoji: '🌺', left: '4%', delay: '0s', duration: '5.5s', size: 22 },
  { id: 2, emoji: '🌸', left: '12%', delay: '1.2s', duration: '6.5s', size: 26 },
  { id: 3, emoji: '🌼', left: '22%', delay: '0.5s', duration: '5.8s', size: 20 },
  { id: 4, emoji: '✨', left: '30%', delay: '2s', duration: '4.8s', size: 18 },
  { id: 5, emoji: '🏵️', left: '72%', delay: '0.8s', duration: '6.2s', size: 24 },
  { id: 6, emoji: '🌸', left: '82%', delay: '1.8s', duration: '5.2s', size: 25 },
  { id: 7, emoji: '🌺', left: '92%', delay: '0.3s', duration: '6.8s', size: 22 },
  { id: 8, emoji: '🪔', left: '96%', delay: '2.5s', duration: '5.0s', size: 20 },
  { id: 9, emoji: '✨', left: '8%', delay: '3.2s', duration: '4.5s', size: 16 },
  { id: 10, emoji: '🌼', left: '88%', delay: '3.5s', duration: '5.9s', size: 21 },
];

export const GlossyMandapWelcomeModal: React.FC<GlossyMandapWelcomeModalProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<'DECOR' | 'MURTI'>('DECOR');

  // Trigger firecracker patakha & flower confetti
  const triggerPatakhaAndFlowers = useCallback(() => {
    try {
      // 1. Left side firecracker cannon
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.65 },
        colors: ['#f59e0b', '#ea580c', '#facc15', '#ec4899', '#fbbf24', '#ffffff'],
        scalar: 1.2,
        zIndex: 10005,
      });

      // 2. Right side firecracker cannon
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.65 },
        colors: ['#a855f7', '#7c3aed', '#f59e0b', '#f43f5e', '#38bdf8', '#ffffff'],
        scalar: 1.2,
        zIndex: 10005,
      });

      // 3. Flower petals burst from sides (350ms later)
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 70,
          spread: 55,
          origin: { x: 0.05, y: 0.35 },
          colors: ['#fb7185', '#f43f5e', '#fbbf24', '#f59e0b', '#fed7aa'],
          scalar: 1.4,
          zIndex: 10005,
        });
        confetti({
          particleCount: 40,
          angle: 110,
          spread: 55,
          origin: { x: 0.95, y: 0.35 },
          colors: ['#a855f7', '#ec4899', '#fde047', '#f97316', '#fed7aa'],
          scalar: 1.4,
          zIndex: 10005,
        });
      }, 350);

      // 4. Center Golden Flower Shower (800ms later)
      setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 90,
          origin: { y: 0.38 },
          colors: ['#ffd700', '#ffaa00', '#ff6600', '#ff007f', '#ffffff'],
          scalar: 1.3,
          zIndex: 10005,
        });
      }, 800);
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    // Check if user has seen the glossy welcome splash in this session
    try {
      const alreadySeen = sessionStorage.getItem('euriska_glossy_mandap_seen_v4');
      if (!alreadySeen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem('euriska_glossy_mandap_seen_v4', 'true');
          // Fire celebratory patakha & flower shower
          setTimeout(triggerPatakhaAndFlowers, 250);
        }, 400);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [triggerPatakhaAndFlowers]);

  if (!isOpen) return null;

  const isMurti = activeImage === 'MURTI';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 15, 30, 0.92)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeEnter 0.3s ease-out forwards',
        overflow: 'hidden',
      }}
      onClick={() => setIsOpen(false)}
    >
      <style>{`
        @keyframes fadeEnter {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes modalGlossyShimmer {
          0% { transform: translateX(-150%) skewX(-25deg); }
          50% { transform: translateX(200%) skewX(-25deg); }
          100% { transform: translateX(200%) skewX(-25deg); }
        }
        @keyframes modalGoldGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.4), 0 0 60px rgba(249, 115, 22, 0.25); }
          50% { box-shadow: 0 0 50px rgba(234, 179, 8, 0.7), 0 0 90px rgba(249, 115, 22, 0.45); }
        }
        @keyframes modalFlowerFall {
          0% {
            transform: translateY(-40px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          50% {
            transform: translateY(45vh) translateX(25px) rotate(180deg);
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(95vh) translateX(-20px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Floating Flowers (Pushpa Vrishti) Shower */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10002 }}>
        {FLOATING_PETALS.map((petal) => (
          <div
            key={petal.id}
            style={{
              position: 'absolute',
              top: 0,
              left: petal.left,
              fontSize: petal.size,
              animation: `modalFlowerFall ${petal.duration} infinite ease-in-out`,
              animationDelay: petal.delay,
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
              userSelect: 'none',
            }}
          >
            {petal.emoji}
          </div>
        ))}
      </div>

      {/* Pure Picture Card Container */}
      <div
        style={{
          background: '#020617',
          borderRadius: 24,
          width: '100%',
          maxWidth: 500,
          maxHeight: '92vh',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          border: '2.5px solid rgba(253, 224, 71, 0.7)',
          position: 'relative',
          animation: 'modalGoldGlow 4s infinite ease-in-out',
          zIndex: 10003,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 20,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Top Floating Image Switcher & Patakha Button */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 20,
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setActiveImage('DECOR')}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              border: !isMurti ? '1.5px solid #fde047' : '1px solid rgba(255,255,255,0.3)',
              background: !isMurti ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(8px)',
              color: !isMurti ? '#fde047' : '#ffffff',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ✨ Mandap
          </button>

          <button
            onClick={() => setActiveImage('MURTI')}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              border: isMurti ? '1.5px solid #fde047' : '1px solid rgba(255,255,255,0.3)',
              background: isMurti ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(8px)',
              color: isMurti ? '#fde047' : '#ffffff',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🌺 Murti
          </button>

          <button
            onClick={triggerPatakhaAndFlowers}
            title="Fire Patakha & Flowers!"
            style={{
              padding: '6px 10px',
              borderRadius: 20,
              border: '1px solid rgba(253, 224, 71, 0.5)',
              background: 'rgba(245, 158, 11, 0.3)',
              backdropFilter: 'blur(8px)',
              color: '#fef08a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PartyPopper size={14} />
          </button>
        </div>

        {/* Pure High-Resolution Picture with Glossy & Flower Overlays */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 480,
            maxHeight: '75vh',
            overflow: 'hidden',
          }}
        >
          {/* Sacred Photo */}
          <img
            src={isMurti ? '/ganesh_murti_sponsor.jpg' : '/dagdusheth_decoration.jpg'}
            alt="Festival Visual"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: isMurti ? 'center 20%' : 'center 25%',
              display: 'block',
            }}
          />

          {/* Glossy Glass Reflection */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.02) 100%)',
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
              animation: 'modalGlossyShimmer 3.5s infinite ease-in-out',
              pointerEvents: 'none',
            }}
          />

          {/* Falling Flowers Directly Over the Modal Picture */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            {['🌸', '🌺', '🌼', '🏵️', '✨', '🌸', '🌺'].map((emoji, idx) => (
              <span
                key={idx}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${(idx * 14) + 6}%`,
                  fontSize: 20,
                  animation: `modalFlowerFall ${4 + (idx % 3)}s infinite linear`,
                  animationDelay: `${idx * 0.5}s`,
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Simple Bottom Bar with Enter Button */}
        <div
          style={{
            padding: '12px 18px',
            background: '#0a0f1d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 14,
              border: '1.5px solid rgba(253, 224, 71, 0.6)',
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
              letterSpacing: 0.5,
              boxShadow: '0 4px 16px rgba(234, 88, 12, 0.4)',
            }}
          >
            🌸 Enter Utsav 🌸
          </button>
        </div>
      </div>
    </div>
  );
};
