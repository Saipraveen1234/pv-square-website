// Add this to your existing JavaScript file or create a new one

// Statistics Counter Animation
document.addEventListener('DOMContentLoaded', function() {
    // Function to animate counter
    function animateCounter(element, start, end, duration) {
        let startTimestamp = null;
        element.classList.add('counting');
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = progress => 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(easeOutQuart(progress) * (end - start) + start);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end;
                element.classList.remove('counting');
                element.classList.add('counted');
            }
        };
        window.requestAnimationFrame(step);
    }

    // Function to check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Get all stat numbers and related elements
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.about-stats');
    const statItems = document.querySelectorAll('.stat-item');
    let hasAnimated = false;

    // Store original values
    const originalValues = Array.from(statNumbers).map(stat => {
        return parseInt(stat.textContent);
    });

    // Set initial values to 0
    statNumbers.forEach(stat => {
        stat.textContent = '0';
        stat.classList.add('animated-number');
    });

    // Animation trigger function
    function checkAndAnimate() {
        if (!hasAnimated && isElementInViewport(statsSection)) {
            hasAnimated = true;
            
            // Add visible class to the section
            statsSection.classList.add('visible');
            
            // Animate stat items
            statItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('visible');
                }, index * 100);
            });
            
            // Animate numbers
            statNumbers.forEach((stat, index) => {
                const endValue = originalValues[index];
                const duration = 2000; // 2 seconds animation
                
                // Add slight delay for each counter for staggered effect
                setTimeout(() => {
                    animateCounter(stat, 0, endValue, duration);
                }, index * 200 + 300); // Start after items are visible
            });
        }
    }

    // Check on scroll
    window.addEventListener('scroll', checkAndAnimate);
    
    // Check on page load (in case stats are already in view)
    setTimeout(checkAndAnimate, 500);

    // Add intersection observer for better performance
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    checkAndAnimate();
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.3,
            rootMargin: '0px'
        });

        if (statsSection) {
            observer.observe(statsSection);
        }
    }
});
// Main Text Animation
