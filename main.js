import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "jsm/loaders/RGBELoader.js";
import { MeshoptDecoder } from "jsm/libs/meshopt_decoder.module.js"; 
document.addEventListener("DOMContentLoaded", function () {
    // Get the container div
    const container = document.getElementById("three-container");
    if (!container) {
        console.error("Container div not found!");
        return;
    }

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(1, 1.2, 1.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Load HDRI for reflections
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load("abandoned_tank_farm_05_1k.hdr", (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = null;
         // ✅ Rotate HDRI using matrix transformation
        texture.rotation = Math.PI ;  // Adjust the angle as needed
        texture.center.set(0.5, 0.5); // Center rotation
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// 🔥 Reduce intensity of shadow-casting lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// ✅ Reduce shadow map size to improve performance
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
directionalLight.shadow.mapSize.width = 1024; // Default is 2048, reducing it speeds up rendering
directionalLight.shadow.mapSize.height = 1024;


    // Floor
    const floorGeometry = new THREE.PlaneGeometry(0, 0);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.9,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -5;
    floor.receiveShadow = true;
    scene.add(floor);
    
    
    // Load GLTF Model
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
loader.load(
    "NOBITHA_OPTIMIZED.glb",
    (gltf) => {
        console.log("✅ GLB Loaded Successfully");
        scene.add(gltf.scene);
    },
    undefined,
    (error) => console.error("❌ GLB Load Error:", error)
);
    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
    }
    animate();

    // Handle window resize
    window.addEventListener("resize", () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
});
