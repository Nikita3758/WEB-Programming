class SmoothScroll {
    constructor() {
        this.headerHeight = document.querySelector('header').offsetHeight;
        this.init();
    }

    init() {
        this.setupLinkHandlers();
        this.setupDotHandlers();
        this.setupSectionObserver();
    }

    setupLinkHandlers() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToTarget(anchor.getAttribute('href'));
            });
        });
    }

    setupDotHandlers() {
        document.querySelectorAll('.section-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const targetId = '#' + dot.getAttribute('data-target');
                this.scrollToTarget(targetId);
            });
        });
    }

    scrollToTarget(targetId) {
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const targetPosition = targetElement.offsetTop - this.headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            history.pushState(null, null, targetId);
        }
    }

    setupSectionObserver() {
        const sections = document.querySelectorAll('section[id]');
        const navDots = document.querySelectorAll('.section-dot');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

        const observerOptions = {
            root: null,
            rootMargin: `-${this.headerHeight}px 0px -50% 0px`,
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');

                    navDots.forEach(dot => {
                        dot.classList.toggle('active', dot.getAttribute('data-target') === currentId);
                    });

                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SmoothScroll();
});