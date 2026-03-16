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
  jumpTime: number; // >0 means currently jumping from a click
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
    name: "NittanyLion",
    bodyColor: 0x041e42,
    headColor: 0xffffff,
    limbColor: 0x041e42,
    position: [2.5, 0, 7.5],
    animation: "dance",
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
    name: "Bucky",
    bodyColor: 0xc5050c,
    headColor: 0xffffff,
    limbColor: 0xc5050c,
    position: [2.5, 0, -7.5],
    animation: "cheerleading",
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

// Canvas rounded-rect helper
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function addMascotDetails(
  THREE: THREELib,
  cfg: MascotConfig,
  group: THREETypes.Group,
  head: THREETypes.Mesh
) {
  const mat = (color: number, roughness = 0.5) =>
    new THREE.MeshStandardMaterial({ color, roughness });

  switch (cfg.name) {
    case "Bucky": {
      // Badger ears (white with dark inner)
      const earGeo = new THREE.SphereGeometry(0.09, 12, 10);
      const earMat = mat(0xffffff);
      for (const x of [-0.16, 0.16]) {
        const ear = new THREE.Mesh(earGeo, earMat);
        ear.position.set(x, 1.62, -0.02);
        ear.scale.set(0.8, 1.1, 0.5);
        group.add(ear);
        // Dark inner ear
        const innerGeo = new THREE.SphereGeometry(0.05, 10, 8);
        const innerMat = mat(0xc5050c);
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.set(x, 1.62, 0.01);
        inner.scale.set(0.6, 0.8, 0.3);
        group.add(inner);
      }
      // Nose
      const noseGeo = new THREE.SphereGeometry(0.045, 10, 8);
      const noseMat = mat(0x222222, 0.3);
      const nose = new THREE.Mesh(noseGeo, noseMat);
      nose.position.set(0, 1.35, 0.26);
      group.add(nose);
      // Dark eye patches (badger markings)
      const patchGeo = new THREE.SphereGeometry(0.08, 10, 8);
      const patchMat = mat(0x333333);
      for (const x of [-0.1, 0.1]) {
        const patch = new THREE.Mesh(patchGeo, patchMat);
        patch.position.set(x, 1.42, 0.17);
        patch.scale.set(1, 0.8, 0.5);
        group.add(patch);
      }
      break;
    }
    case "Sparty": {
      // Spartan helmet crest (mohawk-style ridge)
      const crestGeo = new THREE.BoxGeometry(0.04, 0.18, 0.35, 1, 1, 1);
      const crestMat = mat(0xffffff, 0.4);
      const crest = new THREE.Mesh(crestGeo, crestMat);
      crest.position.set(0, 1.58, -0.02);
      group.add(crest);
      // Helmet brim
      const brimGeo = new THREE.CylinderGeometry(0.27, 0.28, 0.04, 16);
      const brimMat = mat(0x18453b, 0.3);
      const brim = new THREE.Mesh(brimGeo, brimMat);
      brim.position.set(0, 1.28, 0);
      group.add(brim);
      break;
    }
    case "Brutus": {
      // Bigger, rounder buckeye head
      head.scale.set(1.35, 1.35, 1.35);
      // Baseball cap
      const capGeo = new THREE.SphereGeometry(0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const capMat = mat(0xbb0000, 0.4);
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(0, 1.52, 0);
      group.add(cap);
      // Cap brim
      const capBrimGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.02, 12);
      const capBrimMat = mat(0xbb0000, 0.4);
      const capBrim = new THREE.Mesh(capBrimGeo, capBrimMat);
      capBrim.position.set(0, 1.5, 0.2);
      capBrim.rotation.x = -0.3;
      group.add(capBrim);
      break;
    }
    case "Goldy": {
      // Gopher ears
      const earGeo = new THREE.SphereGeometry(0.07, 10, 8);
      const earMat = mat(0xffcc33);
      for (const x of [-0.18, 0.18]) {
        const ear = new THREE.Mesh(earGeo, earMat);
        ear.position.set(x, 1.58, 0);
        ear.scale.set(0.7, 1, 0.5);
        group.add(ear);
      }
      // Buck teeth
      const toothGeo = new THREE.BoxGeometry(0.04, 0.06, 0.03);
      const toothMat = mat(0xffffff, 0.3);
      for (const x of [-0.03, 0.03]) {
        const tooth = new THREE.Mesh(toothGeo, toothMat);
        tooth.position.set(x, 1.3, 0.24);
        group.add(tooth);
      }
      break;
    }
    case "Herky": {
      // Hawkeye beak (cone)
      const beakGeo = new THREE.ConeGeometry(0.06, 0.14, 8);
      const beakMat = mat(0xffcd00, 0.3);
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.position.set(0, 1.37, 0.3);
      beak.rotation.x = Math.PI / 2;
      group.add(beak);
      // Small feather tufts on top
      const tuftGeo = new THREE.ConeGeometry(0.04, 0.12, 6);
      const tuftMat = mat(0x000000);
      for (const x of [-0.05, 0, 0.05]) {
        const tuft = new THREE.Mesh(tuftGeo, tuftMat);
        tuft.position.set(x, 1.63, -0.05);
        tuft.rotation.z = x * 3;
        group.add(tuft);
      }
      break;
    }
    case "TheDuck": {
      // Duck bill (flattened sphere)
      const billGeo = new THREE.SphereGeometry(0.1, 12, 8);
      const billMat = mat(0xff8c00, 0.4);
      const bill = new THREE.Mesh(billGeo, billMat);
      bill.position.set(0, 1.35, 0.28);
      bill.scale.set(1.4, 0.4, 1.1);
      group.add(bill);
      // Tuft on head
      const tuftGeo = new THREE.SphereGeometry(0.06, 10, 8);
      const tuftMat = mat(0xfee123);
      const tuft = new THREE.Mesh(tuftGeo, tuftMat);
      tuft.position.set(0, 1.62, -0.03);
      tuft.scale.set(1, 1.3, 1);
      group.add(tuft);
      break;
    }
    case "NittanyLion": {
      // Lion ears
      const earGeo = new THREE.SphereGeometry(0.08, 10, 8);
      const earMat = mat(0xddd8cc);
      for (const x of [-0.18, 0.18]) {
        const ear = new THREE.Mesh(earGeo, earMat);
        ear.position.set(x, 1.6, -0.02);
        ear.scale.set(0.7, 1, 0.5);
        group.add(ear);
      }
      // Nose
      const noseGeo = new THREE.SphereGeometry(0.04, 10, 8);
      const noseMat = mat(0x444444, 0.3);
      const nose = new THREE.Mesh(noseGeo, noseMat);
      nose.position.set(0, 1.36, 0.25);
      group.add(nose);
      // Mane (ring of fluff around head)
      const maneGeo = new THREE.TorusGeometry(0.26, 0.06, 8, 16);
      const maneMat = mat(0xddd8cc, 0.7);
      const mane = new THREE.Mesh(maneGeo, maneMat);
      mane.position.set(0, 1.4, 0);
      group.add(mane);
      break;
    }
    case "PurduePete": {
      // Hard hat
      const hatTopGeo = new THREE.SphereGeometry(
        0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2
      );
      const hatMat = mat(0xdaa520, 0.3);
      const hatTop = new THREE.Mesh(hatTopGeo, hatMat);
      hatTop.position.set(0, 1.48, 0);
      group.add(hatTop);
      // Hat brim
      const brimGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.02, 16);
      const brimMat = mat(0xdaa520, 0.3);
      const brim = new THREE.Mesh(brimGeo, brimMat);
      brim.position.set(0, 1.48, 0);
      group.add(brim);
      break;
    }
  }
}

function buildFigure(
  THREE: THREELib,
  cfg: MascotConfig
): MascotInstance {
  const group = new THREE.Group();

  // ── Head (smooth sphere) ──
  const headGeo = new THREE.SphereGeometry(0.25, 24, 16);
  const headMat = new THREE.MeshStandardMaterial({
    color: cfg.headColor,
    roughness: 0.6,
    metalness: 0.05,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.4;
  group.add(head);

  // Eye whites + pupils
  const eyeWhiteGeo = new THREE.SphereGeometry(0.055, 12, 10);
  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
  });
  const pupilGeo = new THREE.SphereGeometry(0.035, 10, 8);
  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.2,
  });
  for (const xOff of [-0.09, 0.09]) {
    const eyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeWhite.position.set(xOff, 1.43, 0.2);
    group.add(eyeWhite);
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(xOff, 1.43, 0.24);
    group.add(pupil);
  }

  // Mouth (small smile arc)
  const smileGeo = new THREE.TorusGeometry(0.06, 0.012, 8, 12, Math.PI);
  const smileMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const smile = new THREE.Mesh(smileGeo, smileMat);
  smile.position.set(0, 1.33, 0.22);
  smile.rotation.z = Math.PI;
  group.add(smile);

  // ── Body (tapered cylinder) ──
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.55, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: cfg.bodyColor,
    roughness: 0.5,
    metalness: 0.05,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.85;
  group.add(body);

  // ── Arms (cylinders with sphere hands) ──
  const armGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.45, 10);
  const armMat = new THREE.MeshStandardMaterial({
    color: cfg.limbColor,
    roughness: 0.5,
    metalness: 0.05,
  });
  const handGeo = new THREE.SphereGeometry(0.06, 10, 8);
  const handMat = new THREE.MeshStandardMaterial({
    color: cfg.headColor,
    roughness: 0.5,
  });

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.3, 1.08, 0);
  const la = new THREE.Mesh(armGeo, armMat);
  la.position.y = -0.22;
  leftArmPivot.add(la);
  const lh = new THREE.Mesh(handGeo, handMat);
  lh.position.y = -0.47;
  leftArmPivot.add(lh);
  group.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.3, 1.08, 0);
  const ra = new THREE.Mesh(armGeo, armMat);
  ra.position.y = -0.22;
  rightArmPivot.add(ra);
  const rh = new THREE.Mesh(handGeo, handMat);
  rh.position.y = -0.47;
  rightArmPivot.add(rh);
  group.add(rightArmPivot);

  // ── Legs (cylinders with shoe spheres) ──
  const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.4, 10);
  const legMat = new THREE.MeshStandardMaterial({
    color: cfg.limbColor,
    roughness: 0.5,
    metalness: 0.05,
  });
  const shoeGeo = new THREE.SphereGeometry(0.08, 10, 8);
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.8,
  });

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.1, 0.55, 0);
  const ll = new THREE.Mesh(legGeo, legMat);
  ll.position.y = -0.2;
  leftLegPivot.add(ll);
  const ls = new THREE.Mesh(shoeGeo, shoeMat);
  ls.position.set(0, -0.42, 0.03);
  ls.scale.set(1, 0.5, 1.4);
  leftLegPivot.add(ls);
  group.add(leftLegPivot);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.1, 0.55, 0);
  const rl = new THREE.Mesh(legGeo, legMat);
  rl.position.y = -0.2;
  rightLegPivot.add(rl);
  const rs = new THREE.Mesh(shoeGeo, shoeMat);
  rs.position.set(0, -0.42, 0.03);
  rs.scale.set(1, 0.5, 1.4);
  rightLegPivot.add(rs);
  group.add(rightLegPivot);

  // ── Mascot-specific details (ears, beaks, hats, etc.) ──
  addMascotDetails(THREE, cfg, group, head);

  // ── Banner (optional, high-res) ──
  let banner: THREETypes.Mesh | null = null;
  if (cfg.bannerText) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    // Gold background with rounded corners
    ctx.fillStyle = "#FFD700";
    roundRect(ctx, 4, 4, 504, 120, 16);
    ctx.fill();
    // Dark gold border
    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = 4;
    roundRect(ctx, 4, 4, 504, 120, 16);
    ctx.stroke();
    // Text shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.font = "bold 54px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cfg.bannerText, 258, 68);
    // Main text
    ctx.fillStyle = "#000";
    ctx.fillText(cfg.bannerText, 256, 66);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;

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
    jumpTime: 0,
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
  m.head.position.y = 1.4 + Math.abs(Math.sin(t * 3)) * 0.06;
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
  m.head.position.y = 1.4 + Math.abs(Math.sin(t * 10)) * 0.03;
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

const JUMP_DURATION = 0.5; // seconds
const JUMP_HEIGHT = 1.2;

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
    /** All mascot groups — use for raycasting click targets */
    mascotGroups: mascots.map((m) => m.group),
    /** Trigger a jump on the mascot whose group matches */
    triggerJump(group: THREETypes.Object3D) {
      for (const m of mascots) {
        if (m.group === group) {
          m.jumpTime = JUMP_DURATION;
          break;
        }
      }
    },
    update(time: number) {
      const dt = 0.016; // ~60 fps frame time
      for (const m of mascots) {
        ANIM_FN[m.animation](time + m.offset, m);
        // Layer click-jump on top of animation
        if (m.jumpTime > 0) {
          const progress = 1 - m.jumpTime / JUMP_DURATION; // 0 → 1
          const jumpY = Math.sin(progress * Math.PI) * JUMP_HEIGHT;
          m.group.position.y += jumpY;
          m.jumpTime = Math.max(0, m.jumpTime - dt);
        }
      }
    },
  };
}
