class FireSimulation {
    constructor() {
        this.setup();
        this.createParticles();
        this.addControls();
        this.animate();
    }

    setup() {
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xff7700, 2, 100);
        pointLight.position.set(0, 2, 0);
        this.scene.add(pointLight);

        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);

        // Parameters
        this.params = {
            particleCount: 5000,
            fireIntensity: 50,
            windSpeed: 20
        };

        // Bind event listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    createParticles() {
        // Particle system
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = this.params.particleCount;

        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 2;
            positions[i3 + 1] = Math.random() * 5;
            positions[i3 + 2] = (Math.random() - 0.5) * 2;

            const color = new THREE.Color();
            color.setHSL(0.1, 1, Math.random() * 0.5 + 0.5);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = Math.random() * 2;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        });

        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
    }

    addControls() {
        // UI Controls
        document.getElementById('particleCount').addEventListener('input', (e) => {
            this.params.particleCount = parseInt(e.target.value);
            this.scene.remove(this.particles);
            this.createParticles();
        });

        document.getElementById('fireIntensity').addEventListener('input', (e) => {
            this.params.fireIntensity = parseInt(e.target.value);
        });

        document.getElementById('windSpeed').addEventListener('input', (e) => {
            this.params.windSpeed = parseInt(e.target.value);
        });
    }

    updateParticles() {
        const positions = this.particles.geometry.attributes.position.array;
        const colors = this.particles.geometry.attributes.color.array;
        const sizes = this.particles.geometry.attributes.size.array;

        for (let i = 0; i < this.params.particleCount; i++) {
            const i3 = i * 3;

            // Update position
            positions[i3 + 1] += (Math.random() * this.params.fireIntensity) / 500;
            positions[i3] += (Math.random() - 0.5) * this.params.windSpeed / 1000;
            positions[i3 + 2] += (Math.random() - 0.5) * this.params.windSpeed / 1000;

            // Reset particles that go too high
            if (positions[i3 + 1] > 5) {
                positions[i3] = (Math.random() - 0.5) * 2;
                positions[i3 + 1] = 0;
                positions[i3 + 2] = (Math.random() - 0.5) * 2;

                const color = new THREE.Color();
                color.setHSL(0.1, 1, Math.random() * 0.5 + 0.5);
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;

                sizes[i] = Math.random() * 2;
            }
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.color.needsUpdate = true;
        this.particles.geometry.attributes.size.needsUpdate = true;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.updateParticles();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when the window loads
window.addEventListener('load', () => {
    new FireSimulation();
});