"use client";

import { useRef, useEffect, useCallback } from "react";
import type * as THREETypes from "three";

export default function BasketballScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const init = useCallback(async () => {
    if (!containerRef.current) return;

    const THREE = await import("three");
    const container = containerRef.current;

    // Render at 1/3 resolution for pixel effect
    const PIXEL_RATIO = 3;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const renderWidth = Math.floor(width / PIXEL_RATIO);
    const renderHeight = Math.floor(height / PIXEL_RATIO);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);
    scene.fog = new THREE.FogExp2(0x0a0a14, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(renderWidth, renderHeight);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.imageRendering = "pixelated";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // ── Court floor ──
    const floorGeo = new THREE.PlaneGeometry(22, 14);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x1a472a });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    scene.add(floor);

    // Wood border around court
    const borderGeo = new THREE.PlaneGeometry(26, 18);
    const borderMat = new THREE.MeshLambertMaterial({ color: 0x2a1a0a });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.y = -0.02;
    scene.add(border);

    // ── Court lines ──
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });

    // Boundary
    const bPts = [
      new THREE.Vector3(-10, 0.01, -6),
      new THREE.Vector3(10, 0.01, -6),
      new THREE.Vector3(10, 0.01, 6),
      new THREE.Vector3(-10, 0.01, 6),
      new THREE.Vector3(-10, 0.01, -6),
    ];
    scene.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(bPts), lineMat)
    );

    // Half-court
    const hPts = [
      new THREE.Vector3(0, 0.01, -6),
      new THREE.Vector3(0, 0.01, 6),
    ];
    scene.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(hPts), lineMat)
    );

    // Center circle
    const cPts: THREETypes.Vector3[] = [];
    for (let i = 0; i <= 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      cPts.push(new THREE.Vector3(Math.cos(a) * 2, 0.01, Math.sin(a) * 2));
    }
    scene.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(cPts), lineMat)
    );

    // Three-point arcs
    for (const side of [-1, 1]) {
      const arcPts: THREETypes.Vector3[] = [];
      for (let i = -16; i <= 16; i++) {
        const a = (i / 32) * Math.PI;
        arcPts.push(
          new THREE.Vector3(
            side * (8.5 - Math.cos(a) * 3),
            0.01,
            Math.sin(a) * 3
          )
        );
      }
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(arcPts),
          lineMat
        )
      );
    }

    // ── Basketball ──
    const ballGeo = new THREE.SphereGeometry(0.38, 8, 6);
    const ballMat = new THREE.MeshPhongMaterial({
      color: 0xff6b35,
      shininess: 30,
    });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0, 3, 0);
    scene.add(ball);

    // Seam rings
    const seamGeo = new THREE.TorusGeometry(0.39, 0.018, 4, 12);
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x331100 });
    const seam1 = new THREE.Mesh(seamGeo, seamMat);
    ball.add(seam1);
    const seam2 = seam1.clone();
    seam2.rotation.y = Math.PI / 2;
    ball.add(seam2);

    // ── Hoops ──
    for (const side of [-1, 1] as const) {
      // Pole
      const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.5, 6);
      const poleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(side * 10, 1.75, 0);
      scene.add(pole);

      // Backboard
      const bbGeo = new THREE.BoxGeometry(1.8, 1.2, 0.06);
      const bbMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
      });
      const bb = new THREE.Mesh(bbGeo, bbMat);
      bb.position.set(side * 9.8, 3.5, 0);
      scene.add(bb);

      // Rim
      const rimGeo = new THREE.TorusGeometry(0.42, 0.035, 6, 12);
      const rimMat = new THREE.MeshLambertMaterial({ color: 0xff4400 });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(side * 9.1, 3.0, 0);
      rim.rotation.x = Math.PI / 2;
      scene.add(rim);

      // Net (simple cone shape)
      const netGeo = new THREE.CylinderGeometry(0.42, 0.2, 0.6, 8, 1, true);
      const netMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const net = new THREE.Mesh(netGeo, netMat);
      net.position.set(side * 9.1, 2.7, 0);
      scene.add(net);
    }

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0x404060, 2));

    // Overhead court lights
    const light1 = new THREE.PointLight(0xffcc88, 60, 25);
    light1.position.set(-4, 8, 0);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xffcc88, 60, 25);
    light2.position.set(4, 8, 0);
    scene.add(light2);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // ── Ball shadow (simple circle on floor) ──
    const shadowGeo = new THREE.CircleGeometry(0.3, 8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.25,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.005;
    scene.add(shadow);

    // ── Physics ──
    let velY = 0;
    let velX = 0.025;
    let velZ = 0.012;
    const gravity = -0.006;
    const bounceFactor = 0.68;
    let time = 0;

    // Click to bounce
    const handleClick = () => {
      velY = 0.1 + Math.random() * 0.06;
      velX += (Math.random() - 0.5) * 0.04;
      velZ += (Math.random() - 0.5) * 0.03;
    };
    container.addEventListener("click", handleClick);

    // ── Animation loop ──
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.016;

      // Ball physics
      velY += gravity;
      ball.position.y += velY;
      ball.position.x += velX;
      ball.position.z += velZ;

      // Floor bounce
      if (ball.position.y < 0.38) {
        ball.position.y = 0.38;
        velY = Math.abs(velY) * bounceFactor;
        if (velY < 0.008) velY = 0.03;
      }

      // Wall bounces
      if (Math.abs(ball.position.x) > 9.5) {
        velX = -velX;
        ball.position.x = Math.sign(ball.position.x) * 9.5;
      }
      if (Math.abs(ball.position.z) > 5.5) {
        velZ = -velZ;
        ball.position.z = Math.sign(ball.position.z) * 5.5;
      }

      // Ball rotation
      ball.rotation.x += velX * 3;
      ball.rotation.z -= velZ * 3;

      // Shadow follows ball
      shadow.position.x = ball.position.x;
      shadow.position.z = ball.position.z;
      const shadowScale = Math.max(0.3, 1 - (ball.position.y - 0.38) * 0.15);
      shadow.scale.set(shadowScale, shadowScale, 1);
      (shadow.material as THREETypes.MeshBasicMaterial).opacity =
        0.25 * shadowScale;

      // Gentle camera sway
      camera.position.x = Math.sin(time * 0.12) * 0.8;
      camera.position.z = 12 + Math.cos(time * 0.08) * 0.5;
      camera.lookAt(0, 0.5, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(
        Math.floor(w / PIXEL_RATIO),
        Math.floor(h / PIXEL_RATIO)
      );
    };
    window.addEventListener("resize", handleResize);

    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    init();
    return () => cleanupRef.current?.();
  }, [init]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-pointer"
      title="Click to bounce the ball!"
    />
  );
}
