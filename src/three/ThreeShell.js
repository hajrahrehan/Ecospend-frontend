import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";
import { SlotRegistryContext } from "./SlotRegistry";
import { RoomMotionContext } from "./RoomMotion";

const ThreeShell = ({ children, slots = [] }) => {
  const webglHostRef = useRef(null);
  const cssHostRef = useRef(null);
  const uiRef = useRef(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const [dynamicSlots, setDynamicSlots] = useState([]);
  const routeOffsetRef = useRef({ x: 0, y: 0, z: 0, rotX: 0, rotY: 0 });
  const transitionRef = useRef(null);
  const routeKeyRef = useRef("initial");

  const registryValue = useMemo(
    () => ({
      slots: dynamicSlots,
      registerSlot: (slot) => {
        if (!slot) return null;
        const id = slot.id || `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setDynamicSlots((prev) => [
          ...prev.filter((item) => item.id !== id),
          { ...slot, id },
        ]);
        return id;
      },
      updateSlot: (id, patch) => {
        if (!id) return;
        setDynamicSlots((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        );
      },
      removeSlot: (id) => {
        if (!id) return;
        setDynamicSlots((prev) => prev.filter((item) => item.id !== id));
      },
      clearSlots: () => setDynamicSlots([]),
    }),
    [dynamicSlots],
  );

  const resolvedSlots = useMemo(() => [...slots, ...dynamicSlots], [slots, dynamicSlots]);

  const motionValue = useMemo(() => {
    const hashRoute = (value) => {
      let hash = 0;
      for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };

    const offsetsFromRoute = (routeKey) => {
      const hash = hashRoute(routeKey);
      const jitter = (hash % 1000) / 1000;
      return {
        x: (jitter - 0.5) * 180,
        y: ((hash % 97) / 97 - 0.5) * 120,
        z: ((hash % 83) / 83 - 0.5) * 140,
        rotX: ((hash % 47) / 47 - 0.5) * 0.18,
        rotY: ((hash % 59) / 59 - 0.5) * 0.2,
      };
    };

    return {
      playRouteTransition: (routeKey) => {
        const key = routeKey || "route";
        const nextOffsets = offsetsFromRoute(key);
        transitionRef.current = {
          start: performance.now(),
          duration: 1200,
          from: { ...routeOffsetRef.current },
          to: nextOffsets,
        };
        routeKeyRef.current = key;
      },
    };
  }, []);

  useEffect(() => {
    if (uiRef.current && !portalTarget) {
      setPortalTarget(uiRef.current);
    }
  }, [portalTarget]);

  useEffect(() => {
    const webglHost = webglHostRef.current;
    const cssHost = cssHostRef.current;
    const uiElement = uiRef.current;

    if (!webglHost || !cssHost || !uiElement) return undefined;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(0, 0, 1200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    webglHost.appendChild(renderer.domElement);

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = "absolute";
    cssRenderer.domElement.style.top = "0";
    cssRenderer.domElement.style.left = "0";
    cssRenderer.domElement.style.pointerEvents = "auto";
    cssHost.appendChild(cssRenderer.domElement);

    const uiObject = new CSS3DObject(uiElement);
    uiObject.position.set(0, 0, 0);
    uiObject.rotation.set(-0.04, 0.06, 0);
    scene.add(uiObject);

    const ambient = new THREE.AmbientLight(0x5aa3ff, 0.45);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(500, 300, 600);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x34f0c1, 0.6);
    fillLight.position.set(-500, -200, 400);
    scene.add(fillLight);

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    const materials = [];
    const geometries = [];
    const slotInstances = [];

    const registerMesh = (mesh, geometry, material) => {
      roomGroup.add(mesh);
      geometries.push(geometry);
      materials.push(material);
    };

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a162b,
      metalness: 0.22,
      roughness: 0.8,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });

    const wallEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f8a6d,
      metalness: 0.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });

    const wallWidth = 1800;
    const wallHeight = 900;
    const roomDepth = 1400;

    const backWallGeometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial.clone());
    backWall.position.set(0, 0, -roomDepth);
    registerMesh(backWall, backWallGeometry, backWall.material);

    const leftWallGeometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial.clone());
    leftWall.position.set(-wallWidth / 2, 0, -roomDepth / 2);
    leftWall.rotation.y = Math.PI / 2;
    registerMesh(leftWall, leftWallGeometry, leftWall.material);

    const rightWallGeometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial.clone());
    rightWall.position.set(wallWidth / 2, 0, -roomDepth / 2);
    rightWall.rotation.y = -Math.PI / 2;
    registerMesh(rightWall, rightWallGeometry, rightWall.material);

    const frontWallGeometry = new THREE.PlaneGeometry(wallWidth, wallHeight);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallEdgeMaterial.clone());
    frontWall.position.set(0, 0, roomDepth * 0.15);
    frontWall.rotation.y = Math.PI;
    registerMesh(frontWall, frontWallGeometry, frontWall.material);

    const floorGeometry = new THREE.PlaneGeometry(wallWidth, roomDepth);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x07101c,
      metalness: 0.1,
      roughness: 0.85,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -wallHeight / 2, -roomDepth / 2);
    registerMesh(floor, floorGeometry, floorMaterial);

    const wallAnchors = {};
    const createWallAnchor = (key, position, rotation) => {
      const anchor = new THREE.Group();
      anchor.position.copy(position);
      anchor.rotation.copy(rotation);
      roomGroup.add(anchor);
      wallAnchors[key] = anchor;
      return anchor;
    };

    createWallAnchor("back", backWall.position, backWall.rotation);
    createWallAnchor("front", frontWall.position, frontWall.rotation);
    createWallAnchor("left", leftWall.position, leftWall.rotation);
    createWallAnchor("right", rightWall.position, rightWall.rotation);

    const createSlotContent = (type, size) => {
      const group = new THREE.Group();
      const gold = new THREE.MeshStandardMaterial({
        color: 0xf6d26a,
        metalness: 0.8,
        roughness: 0.25,
        emissive: 0x4d3b10,
        emissiveIntensity: 0.25,
      });
      const teal = new THREE.MeshStandardMaterial({
        color: 0x35e0c6,
        metalness: 0.6,
        roughness: 0.35,
        emissive: 0x0c3b2f,
        emissiveIntensity: 0.2,
      });

      if (type === "coins") {
        const coinGeometry = new THREE.CylinderGeometry(40, 40, 10, 32);
        const ringGeometry = new THREE.TorusGeometry(size * 0.35, 3, 12, 80);
        const ringMaterial = teal.clone();

        const coinA = new THREE.Mesh(coinGeometry, gold);
        coinA.rotation.x = Math.PI / 2;
        const coinB = new THREE.Mesh(coinGeometry, gold);
        coinB.rotation.x = Math.PI / 2;
        coinB.position.set(70, 30, 0);

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;

        group.add(coinA);
        group.add(coinB);
        group.add(ring);

        geometries.push(coinGeometry, ringGeometry);
        materials.push(gold, ringMaterial);

        return { group, spin: 0.006, pulse: 0.4 };
      }

      if (type === "ledger") {
        const plateGeometry = new THREE.PlaneGeometry(size * 0.6, size * 0.32);
        const plateMaterial = new THREE.MeshStandardMaterial({
          color: 0x0c1e3b,
          metalness: 0.3,
          roughness: 0.4,
          emissive: 0x123067,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.set(0, 0, 6);

        const lineGeometry = new THREE.BoxGeometry(size * 0.5, 6, 2);
        const lineMaterial = teal.clone();
        const lines = [];
        for (let i = 0; i < 4; i += 1) {
          const line = new THREE.Mesh(lineGeometry, lineMaterial);
          line.position.set(0, 40 - i * 24, 12);
          group.add(line);
          lines.push(line);
        }

        group.add(plate);
        geometries.push(plateGeometry, lineGeometry);
        materials.push(plateMaterial, lineMaterial);

        return { group, spin: 0.003, pulse: 0.3, lines };
      }

      const orbitGeometry = new THREE.TorusGeometry(size * 0.32, 4, 16, 120);
      const orbitMaterial = teal.clone();
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;

      const coreGeometry = new THREE.SphereGeometry(26, 24, 24);
      const coreMaterial = gold.clone();
      const core = new THREE.Mesh(coreGeometry, coreMaterial);

      const satelliteGeometry = new THREE.SphereGeometry(12, 16, 16);
      const satelliteMaterial = teal.clone();
      const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
      satellite.position.set(size * 0.32, 0, 0);

      group.add(orbit);
      group.add(core);
      group.add(satellite);

      geometries.push(orbitGeometry, coreGeometry, satelliteGeometry);
      materials.push(orbitMaterial, coreMaterial, satelliteMaterial);

      return { group, spin: 0.004, pulse: 0.35, satellite };
    };

    const createSlot = (slotConfig) => {
      const {
        wall = "right",
        x = 0,
        y = 0,
        z = 0,
        width = 360,
        height = 220,
        type = "orbit",
      } = slotConfig;

      const anchor = wallAnchors[wall] || wallAnchors.right;
      const slotGroup = new THREE.Group();
      slotGroup.position.set(x, y, z);
      anchor.add(slotGroup);

      const panelGeometry = new THREE.PlaneGeometry(width, height);
      const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0x08152c,
        metalness: 0.2,
        roughness: 0.5,
        emissive: 0x143b6a,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      slotGroup.add(panel);
      geometries.push(panelGeometry);
      materials.push(panelMaterial);

      const frameGeometry = new THREE.PlaneGeometry(width + 40, height + 40);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x23c79a,
        metalness: 0.55,
        roughness: 0.35,
        emissive: 0x1a6b56,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.z = -6;
      slotGroup.add(frame);
      geometries.push(frameGeometry);
      materials.push(frameMaterial);

      const content = createSlotContent(type, Math.min(width, height));
      content.group.position.set(0, 0, 24);
      slotGroup.add(content.group);

      slotInstances.push({
        panelMaterial,
        frameMaterial,
        content,
        slotGroup,
      });
    };

    resolvedSlots.forEach(createSlot);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      starPositions[i * 3] = (Math.random() - 0.5) * 3200;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = -800 - Math.random() * 2000;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x8fd9ff,
      size: 2.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    geometries.push(starGeometry);
    materials.push(starMaterial);

    let frameId = null;
    let mouseX = 0;
    let mouseY = 0;
    const clock = new THREE.Clock();

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      cssRenderer.setSize(innerWidth, innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const wallBreath = Math.sin(elapsed * 0.35) * 18;
      const wallShift = Math.cos(elapsed * 0.28) * 22;
      const wallTilt = Math.sin(elapsed * 0.22) * 0.03;
      const wallYaw = Math.cos(elapsed * 0.18) * 0.04;

      leftWall.position.x = -wallWidth / 2 + wallBreath;
      leftWall.rotation.y = Math.PI / 2 + wallYaw;
      rightWall.position.x = wallWidth / 2 - wallBreath;
      rightWall.rotation.y = -Math.PI / 2 - wallYaw;
      backWall.position.z = -roomDepth + wallShift;
      backWall.rotation.y = wallTilt;
      frontWall.position.z = roomDepth * 0.15 - wallShift * 0.4;
      frontWall.rotation.y = Math.PI - wallTilt;

      floor.position.y = -wallHeight / 2 + Math.sin(elapsed * 0.25) * 6;
      roomGroup.rotation.y = Math.sin(elapsed * 0.16) * 0.05;
      roomGroup.rotation.x = Math.cos(elapsed * 0.14) * 0.035;

      wallAnchors.back.position.copy(backWall.position);
      wallAnchors.back.rotation.copy(backWall.rotation);
      wallAnchors.front.position.copy(frontWall.position);
      wallAnchors.front.rotation.copy(frontWall.rotation);
      wallAnchors.left.position.copy(leftWall.position);
      wallAnchors.left.rotation.copy(leftWall.rotation);
      wallAnchors.right.position.copy(rightWall.position);
      wallAnchors.right.rotation.copy(rightWall.rotation);

      slotInstances.forEach((slot, index) => {
        const pulse = Math.sin(elapsed * 1.2 + index) * 0.12;
        slot.panelMaterial.emissiveIntensity = 0.35 + pulse;
        slot.frameMaterial.emissiveIntensity = 0.4 + pulse * 0.6;
        slot.slotGroup.rotation.z = Math.sin(elapsed * 0.5 + index) * 0.02;
        slot.content.group.rotation.y += slot.content.spin || 0.002;
        slot.content.group.rotation.x = Math.sin(elapsed * 0.7 + index) * 0.12;
        if (slot.content.satellite) {
          slot.content.satellite.position.x = Math.cos(elapsed * 1.2 + index) * 110;
          slot.content.satellite.position.z = Math.sin(elapsed * 1.2 + index) * 110;
        }
        if (slot.content.lines) {
          slot.content.lines.forEach((line, lineIndex) => {
            line.scale.x = 0.8 + Math.sin(elapsed * 1.3 + lineIndex + index) * 0.2;
          });
        }
      });

      stars.rotation.y = elapsed * 0.01;

      if (transitionRef.current) {
        const now = performance.now();
        const { start, duration, from, to } = transitionRef.current;
        const progress = Math.min((now - start) / duration, 1);
        const eased = easeInOut(progress);
        routeOffsetRef.current = {
          x: from.x + (to.x - from.x) * eased,
          y: from.y + (to.y - from.y) * eased,
          z: from.z + (to.z - from.z) * eased,
          rotX: from.rotX + (to.rotX - from.rotX) * eased,
          rotY: from.rotY + (to.rotY - from.rotY) * eased,
        };
        if (progress >= 1) transitionRef.current = null;
      }

      const cameraDriftX = Math.sin(elapsed * 0.22) * 80;
      const cameraDriftY = Math.cos(elapsed * 0.18) * 60;
      const cameraDriftZ = Math.sin(elapsed * 0.24) * 50;

      camera.position.x = cameraDriftX + mouseX * 60 + routeOffsetRef.current.x;
      camera.position.y = cameraDriftY - mouseY * 40 + routeOffsetRef.current.y;
      camera.position.z = 1200 + cameraDriftZ + routeOffsetRef.current.z;

      roomGroup.rotation.x += routeOffsetRef.current.rotX * 0.01;
      roomGroup.rotation.y += routeOffsetRef.current.rotY * 0.01;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      cssRenderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      renderer.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());

      if (renderer.domElement.parentNode === webglHost) {
        webglHost.removeChild(renderer.domElement);
      }

      if (cssRenderer.domElement.parentNode === cssHost) {
        cssHost.removeChild(cssRenderer.domElement);
      }
    };
  }, [resolvedSlots]);

  return (
    <div className="three-shell">
      <div ref={webglHostRef} className="three-webgl" />
      <div ref={cssHostRef} className="three-css" />
      <div ref={uiRef} className="three-ui" />
      {portalTarget
        ? ReactDOM.createPortal(
            <RoomMotionContext.Provider value={motionValue}>
              <SlotRegistryContext.Provider value={registryValue}>
                {children}
              </SlotRegistryContext.Provider>
            </RoomMotionContext.Provider>,
            portalTarget,
          )
        : null}
    </div>
  );
};

export default ThreeShell;
