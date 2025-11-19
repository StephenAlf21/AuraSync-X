
        // --- p5.js Sketch for Animated Background ---
        let particles = [];

        function setup() {
            let canvas = createCanvas(windowWidth, windowHeight);
            canvas.parent('p5-canvas-container'); // Attach canvas to the container div
            for (let i = 0; i < 100; i++) {
                particles.push(new Particle());
            }
        }

        function draw() {
            background('#111827');
            for (let i = 0; i < particles.length; i++) {
                particles[i].createParticle();
                particles[i].moveParticle();
                particles[i].joinParticles(particles.slice(i));
            }
        }

        function windowResized() {
            resizeCanvas(windowWidth, windowHeight);
        }

        // Particle class
        class Particle {
            constructor() {
                this.x = random(0, width);
                this.y = random(0, height);
                this.r = random(1, 4);
                this.xSpeed = random(-0.5, 0.5);
                this.ySpeed = random(-0.5, 0.5);
            }

            createParticle() {
                noStroke();
                fill('rgba(167, 139, 250, 0.5)'); // A nice purple color
                circle(this.x, this.y, this.r);
            }

            moveParticle() {
                if (this.x < 0 || this.x > width) this.xSpeed *= -1;
                if (this.y < 0 || this.y > height) this.ySpeed *= -1;
                this.x += this.xSpeed;
                this.y += this.ySpeed;
            }

            joinParticles(otherParticles) {
                otherParticles.forEach(p => {
                    let d = dist(this.x, this.y, p.x, p.y);
                    if (d < 85) {
                        stroke('rgba(167, 139, 250, 0.2)');
                        line(this.x, this.y, p.x, p.y);
                    }
                });
            }
        }

        // --- Dropdown/Accordion Logic ---
        function setupDropdown(containerId, buttonId, menuId, iconId) {
            const container = document.getElementById(containerId);
            const button = document.getElementById(buttonId);
            const menu = document.getElementById(menuId);
            const icon = iconId ? document.getElementById(iconId) : button.querySelector('svg');

            if (!button || !menu) return;

            button.addEventListener('click', (event) => {
                event.stopPropagation();
                // Close other dropdowns
                document.querySelectorAll('.relative .absolute').forEach(otherMenu => {
                    if (otherMenu !== menu) {
                        otherMenu.classList.add('hidden');
                        const otherButton = otherMenu.previousElementSibling;
                        const otherIcon = otherButton.querySelector('svg');
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                    }
                });
                
                const isHidden = menu.classList.toggle('hidden');
                if (icon) {
                    icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            });

            if (container) {
                 window.addEventListener('click', (event) => {
                    if (!container.contains(event.target)) {
                        menu.classList.add('hidden');
                        if (icon) icon.style.transform = 'rotate(0deg)';
                    }
                });
            }
        }
        
        function setupAccordion(buttonId, menuId, iconId) {
            const button = document.getElementById(buttonId);
            const menu = document.getElementById(menuId);
            const icon = document.getElementById(iconId);

            if (!button || !menu || !icon) return;

            button.addEventListener('click', () => {
                menu.classList.toggle('hidden');
                icon.classList.toggle('rotate-90');
            });
        }

        // --- Navbar Mobile Menu Logic ---
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // --- Paywall Logic ---
        const paywallModal = document.getElementById('paywallModal');
        const paywallModalCard = paywallModal.querySelector('.modal-card');
        const continueFreeBtn = document.getElementById('continueFree');
        let paywallShown = false;
        
        function showPaywall(targetUrl) {
            paywallModal.dataset.targetUrl = targetUrl;
            paywallModal.classList.remove('hidden');
            paywallModalCard.classList.remove('animate-fade-out-down');
            paywallModalCard.classList.add('animate-fade-in-up');
        }

        function closePaywallAndContinue() {
            const targetUrl = paywallModal.dataset.targetUrl;
            paywallModalCard.classList.remove('animate-fade-in-up');
            paywallModalCard.classList.add('animate-fade-out-down');
            
            paywallModalCard.addEventListener('animationend', () => {
                paywallModal.classList.add('hidden');
                if (targetUrl) window.location.href = targetUrl;
            }, { once: true });
        }
        
        continueFreeBtn.addEventListener('click', closePaywallAndContinue);
        
        function loadApp(url) {
            if (!paywallShown) {
                showPaywall(url);
                paywallShown = true;
            } else {
                window.location.href = url;
            }
        }
        
        // --- Back to Top Button Logic ---
        const backToTopBtn = document.getElementById('backToTopBtn');

        window.addEventListener('scroll', () => {
            if (window.scrollY > window.innerHeight * 0.4) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                backToTopBtn.classList.add('opacity-100');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
                backToTopBtn.classList.remove('opacity-100');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // --- Newsletter Form Logic (with guard clause) ---
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('newsletterEmail');
                const submitButton = newsletterForm.querySelector('button');
                
                submitButton.innerHTML = 'Thanks!';
                emailInput.disabled = true;
                submitButton.disabled = true;

                setTimeout(() => {
                    submitButton.innerHTML = `<span class="hidden sm:inline">Sign Up</span><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>`;
                    emailInput.value = '';
                    emailInput.disabled = false;
                    submitButton.disabled = false;
                }, 3000);
            });
        }

        // --- Initialize All Dropdowns & Accordions on DOMContentLoaded ---
        document.addEventListener('DOMContentLoaded', () => {
            // Desktop Dropdowns
            setupDropdown('companyDropdownContainer', 'companyDropdownBtn', 'companyDropdownMenu');
            setupDropdown('communityDropdownContainer', 'communityDropdownBtn', 'communityDropdownMenu');
            setupDropdown('legalDropdownContainer', 'legalDropdownBtn', 'legalDropdownMenu');

            // Mobile Accordions
            setupAccordion('mobileCompanyBtn', 'mobileCompanyMenu', 'mobileCompanyIcon');
            setupAccordion('mobileCommunityBtn', 'mobileCommunityMenu', 'mobileCommunityIcon');
            setupAccordion('mobileLegalBtn', 'mobileLegalMenu', 'mobileLegalIcon');
        });

    
