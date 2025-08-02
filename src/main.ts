import './style.css';
import * as THREE from 'three';

// Particle System Class
class ParticleSystem {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private particles: THREE.Points;
  private mouse = { x: 0, y: 0 };
  private frameId: number | null = null;

  constructor(container: HTMLElement) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Create particles
    this.createParticles();
    
    // Camera position
    this.camera.position.z = 30;

    // Event listeners
    this.setupEventListeners();
    
    // Start animation
    this.animate();
  }

  private createParticles() {
    const particleCount = window.innerWidth < 768 ? 800 : 1500;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;
      
      // Size
      sizes[i] = Math.random() * 3 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Particle material with glow effect
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2() },
        color: { value: new THREE.Color(0.8, 0.9, 1.0) }
      },
      vertexShader: `
        attribute float size;
        uniform float time;
        uniform vec2 mouse;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          
          // Wave motion
          pos.x += sin(time * 0.5 + position.y * 0.01) * 2.0;
          pos.y += cos(time * 0.3 + position.x * 0.01) * 2.0;
          
          // Mouse interaction
          vec2 mouseInfluence = mouse * 10.0;
          float distance = length(pos.xy - mouseInfluence);
          pos.xy += normalize(pos.xy - mouseInfluence) * (5.0 / (distance + 1.0));
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (300.0 / -mvPosition.z);
          
          vAlpha = 1.0 - (distance * 0.01);
          vAlpha = clamp(vAlpha, 0.3, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float distance = length(center);
          
          if (distance > 0.5) discard;
          
          float alpha = 1.0 - (distance * 2.0);
          alpha = pow(alpha, 2.0) * vAlpha;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private setupEventListeners() {
    // Mouse movement
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Resize handler
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private animate = () => {
    const time = Date.now() * 0.001;
    
    const material = this.particles.material as THREE.ShaderMaterial;
    if (material.uniforms) {
      material.uniforms.time.value = time;
      material.uniforms.mouse.value.set(this.mouse.x, this.mouse.y);
    }

    // Rotate particles slowly
    this.particles.rotation.y = time * 0.1;
    this.particles.rotation.x = Math.sin(time * 0.05) * 0.1;

    // Camera animation
    this.camera.position.x = Math.sin(time * 0.1) * 2;
    this.camera.position.y = Math.cos(time * 0.05) * 1;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    
    const geometry = this.particles.geometry;
    const material = this.particles.material as THREE.Material;
    
    geometry.dispose();
    material.dispose();
    this.renderer.dispose();
  }
}

// Coming Soon Content Handler
class ComingSoonApp {
  private particleSystem: ParticleSystem | null = null;
  private isSubmitted = false;

  constructor() {
    this.init();
  }

  private init() {
    // Create HTML structure
    this.createHTML();
    
    // Initialize particle system
    const container = document.getElementById('particle-container');
    if (container) {
      this.particleSystem = new ParticleSystem(container);
    }

    // Setup event listeners
    this.setupEventListeners();
  }

  private createHTML() {
    document.body.innerHTML = `
      <div class="app-container">
        <!-- Animated gradient background -->
        <div class="gradient-bg"></div>
        
        <!-- Secondary gradient overlay -->
        <div class="gradient-overlay"></div>
        
        <!-- Three.js particle container -->
        <div id="particle-container" class="particle-container"></div>
        
        <!-- Content overlay -->
        <div class="content-overlay">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo">
              <div class="logo-inner"></div>
            </div>
          </div>

          <!-- Main heading -->
          <h1 class="main-heading">
            <span class="heading-line-1">
              Mantra Djiwa
            </span>
          </h1>

          <!-- Divider line -->
          <div class="divider-line"></div>

          <!-- Subtitle -->
         <!--
          <p class="subtitle">
            We're crafting something extraordinary. Get ready for an amazing experience 
            that will transform the way you think about innovation.
          </p>
          -->

          <!-- Social links -->
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        
        <!-- Subtle vignette effect -->
        <div class="vignette"></div>
      </div>
    `;
  }

  private setupEventListeners() {
    const form = document.getElementById('email-form') as HTMLFormElement;
    const emailInput = document.getElementById('email-input') as HTMLInputElement;
    const successMessage = document.getElementById('success-message') as HTMLElement;
    const btnText = document.querySelector('.btn-text') as HTMLElement;

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (emailInput.value && !this.isSubmitted) {
        this.isSubmitted = true;
        btnText.textContent = 'Subscribed!';
        successMessage.classList.remove('hidden');
        
        setTimeout(() => {
          this.isSubmitted = false;
          btnText.textContent = 'Notify Me';
          successMessage.classList.add('hidden');
          emailInput.value = '';
        }, 3000);
      }
    });
  }

  public destroy() {
    if (this.particleSystem) {
      this.particleSystem.destroy();
    }
  }
}

// Initialize the app
const app = new ComingSoonApp();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  app.destroy();
});