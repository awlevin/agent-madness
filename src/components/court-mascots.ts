import type * as THREETypes from "three";

type THREELib = typeof THREETypes;
type AnimationType =
  | "dance"
  | "jumpingJacks"
  | "flexing"
  | "banner"
  | "cheerleading"
  | "running";

interface MascotConfig {
  name: string;
  bodyColor: number;
  headColor: number;
  limbColor: number;
  position: [number, number, number];
  animation: AnimationType;
  facing: number;
  bannerText?: string;
}

interface MascotInstance {
  group: THREETypes.Group;
  body: THREETypes.Mesh;
  head: THREETypes.Mesh;
  leftArmPivot: THREETypes.Group;
  rightArmPivot: THREETypes.Group;
  leftLegPivot: THREETypes.Group;
  rightLegPivot: THREETypes.Group;
  banner: THREETypes.Mesh | null;
  animation: AnimationType;
  offset: number;
  originX: number;
}

// 8 Big Ten mascots with their school colors
const BIG_TEN_MASCOTS: MascotConfig[] = [
  // Near sideline (z=7.5, faces court)
  {
    name: "Sparty",
    bodyColor: 0x18453b,
    headColor: 0x18453b,
    limbColor: 0xffffff,
    position: [-7, 0, 7.5],
    animation: "dance",
    facing: Math.PI,
  },
  {
    name: "Brutus",
    bodyColor: 0xbb0000,
    headColor: 0xaaaaaa,
    limbColor: 0xbb0000,
    position: [-2.5, 0, 7.5],
    animation: "jumpingJacks",
    facing: Math.PI,
  },
  {
    name: "Bucky",
    bodyColor: 0xc5050c,
    headColor: 0xffffff,
    limbColor: 0xc5050c,
    position: [2.5, 0, 7.5],
    animation: "cheerleading",
    facing: Math.PI,
  },
  {
    name: "Goldy",
    bodyColor: 0x7a0019,
    headColor: 0xffcc33,
    limbColor: 0x7a0019,
    position: [7, 0, 7.5],
    animation: "banner",
    facing: Math.PI,
    bannerText: "LOUDER!",
  },
  // Far sideline (z=-7.5, faces court)
  {
    name: "Herky",
    bodyColor: 0x000000,
    headColor: 0xffcd00,
    limbColor: 0x000000,
    position: [-7, 0, -7.5],
    animation: "flexing",
    facing: 0,
  },
  {
    name: "TheDuck",
    bodyColor: 0x154733,
    headColor: 0xfee123,
    limbColor: 0x154733,
    position: [-2.5, 0, -7.5],
    animation: "running",
    facing: 0,
  },
  {
    name: "NittanyLion",
    bodyColor: 0x041e42,
    headColor: 0xffffff,
    limbColor: 0x041e42,
    position: [2.5, 0, -7.5],
    animation: "dance",
    facing: 0,
  },
  {
    name: "PurduePete",
    bodyColor: 0xceb888,
    headColor: 0x000000,
    limbColor: 0xceb888,
    position: [7, 0, -7.5],
    animation: "banner",
    facing: 0,
    bannerText: "GO BIG 10!",
  },
];

function buildFigure(
  THREE: THREELib,
  cfg: MascotConfig
): MascotInstance {
  const group = new THREE.Group();

  // ── Head ──
  const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
  const headMat = new THREE.MeshLambertMaterial({ color: cfg.headColor });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.35;
  group.add(head);

  // Eyes
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.06);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  for (const xOff of [-0.1, 0.1]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(xOff, 1.38, 0.23);
    group.add(eye);
  }

  // ── Body ──
  const bodyGeo = new THREE.BoxGeometry(0.5, 0.6, 0.3);
  const bodyMat = new THREE.MeshLambertMaterial({ color: cfg.bodyColor });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.8;
  group.add(body);

  // ── Arms (pivot at shoulder) ──
  const armGeo = new THREE.BoxGeometry(0.15, 0.5, 0.15);
  const armMat = new THREE.MeshLambertMaterial({ color: cfg.limbColor });

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.35, 1.05, 0);
  const la = new THREE.Mesh(armGeo, armMat);
  la.position.y = -0.25;
  leftArmPivot.add(la);
  group.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.35, 1.05, 0);
  const ra = new THREE.Mesh(armGeo, armMat);
  ra.position.y = -0.25;
  rightArmPivot.add(ra);
  group.add(rightArmPivot);

  // ── Legs (pivot at hip) ──
  const legGeo = new THREE.BoxGeometry(0.18, 0.45, 0.18);
  const legMat = new THREE.MeshLambertMaterial({ color: cfg.limbColor });

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.14, 0.5, 0);
  const ll = new THREE.Mesh(legGeo, legMat);
  ll.position.y = -0.225;
  leftLegPivot.add(ll);
  group.add(leftLegPivot);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.14, 0.5, 0);
  const rl = new THREE.Mesh(legGeo, legMat);
  rl.position.y = -0.225;
  rightLegPivot.add(rl);
  group.add(rightLegPivot);

  // ── Banner (optional) ──
  let banner: THREETypes.Mesh | null = null;
  if (cfg.bannerText) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(0, 0, 128, 32);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 126, 30);
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cfg.bannerText, 64, 17);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;

    const bGeo = new THREE.PlaneGeometry(1.2, 0.3);
    const bMat = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.DoubleSide,
    });
    banner = new THREE.Mesh(bGeo, bMat);
    banner.position.set(0, 1.9, 0);
    group.add(banner);
  }

  group.position.set(...cfg.position);
  group.rotation.y = cfg.facing;

  return {
    group,
    body,
    head,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    banner,
    animation: cfg.animation,
    offset: Math.random() * Math.PI * 2,
    originX: cfg.position[0],
  };
}

// ── Animation functions ──

function animDance(t: number, m: MascotInstance) {
  const sway = Math.sin(t * 3) * 0.15;
  m.body.position.x = sway;
  m.head.position.x = sway;
  m.leftArmPivot.rotation.z = Math.sin(t * 3) * 0.8 + 0.5;
  m.rightArmPivot.rotation.z = Math.sin(t * 3 + 1) * -0.8 - 0.5;
  m.leftLegPivot.rotation.x = Math.sin(t * 6) * 0.2;
  m.rightLegPivot.rotation.x = -Math.sin(t * 6) * 0.2;
  m.head.position.y = 1.35 + Math.abs(Math.sin(t * 3)) * 0.06;
}

function animJumpingJacks(t: number, m: MascotInstance) {
  const phase = (Math.sin(t * 2.5) + 1) / 2;
  m.leftArmPivot.rotation.z = phase * 2.2;
  m.rightArmPivot.rotation.z = -phase * 2.2;
  m.leftLegPivot.rotation.z = phase * 0.4;
  m.rightLegPivot.rotation.z = -phase * 0.4;
  m.group.position.y = Math.max(0, Math.sin(t * 2.5)) * 0.15;
}

function animFlexing(t: number, m: MascotInstance) {
  const cycle = Math.floor((t * 0.5) / Math.PI) % 2;
  if (cycle === 0) {
    m.leftArmPivot.rotation.z = 1.8 + Math.sin(t * 4) * 0.15;
    m.rightArmPivot.rotation.z = -0.2;
    m.body.rotation.z = 0.1;
  } else {
    m.leftArmPivot.rotation.z = 0.2;
    m.rightArmPivot.rotation.z = -1.8 - Math.sin(t * 4) * 0.15;
    m.body.rotation.z = -0.1;
  }
  m.head.rotation.z = m.body.rotation.z * 0.5;
  m.leftLegPivot.rotation.z = 0.15;
  m.rightLegPivot.rotation.z = -0.15;
  m.group.position.y = Math.abs(Math.sin(t * 1.5)) * 0.04;
}

function animBanner(t: number, m: MascotInstance) {
  m.leftArmPivot.rotation.z = 2.5 + Math.sin(t * 1.5) * 0.15;
  m.rightArmPivot.rotation.z = -2.5 - Math.sin(t * 1.5) * 0.15;
  m.body.rotation.z = Math.sin(t * 1.5) * 0.1;
  m.head.rotation.z = Math.sin(t * 1.5) * 0.08;
  if (m.banner) {
    m.banner.position.y = 1.9 + Math.sin(t * 3) * 0.03;
    m.banner.rotation.z = Math.sin(t * 1.5) * 0.1;
  }
  m.group.position.y = Math.abs(Math.sin(t * 3)) * 0.05;
}

function animCheerleading(t: number, m: MascotInstance) {
  m.leftArmPivot.rotation.z = 1.5 + Math.sin(t * 4) * 1.0;
  m.rightArmPivot.rotation.z = -1.5 + Math.sin(t * 4 + Math.PI) * 1.0;
  m.group.position.y = Math.abs(Math.sin(t * 2)) * 0.3;
  m.head.rotation.x = Math.sin(t * 4) * 0.15;
  m.body.rotation.y = Math.sin(t * 2) * 0.2;
}

function animRunning(t: number, m: MascotInstance) {
  m.leftLegPivot.rotation.x = Math.sin(t * 5) * 0.6;
  m.rightLegPivot.rotation.x = Math.sin(t * 5 + Math.PI) * 0.6;
  m.leftArmPivot.rotation.x = Math.sin(t * 5 + Math.PI) * 0.5;
  m.rightArmPivot.rotation.x = Math.sin(t * 5) * 0.5;
  m.group.position.y = Math.abs(Math.sin(t * 5)) * 0.08;
  m.head.position.y = 1.35 + Math.abs(Math.sin(t * 10)) * 0.03;
  // Wander along sideline
  m.group.position.x = m.originX + Math.sin(t * 0.4) * 2;
}

const ANIM_FN: Record<AnimationType, (t: number, m: MascotInstance) => void> = {
  dance: animDance,
  jumpingJacks: animJumpingJacks,
  flexing: animFlexing,
  banner: animBanner,
  cheerleading: animCheerleading,
  running: animRunning,
};

export function createMascots(THREE: THREELib) {
  const root = new THREE.Group();
  const mascots: MascotInstance[] = [];

  for (const cfg of BIG_TEN_MASCOTS) {
    const m = buildFigure(THREE, cfg);
    root.add(m.group);
    mascots.push(m);
  }

  return {
    mascotsGroup: root,
    update(time: number) {
      for (const m of mascots) {
        ANIM_FN[m.animation](time + m.offset, m);
      }
    },
  };
}
