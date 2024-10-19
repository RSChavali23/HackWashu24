import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

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
    scene.background = new THREE.Color(0xD2B48C); // Tan color

    const camera = new THREE.PerspectiveCamera(
      75, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    camera.position.set(0, 2, 5); // Position the camera
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the origin

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

    // === 4. Add Helpers ===
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // === 5. Load MTL and OBJ Files ===
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('/assets/clothes/source/'); // Path to MTL file
    mtlLoader.load(
      'clothes.mtl',
      (materials) => {
        materials.preload(); // Preload materials

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials); // Assign materials to OBJLoader
        objLoader.setPath('/assets/clothes/source/'); // Path to OBJ file
        objLoader.load(
          'clothes.obj',
          (object) => {
            console.log('OBJ model loaded with MTL:', object);

            // Traverse the object to enable shadows
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            // === 6. Adjust Model Position ===
            // Move the model slightly to the right and down
            object.position.set(1, -1, 0); // x: 1 (right), y: -1 (down), z: 0

            object.scale.set(0.01, 0.01, 0.01); // Adjust scale based on your model
            scene.add(object);
            modelRef.current = object;

            setLoading(false); // Model has loaded
          },
          (xhr) => {
            console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
          },
          (error) => {
            console.error('An error occurred while loading the OBJ model with MTL:', error);
          }
        );
      },
      (xhr) => {
        console.log(`MTL Loading: ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error('An error occurred while loading the MTL file:', error);
      }
    );

    // === 7. Set Up OrbitControls ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable damping (inertia)
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation

    // === Enable Rotation, Disable Zoom and Pan ===
    controls.enableRotate = true; // Enable rotation
    controls.enableZoom = false;   // Disable zooming to prevent scrolling issues
    controls.enablePan = false;    // Disable panning to maintain layout

    // === 8. Animation Loop ===
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls for damping
      renderer.render(scene, camera);
    };
    animate();

    // === 9. Cleanup on Unmount ===
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

        // Dispose geometry
        if (object.geometry) object.geometry.dispose();

        // Dispose material
        if (object.material) {
          // If the material is an array, iterate through it
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => cleanMaterial(material));
          } else {
            cleanMaterial(object.material);
          }
        }
      });

      // Function to clean up materials and textures
      function cleanMaterial(material) {
        // Dispose textures if they exist
        for (const key in material) {
          if (material.hasOwnProperty(key)) {
            const value = material[key];
            if (value && typeof value === 'object' && 'minFilter' in value) {
              value.dispose();
              textureRefs.current = textureRefs.current.filter((tex) => tex !== value);
            }
          }
        }

        // Dispose the material itself
        material.dispose();
      }

      // Dispose any remaining textures
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
        height: '100vh', // Ensure the div takes full viewport height
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
          width: '100%',
          height: '40vh', // Allocate 40% of viewport height to the 3D scene
          margin: '0', // Remove default margin
        }}
      />

      {/* Text and Button Container */}
      <div
        style={{
          width: '100%',
          flex: 1, // Take up the remaining space
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center', // Center content vertically
          alignItems: 'center',     // Center content horizontally
          padding: '10px 0',        // Padding for spacing
          /* Optional: Add semi-transparent background for readability */
          backgroundColor: 'rgba(255, 255, 255, 0)', // Semi-transparent white
          pointerEvents: 'none', // Disable pointer events for the container
        }}
      >
        <h1
          style={{
            margin: '0 0 10px 0',
            fontSize: '1.5em',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)', // Enhance text readability
            pointerEvents: 'none', // Ensure text does not capture pointer events
          }}
        >
          Welcome to Your 3D Clothing Store
        </h1>
        <p
          style={{
            margin: '0 0 10px 0',
            fontSize: '1em',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)', // Enhance text readability
            pointerEvents: 'none', // Ensure text does not capture pointer events
          }}
        >
          Explore our wardrobe in 3D.
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
