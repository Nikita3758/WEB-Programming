class MediaGallery {
    constructor() {
        this.images = {
            nature: [
                'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&h=600&fit=crop'
            ],
            garden: [
                'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1516214104703-d870798883c5?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1597848212624-e5f4b7596b26?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1590622783539-bae63fec9a91?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1570641963303-92ce4845ed4d?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1596466596120-2a8e4b5d1a51?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&h=600&fit=crop'
            ]
        };

        this.sounds = {
            nature: [
                '../sound/beautiful-birdsong-9-304945.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/lake-lapping-at-the-bank-331501.mp3',
                '../sound/lake-lapping-at-the-bank-331501.mp3',
                '../sound/prime-facts7-nature-sound-1-291485.mp3',
                '../sound/prime-facts7-nature-sound-2-291487.mp3',
                '../sound/prime-facts7-nature-sound-mornings-291488.mp3',
                '../sound/beautiful-birdsong-9-304945.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/prime-facts7-nature-sound-2-291487.mp3'
            ],
            garden: [
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3',
                '../sound/crickets-chirping_animal_insect_sound-206330.mp3'
            ]
        };

        this.soundNames = {
            nature: [
                "Forest Birds", "Wind in Trees", "Flowing River",
                "Rain on Leaves", "Thunder Rumble", "Ocean Waves",
                "Night Crickets", "Owl Hooting", "Waterfall", "Desert Wind"
            ],
            garden: [
                "Chirping Birds", "Bees Buzzing", "Fountain Splash",
                "Gardening Tools", "Rustling Leaves", "Wind Chimes",
                "Watering Plants", "Garden Shears", "Butterfly Wings", "Harvesting"
            ]
        };

        this.currentAudio = null;
        this.currentType = null;
        this.imagesViewed = 0;
        this.soundsPlayed = 0;
        this.isPlaying = false;

        this.init();
    }

    init() {
        this.galleryImage = document.getElementById('galleryImage');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.currentTrack = document.getElementById('currentTrack');
        this.imagesCounter = document.getElementById('imagesViewed');
        this.soundsCounter = document.getElementById('soundsPlayed');

        document.querySelectorAll('.gallery-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.handleButtonClick(type);
            });
        });

        this.playPauseBtn.addEventListener('click', () => this.togglePlayback());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));

        this.updatePlayButton();

        setTimeout(() => {
            this.handleButtonClick('nature');
        }, 1000);
    }

    handleButtonClick(type) {
        this.currentType = type;

        document.querySelectorAll('.gallery-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        this.changeRandomImage();
        this.playRandomSound();
    }

    changeRandomImage() {
        if (!this.currentType) return;

        const images = this.images[this.currentType];
        const randomIndex = Math.floor(Math.random() * images.length);
        
        this.galleryImage.style.opacity = '0';
        
        setTimeout(() => {
            this.galleryImage.src = images[randomIndex];
            this.galleryImage.alt = `${this.currentType} image ${randomIndex + 1}`;
            this.galleryImage.style.opacity = '1';

            this.imagesViewed++;
            this.imagesCounter.textContent = this.imagesViewed;
        }, 300);
    }

    async playRandomSound() {
        if (!this.currentType) return;

        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }

        const sounds = this.sounds[this.currentType];
        const soundNames = this.soundNames[this.currentType];
        const randomIndex = Math.floor(Math.random() * sounds.length);

        try {
            const response = await fetch(sounds[randomIndex], { method: 'HEAD' });
            if (!response.ok) {
                throw new Error('Sound not available');
            }

            this.currentAudio = new Audio(sounds[randomIndex]);
            this.currentAudio.volume = parseFloat(this.volumeSlider.value);

            this.currentTrack.textContent = soundNames[randomIndex];

            this.currentAudio.onended = () => {
                this.isPlaying = false;
                this.updatePlayButton();
            };

            this.currentAudio.onplay = () => {
                this.isPlaying = true;
                this.soundsPlayed++;
                this.soundsCounter.textContent = this.soundsPlayed;
                this.updatePlayButton();
            };

            this.currentAudio.onpause = () => {
                this.isPlaying = false;
                this.updatePlayButton();
            };

            this.currentAudio.onerror = (e) => {
                console.error('Audio error:', e);
                this.isPlaying = false;
                this.updatePlayButton();
                this.currentTrack.textContent = 'Sound unavailable - try another';
            };

            await this.currentAudio.play();
            
        } catch (error) {
            console.error('Error playing sound:', error);
            this.isPlaying = false;
            this.updatePlayButton();
            this.currentTrack.textContent = '';
        }
    }

    togglePlayback() {
        if (this.currentAudio) {
            if (this.isPlaying) {
                this.currentAudio.pause();
            } else {
                this.currentAudio.play().catch(error => {
                    console.log('Audio play error:', error);
                });
            }
        }
    }

    setVolume(volume) {
        if (this.currentAudio) {
            this.currentAudio.volume = parseFloat(volume);
        }
    }

    updatePlayButton() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');

        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            this.playPauseBtn.classList.add('playing');
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            this.playPauseBtn.classList.remove('playing');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MediaGallery();
});