import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

function Thrift() {
    const [clothes, setClothes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0); // New state for offset
    const mountRef = useRef(null);
    const loadedCount = useRef(0);
    
    const sceneRef = useRef(null); // Ref to hold the scene
    const objectsRef = useRef([]); // Ref to hold all the loaded objects
    const groupRef = useRef(new THREE.Group()); // Group to contain all clothes

    // For interactivity
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const hoveredObject = useRef(null);
    const composer = useRef(null);
    const outlinePass = useRef(null);

    // Fetch clothes data from the backend
    useEffect(() => {
        fetch('http://localhost:5000/getClothes')
          .then(response => response.json())
          .then(data => setClothes(data.clothes))
          .catch(error => {
            console.error('Error fetching clothes:', error);
            setLoading(false); // Stop loading if fetch fails
          });
    }, []);

    useEffect(() => {
      if (clothes.length === 0) return;
  
      setLoading(true);
      loadedCount.current = 0;
  
      // Initialize scene, camera, and renderer
      const scene = new THREE.Scene();
      sceneRef.current = scene;
  
      const camera = new THREE.PerspectiveCamera(
          75,
          mountRef.current.clientWidth / mountRef.current.clientHeight,
          0.1,
          1000
      );
  
      // Set the initial camera position (x, y, z)
      camera.position.set(0, 10, 30); // Adjusted for better room-like view
  
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      mountRef.current.appendChild(renderer.domElement);
  
      // Initialize EffectComposer for post-processing (OutlinePass)
      composer.current = new EffectComposer(renderer);
      composer.current.addPass(new RenderPass(scene, camera));
  
      outlinePass.current = new OutlinePass(
          new THREE.Vector2(mountRef.current.clientWidth, mountRef.current.clientHeight),
          scene,
          camera
      );
      outlinePass.current.edgeStrength = 3.0;
      outlinePass.current.edgeGlow = 0.0;
      outlinePass.current.edgeThickness = 1.0;
      outlinePass.current.visibleEdgeColor.set('#ffffff'); // Color of the outline
      outlinePass.current.hiddenEdgeColor.set('#190a05'); // Color for hidden edges
      composer.current.addPass(outlinePass.current);
  
      // Optional: Add FXAA anti-aliasing
      const fxaaPass = new ShaderPass(FXAAShader);
      fxaaPass.uniforms['resolution'].value.set(
          1 / mountRef.current.clientWidth,
          1 / mountRef.current.clientHeight
      );
      composer.current.addPass(fxaaPass);
  
      // === Lighting Setup ===
      const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); // Brighter ambient light
      scene.add(ambientLight);
  
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0); // More intense
      directionalLight.position.set(0, 20, 10);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
  
      // Spotlights to create additional brightness
      const spotLight1 = new THREE.SpotLight(0xffffff, 1.5);
      spotLight1.position.set(-30, 50, 30);
      spotLight1.angle = Math.PI / 6;
      spotLight1.castShadow = true;
      scene.add(spotLight1);
  
      const spotLight2 = new THREE.SpotLight(0xffffff, 1.5);
      spotLight2.position.set(30, 50, -30);
      spotLight2.angle = Math.PI / 6;
      spotLight2.castShadow = true;
      scene.add(spotLight2);
  
      // === Add Lighter Tan Floor ===
      const floorGeometry = new THREE.PlaneGeometry(100, 100);
      const floorMaterial = new THREE.MeshStandardMaterial({
          color: 0xD2B48C, // Lighter tan color for the floor
          roughness: 0.8,
          metalness: 0.2
      });
  
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
      floor.position.y = -5; // Adjust Y position to act as the ground
      floor.receiveShadow = true;
  
      scene.add(floor);
  
      // === Add Dark Tan Walls ===
      const wallMaterial = new THREE.MeshStandardMaterial({
          color: 0x8B5E3C, // Dark tan color for the walls
          roughness: 0.9,
          metalness: 0.1
      });

      const wallGeometry = new THREE.PlaneGeometry(100, 50);

      // Create four walls and position them around the floor
      const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
      backWall.position.set(0, 20, -50);
      backWall.receiveShadow = true;
      scene.add(backWall);

      const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
      frontWall.position.set(0, 20, 50);
      frontWall.rotation.y = Math.PI; // Rotate to face the opposite direction
      frontWall.receiveShadow = true;
      scene.add(frontWall);

      const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
      leftWall.position.set(-50, 20, 0);
      leftWall.rotation.y = Math.PI / 2; // Rotate 90 degrees for the side wall
      leftWall.receiveShadow = true;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
      rightWall.position.set(50, 20, 0);
      rightWall.rotation.y = -Math.PI / 2; // Rotate -90 degrees for the other side wall
      rightWall.receiveShadow = true;
      scene.add(rightWall);
  
      // === Add the Horizontal Cylinder ===
      const cylinderRadiusTop = 0.2; // Adjust as needed
      const cylinderRadiusBottom = 0.2; // Same as top for uniformity
      const cylinderHeight = 60; // Long cylinder
      const radialSegments = 32; // Smoothness
  
      const cylinderGeometry = new THREE.CylinderGeometry(
          cylinderRadiusTop,
          cylinderRadiusBottom,
          cylinderHeight,
          radialSegments
      );
      const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.5 });
  
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      cylinder.rotation.z = Math.PI / 2; // 90 degrees in radians
      cylinder.position.set(0, 5, 0); // Adjust Y to place it at the desired height
      cylinder.receiveShadow = true;
  
      scene.add(cylinder);
  
      // Initialize OBJLoader
      const loader = new OBJLoader();
  
      // Add the group to the scene
      scene.add(groupRef.current);
  
      // Load models and add them to the scene
      clothes.forEach((item, index) => {
          const modelPath = 'http://127.0.0.1:5000/3Doutput/' + item.photo_filename; // Ensure each item has a 'modelPath' property
  
          loader.load(
              modelPath,
              (object) => {
                  object.traverse((child) => {
                      if (child.isMesh) {
                          child.material.side = THREE.DoubleSide; // Set material to double-sided
                          child.userData = { item }; // Attach item data for later use
                          child.castShadow = true;
                          child.receiveShadow = true;
                      }
                  });
  
                  const positionX = (index % 5) * 5 - 10; // Initial positioning without offset
                  object.position.set(positionX, -5, -4);
                  object.rotateY(-Math.PI / 4); // Rotate the model if needed
                  object.scale.set(0.05, 0.05, 0.05); // Adjust as needed
  
                  objectsRef.current.push(object);
                  groupRef.current.add(object);
  
                  loadedCount.current += 1;
                  if (loadedCount.current === clothes.length) {
                      setLoading(false);
                  }
              },
              (xhr) => {
                  console.log(`${item.type} model ${(xhr.loaded / xhr.total) * 100}% loaded`);
              },
              (error) => {
                  console.error(`Error loading model ${modelPath}:`, error);
                  loadedCount.current += 1;
                  if (loadedCount.current === clothes.length) {
                      setLoading(false);
                  }
              }
          );
      });
  
      // Add OrbitControls for better interaction
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(0, 0, 0);
      controls.update();
  
      const handleResize = () => {
          if (mountRef.current) {
              const width = mountRef.current.clientWidth;
              const height = mountRef.current.clientHeight;
              renderer.setSize(width, height);
              composer.current.setSize(width, height);
              camera.aspect = width / height;
              camera.updateProjectionMatrix();
              fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height);
          }
      };
      window.addEventListener('resize', handleResize);
  
      const onMouseMove = (event) => {
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      };
  
      const onClick = (event) => {
          if (hoveredObject.current) {
              const item = hoveredObject.current.userData.item;
              alert(`You clicked on: ${item.type}`);
          }
      };
  
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onClick);
  
      const animate = () => {
          requestAnimationFrame(animate);
  
          raycaster.current.setFromCamera(mouse.current, camera);
          const intersects = raycaster.current.intersectObjects(groupRef.current.children, true);
  
          if (intersects.length > 0) {
              const intersected = intersects.find(intersect => intersect.object.userData.item);
              if (intersected) {
                  if (hoveredObject.current !== intersected.object) {
                      hoveredObject.current = intersected.object;
                      outlinePass.current.selectedObjects = [intersected.object];
                  }
              } else {
                  hoveredObject.current = null;
                  outlinePass.current.selectedObjects = [];
              }
          } else {
              hoveredObject.current = null;
              outlinePass.current.selectedObjects = [];
          }
  
          controls.update();
          composer.current.render();
      };
      animate();
  
      return () => {
          if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
              mountRef.current.removeChild(renderer.domElement);
          }
          window.removeEventListener('resize', handleResize);
          if (renderer.domElement) {
              renderer.domElement.removeEventListener('mousemove', onMouseMove);
              renderer.domElement.removeEventListener('click', onClick);
          }
          renderer.dispose();
      };
  }, [clothes]);
  
    useEffect(() => {
        // This effect runs whenever the offset changes, updating the position of the group
        groupRef.current.position.x = offset;
    }, [offset]);

    const handleArrowClick = (direction) => {
        console.log('Offset:', offset);
        const shiftAmount = 5;
        if (direction === 'left') {
          setOffset((prevOffset) => prevOffset + shiftAmount);
        } else if (direction === 'right') {
          setOffset((prevOffset) => prevOffset - shiftAmount);
        }
    };

    return (
        <div style={{ color: 'white', backgroundColor: '#121212', minHeight: '100vh', width: '100%', position: 'relative' }}>

          {/* Container for the 3D scene */}
          <div
            ref={mountRef}
            style={{
              width: '100%',
              height: '650px',
              backgroundColor: '#1e1e1e', // Match the Three.js scene background
              display: 'block',
              margin: '0 auto',
              position: 'relative',
            }}
          >
            {loading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontSize: '24px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: '10px 20px',
                borderRadius: '5px',
              }}>
                Loading...
              </div>
            )}
            {/* Left and Right Arrow Buttons */}
            <button
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px',
                padding: '10px',
                borderRadius: '50%',
              }}
              onClick={() => handleArrowClick('left')}
              aria-label="Move Left"
            >
              ◀
            </button>
            <button
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px',
                padding: '10px',
                borderRadius: '50%',
              }}
              onClick={() => handleArrowClick('right')}
              aria-label="Move Right"
            >
              ▶
            </button>
          </div>
        </div>
    );
}

export default Thrift;
