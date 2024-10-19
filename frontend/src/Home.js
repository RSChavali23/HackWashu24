import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// Import only GLTFLoader since we are not using OBJLoader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function Home() {
  const sceneRef = useRef();
  const rendererRef = useRef();
  const modelRef = useRef();
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  
  const handleThriftClick = () => {
    window.location.href = '/thrift';
  };

  useEffect(() => {
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xD2B48C); // Tan color

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    camera.position.z = 5;

    const maxVerticalRotation = THREE.MathUtils.degToRad(25); // Convert degrees to radians

    // Load the GLTF model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      'frontend/assets/clothes (1)/scene.gltf', // Update this path based on your structure
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0); // Adjust position if necessary
        model.scale.set(10, 10, 1); // Scale down if needed
        scene.add(model);
        modelRef.current = model; // Store the model reference
      },
      undefined,
      (error) => {
        console.error('An error occurred while loading the GLTF model:', error);
      }
    );

    // Mouse down event listener
    const onMouseDown = (event) => {
      isDragging.current = true;
      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    };

    // Mouse move event listener
    const onMouseMove = (event) => {
      if (!isDragging.current || !modelRef.current) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.current.x,
        y: event.clientY - previousMousePosition.current.y,
      };

      // Update model rotation based on mouse movement
      modelRef.current.rotation.y += deltaMove.x * 0.01; // Rotate around Y-axis
      modelRef.current.rotation.x += deltaMove.y * 0.01; // Inverted: Rotate around X-axis
      
      // Lock vertical rotation between -25 and 25 degrees
      modelRef.current.rotation.x = THREE.MathUtils.clamp(modelRef.current.rotation.x, -maxVerticalRotation, maxVerticalRotation);

      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    };

    // Mouse up event listener
    const onMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Clean up on component unmount
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (sceneRef.current && rendererRef.current) {
        sceneRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', color: 'black' }}>
      <div ref={sceneRef} style={{ width: '100%', height: '400px', margin: '20px 0' }} />
      <h1>Welcome to Your 3D Clothing Store</h1>
      <p>Explore our wardrobe in 3D.</p>
      <button onClick={handleThriftClick} style={{ marginTop: '10px' }}>
        Thrift Now
      </button>
    </div>
  );
}

export default Home;
