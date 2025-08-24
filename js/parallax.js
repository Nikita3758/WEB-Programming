class ParallaxEffect {
    constructor() {
        this.parallaxContainer = document.querySelector('.parallax-container');
        this.layers = document.querySelectorAll('.parallax-layer');
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        this.init();
    }

    init() {
        if (!this.parallaxContainer) return;

        console.log('Parallax effect initialized');
        console.log('Layers found:', this.layers.length);

        this.preloadImages();
        this.setupEventListeners();
        this.createDebugPanel();
        this.updateParallax(); 

        setTimeout(() => this.updateParallax(), 1000);
    }

    preloadImages() {
        const images = document.querySelectorAll('.parallax-image');
        images.forEach((img, index) => {
            const src = img.getAttribute('src');
            if (src) {
                const preloadImg = new Image();
                preloadImg.src = src;
                preloadImg.onload = () => {
                    console.log(`Image ${index + 1} loaded: ${src}`);
                    img.style.opacity = '1';
                };
            }
        });
    }

    setupEventListeners() {
        window.addEventListener('scroll', () => {
            this.lastScrollY = window.scrollY;
            
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updateParallax();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            this.updateParallax();
        }, { passive: true });

        this.parallaxContainer.addEventListener('click', (e) => {
            if (e.shiftKey) {
                this.toggleDebug();
            }
        });
    }

    updateParallax() {
        const scrollY = this.lastScrollY;
        const container = this.parallaxContainer;
        const containerTop = container.offsetTop;
        const containerHeight = container.offsetHeight;
        const viewportHeight = window.innerHeight;

        const scrollProgress = Math.max(0, Math.min(1, 
            (scrollY - containerTop + viewportHeight) / (containerHeight + viewportHeight)
        ));

        this.layers.forEach(layer => {
            const speed = parseFloat(layer.dataset.speed) || 0.5;
            const yPos = scrollProgress * speed * 100; 
            
            layer.style.transform = `translateY(${yPos}px) translateZ(0)`;

            if (layer.dataset.debug) {
                layer.dataset.debug = `Y: ${yPos.toFixed(1)}px, Speed: ${speed}`;
            }
        });

        this.updateDebugInfo(scrollY, scrollProgress);
    }

    createDebugPanel() {
        const debugPanel = document.createElement('div');
        debugPanel.className = 'parallax-debug';
        debugPanel.style.display = 'none';
        debugPanel.innerHTML = `
            <h4>🌊 Parallax Debug</h4>
            <p>ScrollY: <span id="debug-scroll">0</span>px</p>
            <p>Progress: <span id="debug-progress">0%</span></p>
            <p>Layers: ${this.layers.length}</p>
            <button onclick="parallax.toggleDebug()">Toggle Debug</button>
        `;
        document.body.appendChild(debugPanel);
        this.debugPanel = debugPanel;
    }

    updateDebugInfo(scrollY, progress) {
        if (!this.debugPanel) return;
        
        const scrollEl = this.debugPanel.querySelector('#debug-scroll');
        const progressEl = this.debugPanel.querySelector('#debug-progress');
        
        if (scrollEl) scrollEl.textContent = Math.round(scrollY);
        if (progressEl) progressEl.textContent = `${Math.round(progress * 100)}%`;
    }

    toggleDebug() {
        if (!this.debugPanel) return;
        
        this.debugPanel.style.display = this.debugPanel.style.display === 'none' ? 'block' : 'none';

        this.layers.forEach(layer => {
            if (this.debugPanel.style.display === 'block') {
                layer.style.outline = '2px dashed red';
                layer.dataset.debug = 'active';
            } else {
                layer.style.outline = '';
                delete layer.dataset.debug;
            }
        });
    }

    update() {
        this.lastScrollY = window.scrollY;
        this.updateParallax();
    }
}

window.parallax = null;

document.addEventListener('DOMContentLoaded', () => {
    window.parallax = new ParallaxEffect();

    window.addEventListener('load', () => {
        if (window.parallax) {
            window.parallax.update();
        }
    });

    setInterval(() => {
        if (window.parallax) {
            window.parallax.update();
        }
    }, 100);
});

setTimeout(() => {
    if (!window.parallax && document.querySelector('.parallax-container')) {
        window.parallax = new ParallaxEffect();
    }
}, 500);