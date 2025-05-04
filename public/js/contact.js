// Contact form functionality - Create this as js/contact.js
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.querySelector('.form-status');
    
    if (contactForm) {
        // Add form validation and submission handling
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                projectType: document.getElementById('project-type').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Validate form
            if (!validateForm(formData)) {
                return;
            }
            
            // Show sending status
            formStatus.className = 'form-status sending';
            
            // Simulate form submission (replace with actual API call)
            try {
                // In a real implementation, you would send the data to your server here
                await simulateFormSubmission(formData);
                
                // Show success message
                formStatus.className = 'form-status success';
                
                // Reset form
                contactForm.reset();
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    formStatus.className = 'form-status';
                }, 5000);
                
            } catch (error) {
                // Show error message
                formStatus.className = 'form-status error';
                
                // Hide error message after 5 seconds
                setTimeout(() => {
                    formStatus.className = 'form-status';
                }, 5000);
            }
        });
        
        // Add input animation effects
        const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
        
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    }
    
    // Form validation
    function validateForm(data) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showError('Please enter a valid email address');
            return false;
        }
        
        // Check required fields
        if (!data.name || !data.email || !data.projectType || !data.subject || !data.message) {
            showError('Please fill in all required fields');
            return false;
        }
        
        return true;
    }
    
    // Show error message
    function showError(message) {
        const errorDiv = document.querySelector('.form-error');
        errorDiv.textContent = message;
        formStatus.className = 'form-status error';
        
        setTimeout(() => {
            formStatus.className = 'form-status';
        }, 5000);
    }
    
    // Simulate form submission
    function simulateFormSubmission(data) {
        return new Promise((resolve, reject) => {
            // Simulate API call delay
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Submission failed'));
                }
            }, 2000);
        });
    }
    
    // Add scroll reveal animation
    const revealElements = document.querySelectorAll('.form-group, .info-item');
    
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);
    
    revealElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(element);
    });
});

// Optional: Add real form submission
async function submitForm(formData) {
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Submission failed');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Form submission error:', error);
        throw error;
    }
}