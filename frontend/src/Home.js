import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

//hack-washu24.vercel.app
//https://hackwashu24.onrender.com/'
//thrift3d-git-main-rahul-chavalis-projects-f65fea19.vercel.app

function Home() {
  const sceneRef = useRef();
  const rendererRef = useRef();
  const modelRef = useRef();
  const textureRefs = useRef([]); // To keep track of loaded textures for cleanup
  const [loading, setLoading] = useState(true); // State for loading indicator

  const handleThriftClick = () => {
    window.location.href = '/thrift';
  };

  useEffect(() => {
    // === 1. Scene, Camera, Renderer Setup ===
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xeae7dc); // Set background color to black

    const camera = new THREE.PerspectiveCamera(
      75, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );

    // === Adjust the Camera to look from above ===
    camera.position.set(0, 5, 0); // Move the camera above the cube
    camera.lookAt(0, 0, 0); // Look directly at the center

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sceneRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === 2. Handle Window Resize ===
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // === 3. Add Lights ===
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true; // Enable shadows for this light
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);



    // === 5. Add Cube in the Center of the Scene ===
    const cubeGeometry = new THREE.BoxGeometry(1.25, 1.25, 1.25); // Create a cube with dimensions 1x1x1
    const cubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x62aedd, // Dark gray/black color
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true; // Enable shadows for the cube
    cube.receiveShadow = true; // The cube will also receive shadows
    cube.position.set(-0, 0, -2); // Center the cube
    scene.add(cube);

    // === 6. Set Up OrbitControls (Look from Above and Disable Rotation) ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false; // Disable manual rotation since the cube will spin
    controls.enableZoom = false;   // Disable zooming
    controls.enablePan = false;    // Disable panning
    controls.update(); // Ensure the controls are updated after setting the camera position

    // === 7. Animation Loop (Make the Cube Spin) ===
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01; // Rotate cube around the X-axis
      cube.rotation.y += 0.01; // Rotate cube around the Y-axis
      controls.update(); // Update controls for damping
      renderer.render(scene, camera);
    };
    animate();

    // === 8. Cleanup on Unmount ===
    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current && rendererRef.current) {
        sceneRef.current.removeChild(rendererRef.current.domElement);
      }

      // Dispose renderer
      renderer.dispose();

      // Traverse the scene and dispose geometries, materials, and textures
      scene.traverse((object) => {
        if (!object.isMesh) return;

        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => cleanMaterial(material));
          } else {
            cleanMaterial(object.material);
          }
        }
      });

      function cleanMaterial(material) {
        for (const key in material) {
          if (material.hasOwnProperty(key)) {
            const value = material[key];
            if (value && typeof value === 'object' && 'minFilter' in value) {
              value.dispose();
              textureRefs.current = textureRefs.current.filter((tex) => tex !== value);
            }
          }
        }
        material.dispose();
      }

      textureRefs.current.forEach((texture) => {
        texture.dispose();
      });
      textureRefs.current = [];
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div
      style={{
        textAlign: 'center',
        color: 'black',
        width: '100%',
        height: '90vh', // Ensure the div takes full viewport height
        overflow: 'hidden', // Prevent scrolling
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center content horizontally
        position: 'relative', // To position child elements if needed
      }}
    >
      {/* 3D Scene Container */}
      <div
        ref={sceneRef}
        style={{

          height: '40vh', // Allocate 40% of viewport height to the 3D scene
          margin: '0', // Remove default margin
        }}
      />

  
      {/* Text and Button Container */}
      <div>
        <h1
          style={{
            margin: '0 0 10px 0',
            fontSize: '1.5em',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)', // Enhance text readability
          }}
        >
          Welcome to The One and Only 3D Clothing Store
        </h1>
        <p
          style={{
            margin: '0 0 10px 0',
            fontSize: '1em',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)', // Enhance text readability
          }}
        >
          Enhance your catalog by displaying in 3D.
        </p>
        <button
          onClick={handleThriftClick}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            fontSize: '1em',
            cursor: 'pointer',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#333',
            color: '#fff',
          }}
        >
          Thrift Now
        </button>
      </div>
    </div>
  );
}

export default Home;
