class Counters {
    constructor() {
        this.counters = document.querySelectorAll('.stat-item h2');
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startCounting(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    startCounting(counter) {
        const target = parseInt(counter.dataset.target);
        const duration = 2000; 
        const increment = target / (duration / 16); 
        
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.round(current);
        }, 16);
    }
}

new Counters();