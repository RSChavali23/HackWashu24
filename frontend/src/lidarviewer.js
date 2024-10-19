import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const LidarViewer = ({ isVisible, lidarFilePath }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // Load your 3D LiDAR scan here
    const loader = new GLTFLoader();
    loader.load(
      lidarFilePath,
      (gltf) => {
        console.log('Model loaded successfully:', gltf);
        scene.add(gltf.scene);
        console.log('Scene after adding model:', scene);
      },
      undefined,
      (error) => {
        console.error('An error happened while loading the model:', error);
      }
    );

    camera.position.set(0, 1, 5); // Adjust camera position

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, [isVisible, lidarFilePath]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default LidarViewer;