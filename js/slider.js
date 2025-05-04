// Slider functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    const currentSlideElement = document.getElementById('current-slide');
    const totalSlidesElement = document.getElementById('total-slides');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Update total slides count
    totalSlidesElement.textContent = totalSlides.toString().padStart(2, '0');
    
    // Update slide position
    function updateSlide(index) {
        // Remove active class from all slides
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev');
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Add active class to current slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        // Update slide counter
        currentSlideElement.textContent = (index + 1).toString().padStart(2, '0');
        
        // Add prev class to previous slide for animation
        const prevIndex = (index - 1 + totalSlides) % totalSlides;
        slides[prevIndex].classList.add('prev');
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
    nextButton.addEventListener('click', function(e) {
        e.preventDefault();
        nextSlide();
    });
    
    prevButton.addEventListener('click', function(e) {
        e.preventDefault();
        prevSlide();
    });
    
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
    
    // Optional: Auto-play functionality
    let autoPlayInterval;
    const autoPlayDelay = 5000; // 5 seconds
    
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
    prevButton.addEventListener('click', handleUserInteraction);
    nextButton.addEventListener('click', handleUserInteraction);
    dots.forEach(dot => {
        dot.addEventListener('click', handleUserInteraction);
    });
    
    // Pause on hover (optional)
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);
});


// Word-by-word reveal animation for About Us lead text
document.addEventListener('DOMContentLoaded', function() {
    const leadText = document.querySelector('.lead-text');
    
    if (!leadText) return;
    
    // Store the original text
    const originalText = leadText.textContent;
    
    // Split text into words and wrap each word in a span
    function initWordAnimation() {
        const words = originalText.trim().split(/\s+/);
        
        leadText.innerHTML = words.map((word, index) => 
            `<span class="animated-word" style="--word-index: ${index};">${word}</span>`
        ).join(' ');
        
        // Get all animated words
        const animatedWords = leadText.querySelectorAll('.animated-word');
        
        // Set initial state
        animatedWords.forEach(word => {
            word.style.opacity = '0.2';
            word.style.filter = 'blur(1px)';
            word.style.transform = 'translateY(5px)';
        });
        
        // Function to reveal words based on scroll
        function revealWords() {
            const leadTextRect = leadText.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate the scroll progress for the lead text
            const startReveal = windowHeight * 0.8; // Start when element is 80% visible
            const endReveal = windowHeight * 0.2;   // End when element reaches 20% from top
            
            if (leadTextRect.top < startReveal) {
                const totalDistance = startReveal - endReveal;
                const currentDistance = Math.max(0, Math.min(totalDistance, startReveal - leadTextRect.top));
                const overallProgress = currentDistance / totalDistance;
                
                animatedWords.forEach((word, index) => {
                    // Calculate individual word progress with stagger effect
                    const wordDelay = index / animatedWords.length;
                    const wordProgress = Math.max(0, Math.min(1, (overallProgress - wordDelay * 0.5) * 2));
                    
                    // Apply styles based on progress
                    word.style.opacity = 0.2 + (0.8 * wordProgress);
                    word.style.filter = `blur(${1 - wordProgress}px)`;
                    word.style.transform = `translateY(${5 * (1 - wordProgress)}px)`;
                });
            }
        }
        
        // Throttle function for performance
        function throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        }
        
        // Add scroll listener
        window.addEventListener('scroll', throttle(revealWords, 16));
        
        // Initial check
        revealWords();
        
        // Optional: Use Intersection Observer for better performance
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        revealWords();
                    }
                });
            }, {
                threshold: Array.from({ length: 20 }, (_, i) => i * 0.05),
                rootMargin: '0px'
            });
            
            observer.observe(leadText);
        }
    }
    
    // Initialize the animation
    initWordAnimation();
});

//Main Text Animation
// "Reality is broken" style animation for About Us main text
document.addEventListener('DOMContentLoaded', function() {
    const aboutSubtitle = document.querySelector('.about-subtitle');
    
    if (!aboutSubtitle) return;
    
    // Wrap every letter in a span
    function wrapLetters(element) {
        const text = element.textContent;
        const letters = text.replace(/\S/g, "<span class='letter'>$&</span>");
        element.innerHTML = letters;
    }
    
    function initRealityBrokenAnimation() {
        // Wrap letters first
        wrapLetters(aboutSubtitle);
        
        const letters = aboutSubtitle.querySelectorAll('.letter');
        
        // Set initial positions - scattered and rotated
        letters.forEach((letter, i) => {
            letter.style.display = 'inline-block';
            letter.style.position = 'relative';
            letter.style.opacity = '0';
            
            // Random initial positions
            const randomX = (Math.random() - 0.5) * 100;
            const randomY = (Math.random() - 0.5) * 50;
            const randomRotate = (Math.random() - 0.5) * 180;
            
            letter.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
        });
        
        // Animation function using anime.js style timing
        function animateLetters() {
            letters.forEach((letter, i) => {
                // Calculate delay based on position
                const delay = i * 50;
                
                // Animate to final position
                setTimeout(() => {
                    letter.style.transition = 'all 750ms cubic-bezier(0.19, 1, 0.22, 1)';
                    letter.style.opacity = '1';
                    letter.style.transform = 'translate(0, 0) rotate(0)';
                }, delay);
            });
        }
        
        // Check if element is in viewport
        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75
            );
        }
        
        let hasAnimated = false;
        
        function checkAndAnimate() {
            if (!hasAnimated && isInViewport(aboutSubtitle)) {
                hasAnimated = true;
                animateLetters();
                window.removeEventListener('scroll', checkAndAnimate);
            }
        }
        
        window.addEventListener('scroll', checkAndAnimate);
        checkAndAnimate();
        
        // Intersection Observer for better performance
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasAnimated) {
                        hasAnimated = true;
                        animateLetters();
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });
            
            observer.observe(aboutSubtitle);
        }
    }
    
    initRealityBrokenAnimation();
});

// If you have anime.js installed, here's the exact implementation:
/*
document.addEventListener('DOMContentLoaded', function() {
    const aboutSubtitle = document.querySelector('.about-subtitle');
    
    if (!aboutSubtitle) return;
    
    // Wrap every letter in a span
    aboutSubtitle.innerHTML = aboutSubtitle.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
    
    function animateText() {
        anime.timeline({loop: false})
            .add({
                targets: '.about-subtitle .letter',
                translateY: ["1.1em", 0],
                translateX: ["0.55em", 0],
                translateZ: 0,
                rotateZ: [180, 0],
                duration: 750,
                easing: "easeOutExpo",
                delay: (el, i) => 50 * i
            });
    }
    
    // Trigger on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateText();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    observer.observe(aboutSubtitle);
});
*/
