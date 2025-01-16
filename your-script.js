// Scene, Camera, Renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container").appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// OrbitControls for rotation and zoom
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 5;

// Create a canvas for painting
const paintCanvas = document.getElementById("paintCanvas");
paintCanvas.width = 1024;
paintCanvas.height = 1024;
const ctx = paintCanvas.getContext("2d");

// Fill canvas with white
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);

// Create a texture from the canvas
const texture = new THREE.CanvasTexture(paintCanvas);

// GLTF Loader to load your 3D model
const loader = new THREE.GLTFLoader();
let model;

// Load the GLB file
loader.load(
  'https://github.com/Burcuri/diy3djersey/raw/refs/heads/main/diy%20jersey%2025mb.glb',
  (gltf) => {
    model = gltf.scene;

    // Apply the texture to the model
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.map = texture; // Apply the painted texture
        child.material.needsUpdate = true;
      }
    });

    scene.add(model);
    console.log('Model loaded!');

    // Start the animation loop
    animate();
  },
  undefined,
  (error) => {
    console.error('Error loading GLB file:', error);
  }
);

// Painting functionality
let painting = false;
const colorPicker = document.getElementById("colorPicker");

// Start painting on mousedown
paintCanvas.addEventListener("mousedown", () => (painting = true));
// Stop painting on mouseup or leaving the canvas
paintCanvas.addEventListener("mouseup", () => (painting = false));
paintCanvas.addEventListener("mouseleave", () => (painting = false));

paintCanvas.addEventListener("mousemove", (event) => {
  if (!painting) return;

  // Calculate coordinates on the canvas
  const rect = paintCanvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * paintCanvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * paintCanvas.height;

  // Draw on the canvas
  ctx.fillStyle = colorPicker.value; // Use selected color
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2); // Draw a circle (brush size 10)
  ctx.fill();

  // Update the texture
  texture.needsUpdate = true;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update OrbitControls
  renderer.render(scene, camera);
}

// Adjust canvas size on window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
