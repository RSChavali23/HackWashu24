import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';

const VISIBLE_COUNT = 4; // Number of clothes visible at once

function Thrift({ addToCart }) {
    const [clothes, setClothes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [windowStart, setWindowStart] = useState(0); // Start index of the current window
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const objectsRef = useRef([]); // Currently loaded and visible objects
    const groupRef = useRef(new THREE.Group()); // Group to contain visible clothes
    const cameraGroupRef = useRef(new THREE.Group()); // Group to hold the camera

    // For interactivity
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const hoveredObject = useRef(null);
    const composer = useRef(null);
    const outlinePass = useRef(null);

    // Cache for loaded models to prevent reloading
    const modelCache = useRef({});

    // VR detection state
    const [isVR, setIsVR] = useState(false);

    // Define fixed positions along the cylinder (adjust as needed)
    const fixedPositions = [
        { position: new THREE.Vector3(-25, -10, 4), rotation: new THREE.Euler(0, Math.PI / 4, 0) },
        { position: new THREE.Vector3(-10, -10, 4), rotation: new THREE.Euler(0, Math.PI / 4, 0) },
        { position: new THREE.Vector3(5, -10, 4), rotation: new THREE.Euler(0, Math.PI / 4, 0) },
        { position: new THREE.Vector3(20, -10, 4), rotation: new THREE.Euler(0, Math.PI / 4, 0) },
    ];

    // Fetch clothes data from the backend
    useEffect(() => {
        fetch('https://hackwashu24.onrender.com/getClothes')
            .then(response => response.json())
            .then(data => {
                setClothes(data.clothes);
                setLoading(false);

                // Preload all models after data is fetched
                data.clothes.forEach((_, index) => {
                    preloadModel(index);
                });
            })
            .catch(error => {
                console.error('Error fetching clothes:', error);
                setLoading(false); // Stop loading if fetch fails
            });
    }, []);

    const preloadModel = (index) => {
        const item = clothes[index];
        const modelPath = 'https://hackwashu24.onrender.com/3Doutput/' + item.photo_filename;

        // Only preload if it's not already in the cache
        if (!modelCache.current[modelPath]) {
            const loader = new OBJLoader();
            loader.load(
                modelPath,
                (object) => {
                    const box = new THREE.Box3().setFromObject(object);
                    const objectHeight = box.max.y - box.min.y;
                    const desiredHeight = 10;
                    const scaleFactor = desiredHeight / objectHeight;
                    object.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    object.traverse((child) => {
                        if (child.isMesh) {
                            child.material.side = THREE.DoubleSide;
                            child.userData = { item };
                        }
                    });

                    // Cache the loaded model
                    modelCache.current[modelPath] = object.clone();
                },
                undefined,
                (error) => console.error(`Error preloading model ${modelPath}:`, error)
            );
        }
    };

    // Initialize Three.js scene, camera, renderer, lights, controls, and post-processing
    useEffect(() => {
        if (clothes.length === 0) return;

        // Initialize scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Set a non-white background color
        scene.background = new THREE.Color(0xeae7dc); // You can change this to any color you prefer

        // Initialize camera
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 0); // Reset camera position relative to the group

        // Create a group to hold the camera
        const cameraGroup = new THREE.Group();
        cameraGroup.add(camera);
        scene.add(cameraGroup);
        cameraGroupRef.current = cameraGroup;

        // Set initial position of the camera group
        cameraGroup.position.set(30, -2, 15); // Adjust as needed to set the starting location

        // Initialize renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.xr.enabled = true;
        mountRef.current.appendChild(renderer.domElement);

        // Add VRButton to enable VR mode
        document.body.appendChild(VRButton.createButton(renderer));

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

        // Add FXAA anti-aliasing
        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.uniforms['resolution'].value.set(
            1 / mountRef.current.clientWidth,
            1 / mountRef.current.clientHeight
        );
        composer.current.addPass(fxaaPass);

        // Add ambient and directional light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
        directionalLight.position.set(10, 10, 10);
        directionalLight.target.position.set(0, 0, 0); // Point towards the origin
        scene.add(directionalLight);
        scene.add(directionalLight.target); // Add the target to the scene

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
        cylinder.position.set(0, 0, 0); // Adjust Y to place it at the desired height

        // Add the cylinder to the scene
        scene.add(cylinder);

        // === Add the Vertical Cylinders ===

        // Define vertical cylinder parameters
        const verticalCylinderRadius = 0.2; // Adjust as needed
        const verticalCylinderHeight = 20; // Adjust as needed
        const verticalRadialSegments = 32; // Smoothness

        // Create vertical cylinder geometry and material
        const verticalCylinderGeometry = new THREE.CylinderGeometry(
            verticalCylinderRadius,
            verticalCylinderRadius,
            verticalCylinderHeight,
            verticalRadialSegments
        );
        const verticalCylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.5 });

        // Create the first vertical cylinder mesh
        const verticalCylinder1 = new THREE.Mesh(verticalCylinderGeometry, verticalCylinderMaterial);
        verticalCylinder1.position.set(-cylinderHeight / 2, -verticalCylinderHeight / 2, 0); // Position at one end of the horizontal cylinder

        // Create the second vertical cylinder mesh
        const verticalCylinder2 = new THREE.Mesh(verticalCylinderGeometry, verticalCylinderMaterial);
        verticalCylinder2.position.set(cylinderHeight / 2, -verticalCylinderHeight / 2, 0); // Position at the other end of the horizontal cylinder

        // Add the vertical cylinders to the scene
        scene.add(verticalCylinder1);
        scene.add(verticalCylinder2);

        // === Add Floor and Walls ===

        const createFloor = () => {
            const floorSize = 100;
            const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);

            const textureLoader = new THREE.TextureLoader();
            const floorTexture = textureLoader.load('assets/floor.jpg'); // Replace with your texture path
            floorTexture.wrapS = THREE.RepeatWrapping;
            floorTexture.wrapT = THREE.RepeatWrapping;
            floorTexture.repeat.set(100 / 10, 100 / 10); // Adjust repeat to scale texture based on wall dimensions

            const floorMaterial = new THREE.MeshStandardMaterial({ 
                map: floorTexture,
                metalness: 0.2, 
                roughness: 0.8 
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2; // Rotate to lie flat
            floor.position.y = -15; // Position below the rack
            floor.receiveShadow = true; // Enable receiving shadows
            return floor;
        };

        const createWall = (width, height, position, rotation) => {
            const wallGeometry = new THREE.PlaneGeometry(width, height);
            
            // Load texture
            const textureLoader = new THREE.TextureLoader();
            const wallTexture = textureLoader.load('assets/wall.jpg'); // Replace with your texture path
            wallTexture.wrapS = THREE.RepeatWrapping;
            wallTexture.wrapT = THREE.RepeatWrapping;
            wallTexture.repeat.set(width / 10, height / 10); // Adjust repeat to scale texture based on wall dimensions

            const wallMaterial = new THREE.MeshStandardMaterial({ 
                map: wallTexture,
                metalness: 0.2, 
                roughness: 0.8 
            });
            
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(position.x, position.y, position.z);
            wall.rotation.set(rotation.x, rotation.y, rotation.z);
            wall.receiveShadow = true; // Enable receiving shadows
            return wall;
        };

        const floor = createFloor();
        scene.add(floor);

        // Add four walls around the floor
        const wallHeight = 30;
        const wallWidth = 100;

        const backWall = createWall(wallWidth, wallHeight, { x: 0, y: 0, z: -50 }, { x: 0, y: 0, z: 0 });
        const frontWall = createWall(wallWidth, wallHeight, { x: 0, y: 0, z: 50 }, { x: 0, y: Math.PI, z: 0 });
        const leftWall = createWall(wallWidth, wallHeight, { x: -50, y: 0, z: 0 }, { x: 0, y: Math.PI / 2, z: 0 });
        const rightWall = createWall(wallWidth, wallHeight, { x: 50, y: 0, z: 0 }, { x: 0, y: -Math.PI / 2, z: 0 });

        scene.add(backWall);
        scene.add(frontWall);
        scene.add(leftWall);
        scene.add(rightWall);

        // Add the group containing clothes to the scene
        scene.add(groupRef.current);

        // Add OrbitControls for non-VR interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // for smoother controls
        controls.target.set(20, -5, 0);  // Point the controls at the origin of the scene
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

        // Mouse move and click handlers
        const onMouseMove = (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };

        const onClick = (event) => {
            if (hoveredObject.current) {
                const item = hoveredObject.current.userData.item;
                // Add the clicked item to the cart
                addToCart(item);
                alert(`Added ${item.type} to cart!`);
            }
        };

        // Add event listeners
        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('click', onClick);

        // === VR Camera Movement Setup ===

        // Initialize controllers
        const controller1 = renderer.xr.getController(0);
        const controller2 = renderer.xr.getController(1);
        scene.add(controller1);
        scene.add(controller2);

        // Function to handle controller input for movement
        const handleControllerInput = () => {
            const session = renderer.xr.getSession();
            if (!session) return;

            const inputSources = session.inputSources;
            inputSources.forEach((input) => {
                if (input.gamepad) {
                    const gp = input.gamepad;
                    const axes = gp.axes;

                    // Example: axes[0] for left/right, axes[1] for forward/back
                    const movementSpeed = 0.1;
                    cameraGroup.position.x += axes[0] * movementSpeed;
                    cameraGroup.position.z += axes[1] * movementSpeed;
                }
            });
        };

        // VR session event listeners
        renderer.xr.addEventListener('sessionstart', () => {
            setIsVR(true);
            controls.enabled = false; // Disable OrbitControls in VR
        });

        renderer.xr.addEventListener('sessionend', () => {
            setIsVR(false);
            controls.enabled = true; // Re-enable OrbitControls when exiting VR
        });

        // Animation loop
        const animate = () => {
            renderer.setAnimationLoop(() => {
                // Update Raycaster
                raycaster.current.setFromCamera(mouse.current, camera);
                const intersects = raycaster.current.intersectObjects(groupRef.current.children, true); // Only intersect with clothes

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

                if (isVR) {
                    // Handle VR movement inputs
                    handleControllerInput();
                } else {
                    // Update OrbitControls when not in VR
                    controls.update();
                }

                // Render the scene
                if (renderer.xr.isPresenting) {
                    renderer.render(scene, camera);
                } else {
                    composer.current.render();
                }
            });
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
    }, [clothes]); // Only run when clothes data changes

    // Function to load a single model
    const loadModel = (index) => {
        return new Promise((resolve, reject) => {
            const item = clothes[index];
            const modelPath = 'https://hackwashu24.onrender.com/3Doutput/' + item.photo_filename;

            // Check if the model is already cached
            if (modelCache.current[modelPath]) {
                resolve(modelCache.current[modelPath].clone());
            } else {
                const loader = new OBJLoader();
                loader.load(
                    modelPath,
                    (object) => {
                        // Calculate bounding box to get the height of the object
                        const box = new THREE.Box3().setFromObject(object);
                        const objectHeight = box.max.y - box.min.y;

                        // Determine appropriate scale based on desired height
                        const desiredHeight = 10;
                        const scaleFactor = desiredHeight / objectHeight;
                        object.scale.set(scaleFactor, scaleFactor, scaleFactor);

                        // Traverse through the object meshes and make adjustments
                        object.traverse((child) => {
                            if (child.isMesh) {
                                child.material.side = THREE.DoubleSide;
                                child.userData = { item }; // Attach item data for later use
                            }
                        });

                        // Cache the loaded model
                        modelCache.current[modelPath] = object.clone();

                        resolve(object);
                    },
                    (xhr) => {
                        console.log(`${item.type} model ${(xhr.loaded / xhr.total) * 100}% loaded`);
                    },
                    (error) => {
                        console.error(`Error loading model ${modelPath}:`, error);
                        reject(error);
                    }
                );
            }
        });
    };

    // Function to add models to the scene based on the current window
    const loadVisibleModels = async () => {
        // Remove existing objects from the scene
        objectsRef.current.forEach(obj => {
            groupRef.current.remove(obj);
            // Dispose geometry and materials
            obj.traverse(child => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            });
        });
        objectsRef.current = [];

        // Determine the indices of clothes to display
        const indices = [];
        for (let i = 0; i < VISIBLE_COUNT; i++) {
            const idx = (windowStart + i) % clothes.length;
            indices.push(idx);
        }

        // Load and add each visible model
        for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            try {
                const object = await loadModel(index);
                // Position the object at the fixed position
                object.position.copy(fixedPositions[i].position);
                object.rotation.copy(fixedPositions[i].rotation);
                objectsRef.current.push(object);
                groupRef.current.add(object);
            } catch (error) {
                console.error(`Failed to load model at index ${index}:`, error);
            }
        }

        setLoading(false);
    };

    // Load visible models when clothes data or windowStart changes
    useEffect(() => {
        if (clothes.length === 0) return;
        loadVisibleModels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowStart, clothes]);

    // Handler for arrow button clicks
    const handleArrowClick = (direction) => {
        if (clothes.length === 0) return;

        if (direction === 'left') {
            // Move window forward
            setWindowStart((prevStart) => (prevStart + 1) % clothes.length);
        } else if (direction === 'right') {
            // Move window backward
            setWindowStart((prevStart) => (prevStart - 1 + clothes.length) % clothes.length);
        }
    };

    return (
        <div style={{ color: 'white', backgroundColor: '#121212', minHeight: '80vh', width: '100%', position: 'relative' }}>

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
                        zIndex: 1,
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
                        padding: '16px',
                        paddingBottom: '18px',
                    
                        zIndex: 1,
                    }}
                    onClick={() => handleArrowClick('left')}
                    aria-label="Cycle Left"
                >
                   {'<'}
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
                        padding: '16px',
                        paddingBottom: '18px',
                        
                        zIndex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                    onClick={() => handleArrowClick('right')}
                    aria-label="Cycle Right"
                >
                    {'>'}
                </button>
            </div>
        </div>
    );
}

export default Thrift;
