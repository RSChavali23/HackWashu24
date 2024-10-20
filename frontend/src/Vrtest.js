import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';

function Vrtest() {
    const mountRef = useRef(null);

    useEffect(() => {
        // Set up the scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 1.6, 3);  // Position the camera at eye level (1.6 meters)

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;  // Enable WebXR
        mountRef.current.appendChild(renderer.domElement);

        // Add the VR button
        document.body.appendChild(VRButton.createButton(renderer));

        // Add a simple cube to the scene
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.z = -2;  // Position the cube 2 meters in front of the camera
        scene.add(cube);

        // Add light
        const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        light.position.set(0, 20, 0);
        scene.add(light);

        // Handle window resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.setAnimationLoop(() => {
                renderer.render(scene, camera);
            });
        };

        animate();

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{ width: '100%', height: '100vh', backgroundColor: 'black' }}
        />
    );
}

export default Vrtest;
