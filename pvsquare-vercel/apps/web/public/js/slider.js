// Updated Slider functionality with API integration
document.addEventListener('DOMContentLoaded', function() {
    let slides = [];
    let currentSlide = 0;
    let totalSlides = 0;
    
    const slidesContainer = document.querySelector('.slider-container');
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    const currentSlideElement = document.getElementById('current-slide');
    const totalSlidesElement = document.getElementById('total-slides');
    const dots = document.querySelectorAll('.dot');
    
    // Load slides from API
    async function loadSlides() {
        try {
            const response = await fetch('/api/public/slides');
            if (!response.ok) {
                throw new Error('Failed to load slides');
            }
            
            slides = await response.json();
            totalSlides = slides.length;
            
            // Update total slides count
            if (totalSlidesElement) {
                totalSlidesElement.textContent = totalSlides.toString().padStart(2, '0');
            }
            
            // Render slides
            renderSlides();
            
            // Initialize slider functionality
            initializeSlider();
            
        } catch (error) {
            console.error('Error loading slides:', error);
            // Fallback to static content if API fails
            initializeStaticSlider();
        }
    }
    
    // Render slides dynamically
    function renderSlides() {
        const container = document.querySelector('.slider-container');
        container.innerHTML = '';
        
        slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = `slide${index === 0 ? ' active' : ''}`;
            
            slideElement.innerHTML = `
                <div class="project-image">
                    <div class="image-frame">
                        <img src="${slide.desktopImage}" alt="${slide.title}" />
                    </div>
                </div>
                <div class="project-image-mobile">
                    <img src="${slide.mobileImage}" alt="${slide.title} Mobile" />
                </div>
                <div class="project-content">
                    <h1>${slide.title}</h1>
                    <p class="project-description">
                        ${slide.description.replace(/\n/g, '<br>')}
                    </p>
                    <a href="#" class="view-more">VIEW <span>→</span></a>
                </div>
            `;
            
            container.appendChild(slideElement);
        });
    }
    
    // Initialize slider with dynamic content
    function initializeSlider() {
        const slideElements = document.querySelectorAll('.slide');
        
        // Update slide position
        function updateSlide(index) {
            // Remove active class from all slides
            slideElements.forEach(slide => {
                slide.classList.remove('active', 'prev');
            });
            
            // Remove active class from all dots
            dots.forEach(dot => {
                dot.classList.remove('active');
            });
            
            // Add active class to current slide and dot
            slideElements[index].classList.add('active');
            if (dots[index]) {
                dots[index].classList.add('active');
            }
            
            // Update slide counter
            if (currentSlideElement) {
                currentSlideElement.textContent = (index + 1).toString().padStart(2, '0');
            }
            
            // Add prev class to previous slide for animation
            const prevIndex = (index - 1 + totalSlides) % totalSlides;
            slideElements[prevIndex].classList.add('prev');
        }
        
        // Go to next slide
        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlide(currentSlide);
        }
        
        // Go to previous slide
        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlide(currentSlide);
        }
        
        // Event listeners for navigation buttons
        if (nextButton) {
            nextButton.addEventListener('click', function(e) {
                e.preventDefault();
                nextSlide();
            });
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', function(e) {
                e.preventDefault();
                prevSlide();
            });
        }
        
        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                currentSlide = index;
                updateSlide(currentSlide);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next slide
                    nextSlide();
                } else {
                    // Swipe right - previous slide
                    prevSlide();
                }
            }
        }
        
        // Auto-play functionality
        let autoPlayInterval;
        const autoPlayDelay = 3000; // 5 seconds
        
        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
        }
        
        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }
        
        // Start auto-play
        startAutoPlay();
        
        // Pause auto-play on user interaction and restart after delay
        function handleUserInteraction() {
            stopAutoPlay();
            // Restart auto-play after 10 seconds of no interaction
            setTimeout(startAutoPlay, 10000);
        }
        
        // Add interaction handlers
        if (prevButton) prevButton.addEventListener('click', handleUserInteraction);
        if (nextButton) nextButton.addEventListener('click', handleUserInteraction);
        dots.forEach(dot => {
            dot.addEventListener('click', handleUserInteraction);
        });
        
        // Pause on hover
        const sliderContainer = document.querySelector('.slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', stopAutoPlay);
            sliderContainer.addEventListener('mouseleave', startAutoPlay);
        }
    }
    
    // Fallback to initialize with static content
    function initializeStaticSlider() {
        const slideElements = document.querySelectorAll('.slide');
        totalSlides = slideElements.length;
        
        if (totalSlidesElement) {
            totalSlidesElement.textContent = totalSlides.toString().padStart(2, '0');
        }
        
        // Use the same initialization logic
        initializeSlider();
    }
    
    // Load slides on page load
    loadSlides();
});