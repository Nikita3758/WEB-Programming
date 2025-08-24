    document.addEventListener('DOMContentLoaded', function() {
        const videoThumbnail = document.getElementById('videoThumbnail');
        const videoPlayer = document.getElementById('videoPlayer');
        const videoElement = document.getElementById('introVideo');
        const closeVideoBtn = document.querySelector('.close-video-btn');

        function playVideo() {
            videoThumbnail.style.display = 'none';
            videoPlayer.style.display = 'block';
            videoElement.play().catch(error => {
                console.log('Autoplay prevented:', error);
            });
        }

        function stopVideo() {
            videoPlayer.style.display = 'none';
            videoThumbnail.style.display = 'block';
            videoElement.pause();
            videoElement.currentTime = 0;
        }

        videoThumbnail.addEventListener('click', playVideo);
        closeVideoBtn.addEventListener('click', stopVideo);

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && videoPlayer.style.display === 'block') {
                stopVideo();
            }
        });

        document.addEventListener('click', function(e) {
            if (videoPlayer.style.display === 'block' && 
                !videoPlayer.contains(e.target) && 
                !videoThumbnail.contains(e.target)) {
                stopVideo();
            }
        });

        videoElement.addEventListener('ended', function() {
        });

        videoElement.preload = 'metadata';
    });