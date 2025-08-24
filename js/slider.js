    class ProjectSlider {
        constructor() {
            this.slider = document.getElementById('projectSlider');
            this.slides = this.slider.querySelectorAll('.slider-slide');
            this.dots = document.querySelectorAll('.slider-dot');
            this.prevBtn = document.querySelector('.prev-arrow');
            this.nextBtn = document.querySelector('.next-arrow');
            this.currentSlide = 0;
            this.init();
        }

        init() {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());

            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });

            this.startAutoPlay();
        }

        goToSlide(index) {
            this.slides[this.currentSlide].classList.remove('active');
            this.dots[this.currentSlide].classList.remove('active');
            
            this.currentSlide = index;
            
            this.slides[this.currentSlide].classList.add('active');
            this.dots[this.currentSlide].classList.add('active');
        }

        nextSlide() {
            const nextIndex = (this.currentSlide + 1) % this.slides.length;
            this.goToSlide(nextIndex);
        }

        prevSlide() {
            const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            this.goToSlide(prevIndex);
        }

        startAutoPlay() {
            setInterval(() => this.nextSlide(), 5000);
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        new ProjectSlider();
    });