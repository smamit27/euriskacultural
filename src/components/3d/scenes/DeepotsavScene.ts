import * as THREE from 'three';
import type { LightedDiya } from '../../../services/deepotsavService';

export interface DeepotsavController {
  updateDiyas: (diyas: LightedDiya[]) => void;
  highlightDiya: (id: string) => void;
  dispose: () => void;
}

export function createDeepotsavScene(
  container: HTMLElement,
  initialDiyas: LightedDiya[],
  onSelectDiya?: (diya: LightedDiya) => void
): DeepotsavController {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 500;

  // 1. Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050410);
  scene.fog = new THREE.FogExp2(0x050410, 0.035);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 4.2, 6.5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 2. Lighting
  const moonLight = new THREE.DirectionalLight(0x818cf8, 0.8);
  moonLight.position.set(5, 12, -8);
  scene.add(moonLight);

  const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.2);
  scene.add(ambientLight);

  // 3. Sacred Water Pond (Reflective dark water plane with ripples)
  const waterGeo = new THREE.PlaneGeometry(30, 30, 48, 48);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x070b19,
    metalness: 0.95,
    roughness: 0.1,
    flatShading: true,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.2;
  scene.add(water);

  // Pond Stone Border / Ghat Steps
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
  const poolBorder = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.6, 16, 48), stoneMat);
  poolBorder.rotation.x = Math.PI / 2;
  poolBorder.position.y = -0.1;
  scene.add(poolBorder);

  // Starry Sky Background
  const starCount = 600;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3 + 0] = (Math.random() - 0.5) * 60;
    starPositions[i * 3 + 1] = 5 + Math.random() * 30;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xfffbeb, size: 0.18, transparent: true, opacity: 0.8 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // 4. Diya Mesh Factory & Management
  const diyaMeshes: Map<string, {
    group: THREE.Group;
    data: LightedDiya;
    flame: THREE.Mesh;
    light: THREE.PointLight;
    phase: number;
    initialX: number;
    initialZ: number;
  }> = new Map();

  // Helper to create 2D Canvas Sprite Name Badge for Diya
  function createNameSprite(name: string, flatNo: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;

    // Rounded background capsule
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(6, 6, 244, 68, 20);
    ctx.fill();
    ctx.stroke();

    // Text styling
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name.slice(0, 14), 128, 36);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '500 18px Inter, sans-serif';
    ctx.fillText(flatNo ? `Flat: ${flatNo}` : 'Euriska Resident', 128, 60);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.45, 1);
    sprite.position.y = 0.65;
    return sprite;
  }

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.85,
    roughness: 0.3,
  });

  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });

  function spawnDiya(diya: LightedDiya) {
    const group = new THREE.Group();

    // Brass Diya Bowl
    const bowlGeo = new THREE.CylinderGeometry(0.38, 0.2, 0.22, 16);
    const bowl = new THREE.Mesh(bowlGeo, brassMat);
    group.add(bowl);

    // Diya Flame
    const flameGeo = new THREE.ConeGeometry(0.12, 0.38, 12);
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0, 0.22, 0);
    group.add(flame);

    // Point Light for water reflection
    const light = new THREE.PointLight(0xf59e0b, 1.4, 4);
    light.position.set(0, 0.3, 0);
    group.add(light);

    // Resident Name Badge
    const badge = createNameSprite(diya.name, diya.flatNo);
    group.add(badge);

    const x = diya.posX ?? (Math.random() * 6 - 3);
    const z = diya.posZ ?? (Math.random() * 6 - 3);
    group.position.set(x, 0, z);

    scene.add(group);

    diyaMeshes.set(diya.id, {
      group,
      data: diya,
      flame,
      light,
      phase: Math.random() * Math.PI * 2,
      initialX: x,
      initialZ: z,
    });
  }

  // Populate initial diyas
  initialDiyas.forEach(spawnDiya);

  // 5. Interaction & Drag Orbiting
  let isDragging = false;
  let prevX = 0;
  let prevY = 0;
  let cameraRotX = 0;
  let cameraRotY = 0;

  const onPointerDown = (e: MouseEvent | TouchEvent) => {
    isDragging = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    prevX = clientX;
    prevY = clientY;
  };

  const onPointerMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - prevX;
    const deltaY = clientY - prevY;
    prevX = clientX;
    prevY = clientY;

    cameraRotY += deltaX * 0.006;
    cameraRotX = Math.max(-0.4, Math.min(0.6, cameraRotX + deltaY * 0.004));

    const radius = 7.5;
    camera.position.x = Math.sin(cameraRotY) * radius;
    camera.position.z = Math.cos(cameraRotY) * radius;
    camera.position.y = 4.0 + cameraRotX * 3.0;
    camera.lookAt(0, 0, 0);
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  const domEl = renderer.domElement;
  domEl.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  domEl.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  const handleResize = () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  // Animation Loop
  let animationFrameId: number;
  const clock = new THREE.Clock();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Animate water vertex ripples
    const position = waterGeo.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const u = position.getX(i);
      const v = position.getY(i);
      const z = Math.sin(u * 0.8 + elapsedTime * 1.5) * 0.04 + Math.cos(v * 0.8 + elapsedTime * 1.2) * 0.04;
      position.setZ(i, z);
    }
    position.needsUpdate = true;

    // Animate Floating Diyas & Flickering Flames
    diyaMeshes.forEach((item) => {
      const { group, flame, light, phase, initialX, initialZ } = item;
      const t = elapsedTime + phase;

      // Gentle floating bob on water
      group.position.y = Math.sin(t * 1.8) * 0.05 + 0.02;
      group.position.x = initialX + Math.sin(t * 0.8) * 0.15;
      group.position.z = initialZ + Math.cos(t * 0.6) * 0.15;
      group.rotation.y = Math.sin(t * 0.5) * 0.1;

      // Flame flicker
      const flick = 0.85 + Math.sin(t * 22) * 0.15 + Math.cos(t * 14) * 0.1;
      flame.scale.set(flick, flick * 1.15, flick);
      light.intensity = 1.2 * flick;
    });

    renderer.render(scene, camera);
  };

  animate();

  return {
    updateDiyas: (diyas: LightedDiya[]) => {
      // Add any new ones
      diyas.forEach((d) => {
        if (!diyaMeshes.has(d.id)) {
          spawnDiya(d);
        }
      });
    },
    highlightDiya: (id: string) => {
      const item = diyaMeshes.get(id);
      if (item) {
        camera.lookAt(item.group.position);
        item.light.intensity = 3.5;
        if (onSelectDiya) onSelectDiya(item.data);
      }
    },
    dispose: () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    },
  };
}
