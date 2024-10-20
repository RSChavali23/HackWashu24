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

    // Set a non-white background color (e.g., dark gray)
    scene.background = new THREE.Color(0xD2B48C); // You can change this to any color you prefer

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    // Set the initial camera position (x, y, z)
    camera.position.set(0, 0, 20); // Adjusted for better initial view

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Initialize EffectComposer for post-processing (OutlinePass)
    composer.current = new EffectComposer(renderer);
    composer.current.addPass(new RenderPass(scene, camera));

    // OutlinePass parameters: scene, camera, selected objects
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

    // Add ambient and directional light
    const ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // === Add the Horizontal Cylinder ===

    // Define cylinder parameters
    const cylinderRadiusTop = 0.2; // Adjust as needed
    const cylinderRadiusBottom = 0.2; // Same as top for uniformity
    const cylinderHeight = 60; // Long cylinder
    const radialSegments = 32; // Smoothness

    // Create cylinder geometry and material
    const cylinderGeometry = new THREE.CylinderGeometry(
      cylinderRadiusTop,
      cylinderRadiusBottom,
      cylinderHeight,
      radialSegments
    );
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.5 });

    // Create the cylinder mesh
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

    // Rotate the cylinder to make it horizontal (aligned along X-axis)
    cylinder.rotation.z = Math.PI / 2; // 90 degrees in radians

    // Position the cylinder in the scene
    cylinder.position.set(0, 5, 0); // Adjust Y to place it at the desired height

    // Optional: Add shadows if your scene uses them
    // renderer.shadowMap.enabled = true;
    // cylinder.castShadow = true;
    // cylinder.receiveShadow = true;

    // Add the cylinder to the scene
    scene.add(cylinder);

    // Initialize OBJLoader
    const loader = new OBJLoader();

    // Function to load each model
    clothes.forEach((item, index) => {
      const modelPath = 'http://127.0.0.1:5000/3Doutput/' + item.photo_filename; // Ensure each item has a 'modelPath' property

      loader.load(
        modelPath,
        (object) => {
          object.traverse((child) => {
            if (child.isMesh) {
              child.material.side = THREE.DoubleSide; // Set material to double-sided
              child.userData = { item }; // Attach item data for later use
            }
          });
          // Optional: Positioning each model based on index to avoid overlap

          object.position.x = (index % 5) * 5 - 10 + offset; // Initial positioning
          object.position.y = -5;
          object.position.z = -4;
          object.rotateY(-Math.PI / 4); // Rotate the model if needed

          // Optional: Scale the model
          object.scale.set(0.05, 0.05, 0.05); // Adjust as needed

        // Save the object reference
        objectsRef.current.push(object);

          scene.add(object);

          // Update loading count
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
          // Even if there's an error, consider the model as "loaded" to prevent indefinite loading
          loadedCount.current += 1;
          if (loadedCount.current === clothes.length) {
            setLoading(false);
          }
        }
      );
    });

    // Add OrbitControls for better interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // for smoother controls
    controls.target.set(0, 0, 0);  // Point the controls at the origin of the scene
    controls.update();

    // Handle window resize
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        composer.current.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        // Update FXAA Pass resolution
        fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height);
      }
    };
    window.addEventListener('resize', handleResize);

    // Mouse move handler
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    // Click handler
    const onClick = (event) => {
      if (hoveredObject.current) {
        const item = hoveredObject.current.userData.item;
        // Perform your desired action here. For example:
        alert(`You clicked on: ${item.type}`);
        // Or navigate to a detail page, etc.
      }
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update Raycaster
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        // Find the first intersected object that has userData.item
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

      controls.update(); // only required if controls.enableDamping = true
      composer.current.render();
    };
    animate();

    // Clean up on component unmount
    return () => {
        // Remove renderer.domElement only if mountRef.current exists and contains renderer.domElement
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
    
        // Remove event listeners
        window.removeEventListener('resize', handleResize);
        if (renderer.domElement) {
          renderer.domElement.removeEventListener('mousemove', onMouseMove);
          renderer.domElement.removeEventListener('click', onClick);
        }
    
        // Dispose of Three.js renderer to free up resources
        renderer.dispose();
      };
  }, [clothes]);

  useEffect(() => {
    // This effect runs whenever the offset changes, updating the position of the objects
    objectsRef.current.forEach((object, index) => {
      object.position.x = (index % 5) * 5 - 10 + offset; // Update position with the new offset
    });
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
          }}
          onClick={() => handleArrowClick('left')}
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
          }}
          onClick={() => handleArrowClick('right')}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default Thrift;
