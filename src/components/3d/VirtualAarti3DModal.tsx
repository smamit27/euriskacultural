import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  X,
  Flame,
  Bell,
  Flower,
  Volume2,
  VolumeX,
  RotateCw,
  Play,
  Pause,
  SkipForward,
  Music,
  BookOpen,
  Heart,
  Share2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ganeshBhagwanImg from '/ganesh_bhagwan.jpg';

interface VirtualAarti3DModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AartiTrack {
  id: string;
  title: string;
  subtitle: string;
  artist: string;
  duration: string;
  audioUrl: string;
  lyrics: {
    verseNo: number;
    devanagari: string[];
    english: string[];
    meaning?: string;
  }[];
}

const GANESH_AARTI_TRACKS: AartiTrack[] = [
  {
    id: 'sukhkarta',
    title: 'Sukhkarta Dukh Harta (सुखकर्ता दुखहर्ता)',
    subtitle: 'Traditional Maha Aarti • Samarth Ramdas',
    artist: 'Lata Mangeshkar / Traditional Devotional',
    duration: '4:15',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_c89a710e20.mp3?filename=indian-devotional-flute-and-sitar-ambient-111868.mp3',
    lyrics: [
      {
        verseNo: 1,
        devanagari: [
          'सुखकर्ता दुखहर्ता वार्ता विघ्नाची ।',
          'नुरवी पुरवी प्रेम कृपा जयाची ॥',
          'सर्वांगी सुंदर उटी शेंदुराची ।',
          'कंठी झळके माळ मुक्ताफळांची ॥ १ ॥',
        ],
        english: [
          'Sukhkarta dukh hanta vaarta vighnaachi |',
          'Nurvee poorvee prema kripa jayachi ||',
          'Sarvangi sundara uti shendurachi |',
          'Kanthi jhalake maala muktaphalaanchi || 1 ||',
        ],
        meaning: 'O Creator of joy and Destroyer of sorrows, You shower boundless grace and dispel all obstacles. Your radiant form is adorned with sacred saffron and pearls.',
      },
      {
        verseNo: 2,
        devanagari: [
          'जय देव जय देव जय मंगलमूर्ती ।',
          'दर्शनमात्रे मनकामना पुरती ॥ ध्रु० ॥',
        ],
        english: [
          'Jai deva jai deva jai mangalamurti |',
          'Darshana maatre mana kaamanaa purti || Dhru ||',
        ],
        meaning: 'Glory to the Divine Lord, the Auspicious One! A single glimpse of Your blessed form fulfills all cherished wishes of the heart.',
      },
      {
        verseNo: 3,
        devanagari: [
          'रत्नखचित फरा तुज गौरीकुमरा ।',
          'चंदनाची उटी कुंकुमकेशरा ॥',
          'हिरेजडित मुकुट शोभतो बरा ।',
          'रुणझुणती नूपुरे चरणी घागरिया ॥ २ ॥',
        ],
        english: [
          'Ratnakhachita phara tuja Gauri kumara |',
          'Chandanachi uti kumkum keshara ||',
          'Hire jadita mukuta shobhato bara |',
          'Runjhunati noopure charani ghagariya || 2 ||',
        ],
        meaning: 'O Son of Mother Gauri, You wear diamond-studded royal garments and fragrant sandalwood paste. Golden anklets chime sweetly at Your divine feet.',
      },
      {
        verseNo: 4,
        devanagari: [
          'लंबोदर पीतांबर फणिवरबंधना ।',
          'सरळ सोंड वक्रतुंड त्रिनयना ॥',
          'दास रामाचा वाट पाहे सदना ।',
          'संकटी पावावे निर्वाणी रक्षावे सुरवरवंदना ॥ ३ ॥',
        ],
        english: [
          'Lambodara peetambar phanivara bandhana |',
          'Sarala sonda vakratunda trinayana ||',
          'Daas Raamaacha vaata paahe sadana |',
          'Sankati paavaave nirvaani rakshaave suravaravandana || 3 ||',
        ],
        meaning: 'O Great One draped in yellow silks with a graceful trunk and compassionate eyes, bless and protect all devotees in times of adversity.',
      },
    ],
  },
  {
    id: 'jai-ganesh',
    title: 'Jai Ganesh Jai Ganesh Deva (जय गणेश जय गणेश देवा)',
    subtitle: 'Grand Aarti of Lord Ganesha',
    artist: 'Anuradha Paudwal / Traditional',
    duration: '5:02',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7988a.mp3?filename=spiritual-meditation-ambient-123793.mp3',
    lyrics: [
      {
        verseNo: 1,
        devanagari: [
          'जय गणेश जय गणेश जय गणेश देवा ।',
          'माता जाकी पार्वती पिता महादेवा ॥',
        ],
        english: [
          'Jai Ganesh, Jai Ganesh, Jai Ganesh Deva |',
          'Mata jaaki Parvati, pita Mahadeva ||',
        ],
        meaning: 'Glory to Lord Ganesha, whose mother is Goddess Parvati and father is the Supreme Lord Shiva.',
      },
      {
        verseNo: 2,
        devanagari: [
          'एक दंत दयावंत चार भुजाधारी ।',
          'माथे पर सिंदूर सोहे मूसे की सवारी ॥',
          'पान चढ़े फूल चढ़े और चढ़े मेवा ।',
          'लड्डुअन का भोग लगे संत करें सेवा ॥',
        ],
        english: [
          'Ek danta dayavanta, chaara bhujaadhaari |',
          'Maathe par sindoora sohe, moose ki savaari ||',
          'Paana chadhe, phoola chadhe, aura chadhe meva |',
          'Ladduana ka bhoga lage, santa karein seva ||',
        ],
        meaning: 'Single-tusked, compassionate Lord with four hands and bright sindoor, riding the mouse. We offer betel leaves, fresh flowers, modaks, and dry fruits with utmost devotion.',
      },
      {
        verseNo: 3,
        devanagari: [
          'अंधेन को आँख देत कोढ़िन को काया ।',
          'बाँझन को पुत्र देत निर्धन को माया ॥',
          '‘सूर’ श्याम शरण आए सफल कीजे सेवा ।',
          'माता जाकी पार्वती पिता महादेवा ॥',
        ],
        english: [
          'Andhana ko aankha deta, kodhina ko kaaya |',
          'Baanjhana ko putra deta, nirdhana ko maaya ||',
          'Soora Shyama sharana aaye, saphala keeje seva |',
          'Mata jaaki Parvati, pita Mahadeva ||',
        ],
        meaning: 'You grant vision to the sightless, health to the infirm, children to the longing, and prosperity to the humble. Bless all who seek Your refuge.',
      },
    ],
  },
  {
    id: 'ganesh-mantra',
    title: 'Om Gan Ganapataye Namo Namah (ॐ गं गणपतये नमो नमः)',
    subtitle: 'Sacred Mool Mantra & Dhun',
    artist: 'Suresh Wadkar / Vedic Chants',
    duration: '6:30',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_3327d97607.mp3?filename=meditative-spiritual-drone-6644.mp3',
    lyrics: [
      {
        verseNo: 1,
        devanagari: [
          'ॐ गं गणपतये नमो नमः ।',
          'श्री सिद्धिविनायक नमो नमः ॥',
          'अष्टविनायक नमो नमः ।',
          'गणपति बाप्पा मोरया ॥',
        ],
        english: [
          'Om Gam Ganapataye Namo Namah |',
          'Shree Siddhivinayaka Namo Namah ||',
          'Ashtavinayaka Namo Namah |',
          'Ganpati Bappa Morya ||',
        ],
        meaning: 'Salutations to the Supreme Lord Ganesha, the Bestower of Siddhi (Wisdom) and Riddhi (Prosperity). Mangal Murti Morya!',
      },
    ],
  },
];

export const VirtualAarti3DModal: React.FC<VirtualAarti3DModalProps> = ({ isOpen, onClose }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // States
  const [activeTab, setActiveTab] = useState<'AARTI' | 'LYRICS'>('AARTI');
  const [selectedTrackIdx, setSelectedTrackIdx] = useState<number>(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [musicProgress, setMusicProgress] = useState<number>(0);
  const [musicDuration, setMusicDuration] = useState<number>(0);

  const [aartiCount, setAartiCount] = useState<number>(0);
  const [isAartiRotating, setIsAartiRotating] = useState<boolean>(true);
  const [flowerOfferings, setFlowerOfferings] = useState<number>(0);
  const [isBellRinging, setIsBellRinging] = useState<boolean>(false);
  const [isShankhBlowing, setIsShankhBlowing] = useState<boolean>(false);
  const [modakCount, setModakCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [jaikaraCount, setJaikaraCount] = useState<number>(231);
  const [hasDevoteeBlessed, setHasDevoteeBlessed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentTrack = GANESH_AARTI_TRACKS[selectedTrackIdx];

  // 1. Synthetic Shankha Naad (Conch shell deep spiritual sound)
  const playShankhaNaad = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 1.2);
      filter.frequency.exponentialRampToValueAtTime(300, now + 3.0);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.exponentialRampToValueAtTime(235, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(215, now + 2.8);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now); // A4 harmonic
      osc2.frequency.exponentialRampToValueAtTime(470, now + 0.5);
      osc2.frequency.exponentialRampToValueAtTime(430, now + 2.8);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.4);
      gain.gain.setValueAtTime(0.38, now + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 3.2);
      osc2.stop(now + 3.2);
    } catch {
      // ignore
    }
  };

  // 2. Synthetic Temple Bell (Ghanti) Chime
  const playBellChime = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5 note
      osc.frequency.exponentialRampToValueAtTime(1975.53, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.25);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(1480, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 1.4);
      oscHarmonic.stop(now + 1.4);
    } catch {
      // ignore
    }
  };

  // 3. Devotional Music Player Setup
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setMusicProgress(audio.currentTime);
      setMusicDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      // Auto advance to next Aarti track or loop
      setSelectedTrackIdx((prev) => (prev + 1) % GANESH_AARTI_TRACKS.length);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // When track changes, reload audio source
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = currentTrack.audioUrl;
    if (isPlayingMusic) {
      audioRef.current.play().catch(() => {
        setIsPlayingMusic(false);
      });
    }
  }, [selectedTrackIdx]);

  const toggleMusicPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch((e) => {
        console.warn('Audio play request:', e);
        setIsPlayingMusic(true);
      });
    }
  };

  // 4. Three.js 3D Virtual Mandap, Idol & 5-Wick Aarti Thali
  useEffect(() => {
    if (!isOpen || !canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    const width = container.clientWidth || 440;
    const height = container.clientHeight || 420;

    // A. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.6, 8.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // B. Lighting (Warm temple sanctum ambience)
    const ambientLight = new THREE.AmbientLight(0xffedd5, 1.4);
    scene.add(ambientLight);

    const sanctumSpot = new THREE.SpotLight(0xfffbeb, 2.5);
    sanctumSpot.position.set(0, 8, 6);
    sanctumSpot.angle = Math.PI / 3;
    sanctumSpot.penumbra = 0.8;
    scene.add(sanctumSpot);

    // C. Royal Golden Temple Arch & Pillars (Garbhagriha Mandap)
    const goldPillarMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.88,
      roughness: 0.22,
    });

    const pillarGeo = new THREE.CylinderGeometry(0.24, 0.28, 6.2, 20);
    const leftPillar = new THREE.Mesh(pillarGeo, goldPillarMat);
    leftPillar.position.set(-2.8, 1.4, -0.2);
    scene.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, goldPillarMat);
    rightPillar.position.set(2.8, 1.4, -0.2);
    scene.add(rightPillar);

    // Ornate Top Arch Bar
    const archGeo = new THREE.CylinderGeometry(0.18, 0.18, 5.8, 20);
    const topArch = new THREE.Mesh(archGeo, goldPillarMat);
    topArch.rotation.z = Math.PI / 2;
    topArch.position.set(0, 4.4, -0.2);
    scene.add(topArch);

    // D. Central Ganesh Murti (High Definition with Golden Halo)
    const textureLoader = new THREE.TextureLoader();
    const ganeshTexture = textureLoader.load(ganeshBhagwanImg);

    const idolGeo = new THREE.PlaneGeometry(3.6, 4.8);
    const idolMat = new THREE.MeshBasicMaterial({
      map: ganeshTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const idolMesh = new THREE.Mesh(idolGeo, idolMat);
    idolMesh.position.set(0, 1.45, -0.4);
    scene.add(idolMesh);

    // Glowing Prabhavali Halo Ring behind Bappa
    const haloGeo = new THREE.RingGeometry(2.15, 2.45, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 1.45, -0.5);
    scene.add(haloMesh);

    // E. 3D Pancha Aarti Thali (5 Wicks + Camphor Center Diya)
    const thaliGroup = new THREE.Group();

    // Golden Platter
    const thaliGeo = new THREE.CylinderGeometry(1.65, 1.45, 0.14, 32);
    const thaliMesh = new THREE.Mesh(thaliGeo, goldPillarMat);
    thaliMesh.rotation.x = 0.38;
    thaliGroup.add(thaliMesh);

    // Center Camphor Vessel
    const centerDiyaGeo = new THREE.CylinderGeometry(0.38, 0.22, 0.24, 16);
    const centerDiya = new THREE.Mesh(centerDiyaGeo, goldPillarMat);
    centerDiya.position.set(0, 0.16, 0);
    centerDiya.rotation.x = 0.38;
    thaliGroup.add(centerDiya);

    // 5 Outer Wicks (Pancha-Aarti)
    const flameMeshList: THREE.Mesh[] = [];
    const flameLightList: THREE.PointLight[] = [];
    const flameGeo = new THREE.ConeGeometry(0.12, 0.38, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });

    // Center Main Flame
    const mainFlame = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 14), flameMat);
    mainFlame.position.set(0, 0.48, 0);
    thaliGroup.add(mainFlame);
    flameMeshList.push(mainFlame);

    const mainFlameLight = new THREE.PointLight(0xff7700, 2.8, 7);
    mainFlameLight.position.set(0, 0.5, 0);
    thaliGroup.add(mainFlameLight);
    flameLightList.push(mainFlameLight);

    // 5 Outer Lamps along perimeter
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const rx = Math.cos(angle) * 1.05;
      const rz = Math.sin(angle) * 1.05 * 0.9;

      const wickDiya = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.15, 12), goldPillarMat);
      wickDiya.position.set(rx, 0.12, rz);
      wickDiya.rotation.x = 0.38;
      thaliGroup.add(wickDiya);

      const wickFlame = new THREE.Mesh(flameGeo, flameMat);
      wickFlame.position.set(rx, 0.32, rz);
      thaliGroup.add(wickFlame);
      flameMeshList.push(wickFlame);

      const wickLight = new THREE.PointLight(0xf97316, 1.2, 4);
      wickLight.position.set(rx, 0.35, rz);
      thaliGroup.add(wickLight);
      flameLightList.push(wickLight);
    }

    thaliGroup.position.set(0, -1.25, 3.2);
    scene.add(thaliGroup);

    // F. Hanging 3D Golden Temple Bell
    const bellGroup = new THREE.Group();
    const bellBody = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.52, 0.75, 20), goldPillarMat);
    bellGroup.add(bellBody);

    const ropeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.5, 8), new THREE.MeshStandardMaterial({ color: 0x92400e }));
    ropeMesh.position.set(0, 1.6, 0);
    bellGroup.add(ropeMesh);

    bellGroup.position.set(-2.2, 2.8, 1.8);
    scene.add(bellGroup);

    // G. Pushpanjali Flower Particle Physics System
    const activePetals: { mesh: THREE.Mesh; vy: number; vx: number; vz: number; rotX: number; rotY: number }[] = [];
    const petalGeo = new THREE.SphereGeometry(0.18, 6, 6);
    petalGeo.scale(1.5, 0.2, 0.85);

    const marigoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const saffronMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.4 });
    const roseMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 });

    const spawnFlowers = (count: number = 32) => {
      for (let i = 0; i < count; i++) {
        const mat = i % 3 === 0 ? roseMat : i % 2 === 0 ? saffronMat : marigoldMat;
        const mesh = new THREE.Mesh(petalGeo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 4.5,
          4.0 + Math.random() * 1.8,
          -0.2 + (Math.random() - 0.5) * 2.8
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        scene.add(mesh);

        activePetals.push({
          mesh,
          vy: 0.032 + Math.random() * 0.035,
          vx: (Math.random() - 0.5) * 0.025,
          vz: (Math.random() - 0.5) * 0.02,
          rotX: 0.025 + Math.random() * 0.04,
          rotY: 0.02 + Math.random() * 0.035,
        });
      }
    };

    (container as any).__triggerPetals = spawnFlowers;
    (container as any).__triggerBell = () => {
      bellGroup.rotation.z = 0.5;
      playBellChime();
    };

    // H. Animation Loop (60 FPS)
    let animId: number;
    const clock = new THREE.Clock();
    let aartiAngle = 0;
    let rotationCounter = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Halo Rotation & Divine Breathing Glow
      haloMesh.rotation.z = elapsed * 0.3;
      const haloScale = 1 + Math.sin(elapsed * 2.2) * 0.04;
      haloMesh.scale.set(haloScale, haloScale, 1);

      // Rotating Aarti Circular Motion (Ghirni Aarti)
      if (isAartiRotating) {
        aartiAngle += 0.038;
        const radiusX = 1.15;
        const radiusY = 0.42;
        thaliGroup.position.x = Math.sin(aartiAngle) * radiusX;
        thaliGroup.position.y = -1.25 + Math.cos(aartiAngle) * radiusY;
        thaliGroup.rotation.z = Math.sin(aartiAngle) * 0.14;

        if (aartiAngle >= Math.PI * 2) {
          aartiAngle -= Math.PI * 2;
          rotationCounter++;
          setAartiCount(rotationCounter);
        }
      }

      // Flame Flicker on all 6 lamps
      flameLightList.forEach((light, idx) => {
        const flicker = 1.6 + Math.sin(elapsed * 15 + idx * 1.2) * 0.4 + (Math.random() - 0.5) * 0.2;
        light.intensity = flicker;
      });

      flameMeshList.forEach((flameMesh, idx) => {
        const s = 1 + Math.sin(elapsed * 16 + idx * 1.5) * 0.15;
        flameMesh.scale.set(s, 1 + Math.sin(elapsed * 12 + idx) * 0.25, s);
      });

      // Bell Pendulum Swing Damping
      if (Math.abs(bellGroup.rotation.z) > 0.01) {
        bellGroup.rotation.z = Math.sin(elapsed * 16) * (bellGroup.rotation.z * 0.94);
      } else {
        bellGroup.rotation.z = 0;
      }

      // Falling Flowers Motion
      for (let i = activePetals.length - 1; i >= 0; i--) {
        const p = activePetals[i];
        p.mesh.position.y -= p.vy;
        p.mesh.position.x += p.vx;
        p.mesh.position.z += p.vz;
        p.mesh.rotation.x += p.rotX;
        p.mesh.rotation.y += p.rotY;

        if (p.mesh.position.y < -2.4) {
          scene.remove(p.mesh);
          activePetals.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [isOpen, isAartiRotating, soundEnabled]);

  if (!isOpen) return null;

  // Handlers
  const handleOfferFlowers = () => {
    setFlowerOfferings((c) => c + 1);
    if (canvasContainerRef.current && (canvasContainerRef.current as any).__triggerPetals) {
      (canvasContainerRef.current as any).__triggerPetals(35);
    }
  };

  const handleRingBell = () => {
    setIsBellRinging(true);
    setTimeout(() => setIsBellRinging(false), 800);
    if (canvasContainerRef.current && (canvasContainerRef.current as any).__triggerBell) {
      (canvasContainerRef.current as any).__triggerBell();
    }
  };

  const handleBlowShankh = () => {
    setIsShankhBlowing(true);
    playShankhaNaad();
    setTimeout(() => setIsShankhBlowing(false), 3000);
  };

  const handleOfferModak = () => {
    setModakCount((c) => c + 1);
    handleOfferFlowers();
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#fde68a'],
    });
  };

  const handleDevoteeJaikara = () => {
    setJaikaraCount((c) => c + 1);
    setHasDevoteeBlessed(true);
    playBellChime();
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ea580c', '#f59e0b', '#ec4899', '#e11d48'],
    });
  };

  const handleShareAarti = () => {
    const text = `🪔 Join Euriska Society Online 3D Ganesh Aarti & Darshan!\n🌺 Experience live 3D Mandap, Pushpanjali & Aarti Songs.\n✨ Ganpati Bappa Morya!\n🔗 https://euriskacultural.web.app`;
    if (navigator.share) {
      navigator.share({ title: 'Euriska 3D Ganesh Aarti & Darshan', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Aarti invitation copied to clipboard!');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 10, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? '0' : '12px',
      }}
      onClick={onClose}
    >
      {/* Hidden Audio element for background Aarti track */}
      <audio ref={audioRef} preload="auto" />

      <div
        style={{
          background: 'radial-gradient(ellipse at top, #2e1065 0%, #0f172a 70%, #020617 100%)',
          width: '100%',
          maxWidth: isFullscreen ? '100vw' : 540,
          height: isFullscreen ? '100vh' : 'auto',
          maxHeight: isFullscreen ? '100vh' : '94vh',
          borderRadius: isFullscreen ? 0 : 26,
          border: '2px solid rgba(251, 191, 36, 0.45)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 158, 11, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Ornate Header */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              }}
            >
              🕉️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fef3c7', margin: 0, letterSpacing: -0.2 }}>
                  Ganesh Ji 3D Aarti &amp; Darshan
                </h2>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: '#dc2626',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: 6,
                    letterSpacing: 0.5,
                  }}
                >
                  LIVE
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#fed7aa', margin: 0, fontWeight: 600 }}>
                Euriska Devotional Mandap • {jaikaraCount} Devotees Chanting
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Share Aarti */}
            <button
              type="button"
              onClick={handleShareAarti}
              title="Share Aarti"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fed7aa',
                cursor: 'pointer',
              }}
            >
              <Share2 size={15} />
            </button>

            {/* Toggle Audio Sounds */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Bells & Sounds' : 'Enable Bells & Sounds'}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: soundEnabled ? '#fef08a' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle Fullscreen"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e2e8f0',
                cursor: 'pointer',
              }}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e2e8f0',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Switcher: 3D Mandap vs Aarti Lyrics */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '4px 14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('AARTI')}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'AARTI' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: activeTab === 'AARTI' ? '#fff' : '#cbd5e1',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Flame size={14} />
            <span>3D Aarti &amp; Mandap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LYRICS')}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'LYRICS' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: activeTab === 'LYRICS' ? '#fff' : '#cbd5e1',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <BookOpen size={14} />
            <span>Aarti Lyrics &amp; Meaning</span>
          </button>
        </div>

        {/* Tab 1: 3D Mandap & Live Aarti View */}
        {activeTab === 'AARTI' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* 3D WebGL Canvas Area */}
            <div
              ref={canvasContainerRef}
              style={{
                width: '100%',
                height: isFullscreen ? 'calc(100vh - 280px)' : 340,
                position: 'relative',
                cursor: 'grab',
              }}
            >
              {/* Floating Devotional Counters */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 14,
                  display: 'flex',
                  gap: 8,
                  zIndex: 10,
                  flexWrap: 'wrap',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 14,
                    padding: '4px 10px',
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#fef08a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Flame size={12} color="#f97316" />
                  <span>Aarti Rotations: {aartiCount}</span>
                </div>

                {flowerOfferings > 0 && (
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 14,
                      padding: '4px 10px',
                      border: '1px solid rgba(244, 63, 94, 0.4)',
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#fecdd3',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Flower size={12} color="#f43f5e" />
                    <span>Pushpanjali: {flowerOfferings}</span>
                  </div>
                )}

                {modakCount > 0 && (
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 14,
                      padding: '4px 10px',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#fef08a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span>🥟 Modaks: {modakCount}</span>
                  </div>
                )}
              </div>

              {/* Devotee Blessing Button (Bottom Right of Canvas) */}
              <button
                type="button"
                onClick={handleDevoteeJaikara}
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 14,
                  zIndex: 10,
                  background: hasDevoteeBlessed
                    ? 'linear-gradient(135deg, #16a34a, #15803d)'
                    : 'linear-gradient(135deg, #ea580c, #c2410c)',
                  color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Heart size={14} fill="#fff" />
                <span>{hasDevoteeBlessed ? 'बाप्पा मोरया! ✨' : 'गणपति बाप्पा मोरया! 🙏'}</span>
              </button>
            </div>

            {/* Embedded Ganesh Ji Music Player Bar */}
            <div
              style={{
                padding: '10px 16px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isPlayingMusic ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                      color: isPlayingMusic ? '#000' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Music size={14} className={isPlayingMusic ? 'spin-slow' : ''} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#fef08a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentTrack.title}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {currentTrack.subtitle}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={toggleMusicPlay}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 34,
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)',
                    }}
                  >
                    {isPlayingMusic ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTrackIdx((prev) => (prev + 1) % GANESH_AARTI_TRACKS.length)}
                    title="Next Aarti Track"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <SkipForward size={14} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {musicDuration > 0 && (
                <div
                  style={{
                    width: '100%',
                    height: 3,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(musicProgress / musicDuration) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #f59e0b, #ea580c)',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Interactive Devotional Actions (5 Buttons) */}
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.9)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 8,
              }}
            >
              {/* Rotate Aarti */}
              <button
                type="button"
                onClick={() => setIsAartiRotating(!isAartiRotating)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '8px 4px',
                  borderRadius: 12,
                  border: isAartiRotating ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
                  background: isAartiRotating
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(234, 88, 12, 0.3))'
                    : 'rgba(255,255,255,0.05)',
                  color: isAartiRotating ? '#fef08a' : '#cbd5e1',
                  cursor: 'pointer',
                }}
              >
                <RotateCw size={16} className={isAartiRotating ? 'spin-slow' : ''} />
                <span style={{ fontSize: 10, fontWeight: 800 }}>{isAartiRotating ? 'Aarti Live' : 'Rotate'}</span>
              </button>

              {/* Pushpanjali Flowers */}
              <button
                type="button"
                onClick={handleOfferFlowers}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '8px 4px',
                  borderRadius: 12,
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.2))',
                  color: '#fecdd3',
                  cursor: 'pointer',
                }}
              >
                <Flower size={16} />
                <span style={{ fontSize: 10, fontWeight: 800 }}>Flowers 🌸</span>
              </button>

              {/* Ring Temple Bell */}
              <button
                type="button"
                onClick={handleRingBell}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '8px 4px',
                  borderRadius: 12,
                  border: isBellRinging ? '2px solid #fbbf24' : '1px solid rgba(251, 191, 36, 0.4)',
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.2))',
                  color: '#fef3c7',
                  cursor: 'pointer',
                }}
              >
                <Bell size={16} className={isBellRinging ? 'animate-bounce' : ''} />
                <span style={{ fontSize: 10, fontWeight: 800 }}>Bell 🔔</span>
              </button>

              {/* Blow Shankha (Conch) */}
              <button
                type="button"
                onClick={handleBlowShankh}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '8px 4px',
                  borderRadius: 12,
                  border: isShankhBlowing ? '2px solid #38bdf8' : '1px solid rgba(56, 189, 248, 0.4)',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.2))',
                  color: '#bae6fd',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16 }}>🐚</span>
                <span style={{ fontSize: 10, fontWeight: 800 }}>Shankh</span>
              </button>

              {/* Offer Modak */}
              <button
                type="button"
                onClick={handleOfferModak}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '8px 4px',
                  borderRadius: 12,
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.2))',
                  color: '#fef08a',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16 }}>🥟</span>
                <span style={{ fontSize: 10, fontWeight: 800 }}>Modak</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Complete Aarti Lyrics & Meaning */}
        {activeTab === 'LYRICS' && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              maxHeight: isFullscreen ? 'calc(100vh - 140px)' : 420,
            }}
          >
            {/* Track Selector Pills */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {GANESH_AARTI_TRACKS.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTrackIdx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 12,
                    border: selectedTrackIdx === idx ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
                    background: selectedTrackIdx === idx ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.05)',
                    color: selectedTrackIdx === idx ? '#fef08a' : '#cbd5e1',
                    fontSize: 11,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {t.title.split('(')[0].trim()}
                </button>
              ))}
            </div>

            {/* Lyrics Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: 16,
                padding: '16px',
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 900, color: '#fde68a', margin: '0 0 4px' }}>
                {currentTrack.title}
              </h3>
              <div style={{ fontSize: 11, color: '#fed7aa', marginBottom: 14 }}>
                {currentTrack.subtitle}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {currentTrack.lyrics.map((verse) => (
                  <div
                    key={verse.verseNo}
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      borderLeft: '3px solid #f59e0b',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                      {verse.devanagari.map((line, lIdx) => (
                        <div
                          key={lIdx}
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#ffffff',
                            lineHeight: 1.5,
                            letterSpacing: 0.2,
                          }}
                        >
                          {line}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 6 }}>
                      {verse.english.map((line, lIdx) => (
                        <div
                          key={lIdx}
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#fed7aa',
                            fontStyle: 'italic',
                            lineHeight: 1.4,
                          }}
                        >
                          {line}
                        </div>
                      ))}
                    </div>

                    {verse.meaning && (
                      <div
                        style={{
                          fontSize: 11,
                          color: '#cbd5e1',
                          marginTop: 6,
                          paddingTop: 6,
                          borderTop: '1px dashed rgba(255,255,255,0.1)',
                          lineHeight: 1.4,
                        }}
                      >
                        <strong style={{ color: '#fde68a' }}>Meaning:</strong> {verse.meaning}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
