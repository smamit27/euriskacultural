import React, { useState, useEffect } from 'react';
import { HeroSection } from '../home/HeroSection';
import { QuickActions } from '../home/QuickActions';
import { UpcomingPrograms } from '../home/UpcomingPrograms';
import { AdminDashboardSummary } from '../home/AdminDashboardSummary';
import { CulturalEventsSection } from '../home/CulturalEventsSection';
import { HomeSponsorsSection } from '../home/HomeSponsorsSection';
import { programService } from '../../services/programService';
import { contributionService } from '../../services/contributionService';
import { useAuth } from '../../context/AuthContext';
import { getNextEvent, daysUntil } from '../../services/eventsData';
import type { Program, FinancialSummary, Building } from '../../types';

interface HomePageProps {
  onNavigate: (section: string) => void;
  onSelectBuilding?: (buildingId: string) => void;
  onSelectProgram?: (prog: Program) => void;
  onShowAddContribution?: () => void;
  onShowAddExpense?: () => void;
}

// Festival banner data keyed by event id
const FESTIVAL_BANNERS: Record<string, {
  gradient: string;
  labelColor: string;
  label: string;
  message: string;
  chips: string[];
}> = {
  'evt-ganesh-2026': {
    gradient: 'linear-gradient(135deg, #92400e, #c2410c, #ea580c)',
    labelColor: '#fde68a',
    label: '🐘 Ganesh Chaturthi 2026 (14 Sep – 25 Sep)',
    message:
      'Ganpati Bappa Morya! 14 Sep: Ganesh Aagman (5 PM) | 19 & 20 Sep: Cultural Activities | 24 Sep: Maha Prasad Dinner (8:30 PM) | 25 Sep: Ganesh Visarjan (4 PM). Daily 8 PM Aarti.',
    chips: [
      '📅 14 Sep – 25 Sep 2026',
      '🚩 14 Sep: Aagman (5 PM)',
      '🎨 19 & 20 Sep: Activities',
      '🍽️ 24 Sep: Maha Prasad (8:30 PM)',
      '🌊 25 Sep: Visarjan (4 PM)',
      '🪔 Daily 8 PM Aarti',
    ],
  },
  'evt-navratri-2026': {
    gradient: 'linear-gradient(135deg, #78350f, #b45309, #d97706)',
    labelColor: '#fef3c7',
    label: '💃 Sharad Navratri 2026',
    message:
      'Nine nights of Garba, Dandiya & devotion culminating in Dussehra (Vijayadashami). Dress in traditional attire & celebrate Maa Durga!',
    chips: ['📅 11 Oct – 20 Oct 2026', '🕖 7 PM Onwards', '📍 Main Podium, Pune', '🥁 Live Garba', '🏆 Best Costume Prize'],
  },
  'evt-diwali-2026': {
    gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed, #8b5cf6)',
    labelColor: '#ddd6fe',
    label: '🪔 Diwali 2026',
    message:
      'Festival of Lights — illuminate our society with diyas, fireworks & a grand community feast. Happy Diwali!',
    chips: ['📅 08 Nov 2026', '🕕 6 PM Onwards', '📍 All Buildings, Pune', '🎆 Fireworks', '🍽️ Community Dinner'],
  },
  'evt-christmas-2026': {
    gradient: 'linear-gradient(135deg, #064e3b, #065f46, #047857)',
    labelColor: '#a7f3d0',
    label: '🎄 Christmas 2026',
    message:
      'Spread love, joy & peace. Join carols, Secret Santa & the grand community Christmas dinner!',
    chips: ['📅 25 Dec 2026', '🕕 6 PM Onwards', '📍 Clubhouse, Pune', '🎅 Secret Santa', '🎶 Carols Night'],
  },
  'evt-eid-2027': {
    gradient: 'linear-gradient(135deg, #0c4a6e, #0e7490, #0891b2)',
    labelColor: '#a5f3fc',
    label: '🌙 Eid al-Fitr 2027',
    message:
      'Eid Mubarak! Share sevaiyaan, greet neighbors & celebrate gratitude & togetherness.',
    chips: ['📅 10 Mar 2027', '🕙 10 AM Onwards', '📍 Community Hall, Pune', '🍮 Sevaiyaan', '🤝 Community Gathering'],
  },
  'evt-holi-2027': {
    gradient: 'linear-gradient(135deg, #1e3a5f, #0369a1, #0284c7)',
    labelColor: '#bae6fd',
    label: '🎨 Holi & Holika Dahan 2027',
    message:
      "Holika Dahan on Sunday, March 21 and Dhulivandan on Monday, March 22! Play with organic colors & celebrate together.",
    chips: ['📅 21 Mar – 22 Mar 2027', '🔥 Holika Dahan 21 Mar', '🎨 Rangwali Holi 22 Mar', '📍 Open Ground, Pune', '🍹 Thandai & Snacks'],
  },
};

const DEFAULT_BANNER = {
  gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)',
  labelColor: '#a5b4fc',
  label: '🎉 Festival Info',
  message: 'All residents & guests are warmly invited to Euriska Cultural & Festive Calendar 2026–27 — celebrating togetherness all year!',
  chips: ['📅 Sep 2026 – Mar 2027', '🕕 6 PM onwards', '📍 Main Podium, Pune', '🎭 6 Festivals', '🍽️ Community Celebrations'],
};

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectBuilding,
  onSelectProgram,
  onShowAddContribution,
  onShowAddExpense,
}) => {
  const { isAdmin } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    programService.getPrograms().then(setPrograms);
    if (isAdmin) {
      Promise.all([
        contributionService.getFinancialSummary(),
        contributionService.getBuildingSummaries(),
      ]).then(([fin, bldgs]) => {
        setFinancials(fin);
        setBuildings(bldgs);
      });
    }
  }, [isAdmin]);

  const nextEvent = getNextEvent();
  const banner = nextEvent ? (FESTIVAL_BANNERS[nextEvent.id] ?? DEFAULT_BANNER) : DEFAULT_BANNER;
  const days = nextEvent ? daysUntil(nextEvent.date) : null;

  return (
    <div>
      {/* Festival-themed Hero */}
      <HeroSection
        onViewPrograms={() => onNavigate('programs')}
        onViewPerformances={() => onNavigate('performances')}
        onViewEvents={() => onNavigate('events')}
      />

      {/* Admin Dashboard — shown only to admins */}
      {isAdmin && financials && buildings.length > 0 && (
        <AdminDashboardSummary
          financials={financials}
          buildings={buildings}
          onAddContribution={() => onShowAddContribution?.()}
          onAddExpense={() => onShowAddExpense?.()}
          onViewReports={() => onNavigate('reports')}
          onSelectBuilding={(id) => onSelectBuilding?.(id)}
        />
      )}

      {/* Cultural & Festive Calendar section */}
      <CulturalEventsSection
        onViewAll={() => onNavigate('events')}
      />

      {/* Quick Actions Grid */}
      <div style={{ marginTop: 0 }}>
        <QuickActions
          onNavigate={(section) => onNavigate(section)}
        />
      </div>

      {/* Seva Patrons & Sponsors Showcase */}
      <HomeSponsorsSection
        onViewAllSponsors={() => onNavigate('sponsors')}
      />

      {/* Upcoming Programs */}
      <UpcomingPrograms
        programs={programs}
        onSelectProgram={(prog) => onSelectProgram?.(prog)}
        onViewAll={() => onNavigate('programs')}
      />

      {/* Dynamic Festival Info Banner */}
      <div
        style={{
          margin: '0 14px 20px',
          background: banner.gradient,
          borderRadius: 18,
          padding: '18px 18px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={() => onNavigate('events')}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 90, height: 90, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, right: 60,
          width: 70, height: 70, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        {/* Ganesh image if next event has one */}
        {nextEvent?.imageUrl && (
          <div style={{
            position: 'absolute', top: 12, right: 14,
            width: 56, height: 56, borderRadius: '50%',
            overflow: 'hidden',
            border: '2.5px solid rgba(255,255,255,0.5)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          }}>
            <img src={nextEvent.imageUrl} alt={nextEvent.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
          </div>
        )}

        <div style={{
          fontSize: 11, fontWeight: 800, color: banner.labelColor,
          textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1,
        }}>
          {banner.label}
        </div>

        {/* Countdown badge inline */}
        {days !== null && days > 0 && nextEvent?.status === 'UPCOMING' && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 8, padding: '3px 10px',
            fontSize: 12, fontWeight: 800, color: '#fff',
            marginBottom: 8,
          }}>
            ⏳ {days} days to go!
          </div>
        )}
        {nextEvent?.status === 'ONGOING' && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#dc2626', borderRadius: 8, padding: '3px 10px',
            fontSize: 12, fontWeight: 900, color: '#fff', marginBottom: 8,
          }}>
            🔴 HAPPENING NOW
          </div>
        )}

        <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.5, color: '#fde68a', marginBottom: 14 }}>
          Ganpati Bappa Morya! Full 12-day festival schedule & activity milestones:
        </div>

        {/* Milestone Timeline History — One by One */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: 'rgba(0, 0, 0, 0.22)',
          borderRadius: 14,
          padding: '12px 14px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}>
          {[
            {
              icon: '🚩',
              date: '14 Sep',
              time: '5:00 PM',
              title: 'Ganesh Aagman & Sthapana',
              badge: 'Aagman @ 5 PM',
            },
            {
              icon: '🪔',
              date: '14 – 25 Sep',
              time: '8:00 PM Daily',
              title: 'Daily Evening Maha Aarti & Modak Prasad',
              badge: 'Daily 8 PM Aarti',
            },
            {
              icon: '🎨',
              date: '19 Sep',
              time: '6:00 PM',
              title: 'Kalakriti Cultural Activities (Night 1)',
              badge: 'Drawing, Skit & Drama',
            },
            {
              icon: '🎭',
              date: '20 Sep',
              time: '6:30 PM',
              title: 'Cultural Stage Extravaganza (Night 2)',
              badge: 'Dance, Singing & Fashion',
            },
            {
              icon: '🍽️',
              date: '24 Sep',
              time: '8:00 PM – 10:00 PM',
              title: 'Grand Maha Prasad Community Feast',
              badge: '8:00 PM – 10:00 PM • RSVP Open',
            },
            {
              icon: '🌊',
              date: '25 Sep',
              time: '4:00 PM',
              title: 'Ganesh Visarjan Procession',
              badge: 'Visarjan @ 4 PM',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}>
                {item.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: '#fde68a',
                    background: 'rgba(254, 230, 138, 0.18)',
                    borderRadius: 999,
                    padding: '2px 8px',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.time}
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.75)', marginTop: 2 }}>
                  📅 <strong style={{ color: '#fff' }}>{item.date}</strong> • {item.badge}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Tap to view Cultural Calendar & all events</span>
          <span>View All →</span>
        </div>
      </div>
    </div>
  );
};
