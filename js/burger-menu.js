        document.addEventListener('DOMContentLoaded', function() {
            const menuToggle = document.getElementById('mobileMenuToggle');
            const nav = document.getElementById('nav');
            const overlay = document.getElementById('overlay');
            const body = document.body;

            function openMenu() {
                nav.classList.add('active');
                menuToggle.classList.add('active');
                overlay.classList.add('active');
                body.classList.add('no-scroll');
            }

            function closeMenu() {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                overlay.classList.remove('active');
                body.classList.remove('no-scroll');
            }

            menuToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                if (nav.classList.contains('active')) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });

            overlay.addEventListener('click', closeMenu);

            const navLinks = document.querySelectorAll('.nav-menu a');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    if (this.getAttribute('href').startsWith('#')) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId);
                        
                        if (targetElement) {
                            closeMenu();

                            setTimeout(() => {
                                const headerHeight = document.querySelector('header').offsetHeight;
                                const targetPosition = targetElement.offsetTop - headerHeight;
                                
                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });
                            }, 300);
                        }
                    } else {
                        closeMenu();
                    }
                });
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && nav.classList.contains('active')) {
                    closeMenu();
                }
            });

            window.addEventListener('resize', function() {
                if (window.innerWidth > 968 && nav.classList.contains('active')) {
                    closeMenu();
                }
            });

            nav.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });