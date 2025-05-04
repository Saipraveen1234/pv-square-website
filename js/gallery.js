// Enhanced Gallery functionality with Project Pages - Create this as js/gallery.js
const projectsData = {
    'modern-villa': {
        title: 'Modern Villa',
        category: 'Residential • Exterior',
        description: 'A contemporary architectural masterpiece featuring clean lines, expansive glass facades, and seamless indoor-outdoor living spaces. This three-story villa combines modern aesthetics with sustainable design principles.',
        client: 'Private Client',
        location: 'Hyderabad, India',
        year: '2023',
        area: '5,500 sq.ft',
        images: [
            'images/gallery/modern-villa/image-1.jpg',
            'images/gallery/modern-villa/image-2.jpg',
            'images/gallery/modern-villa/image-3.jpg',
            'images/gallery/modern-villa/image-4.jpg',
            'images/gallery/modern-villa/image-5.jpg',
            'images/gallery/modern-villa/image-6.jpg'
        ]
    },
    'corporate-office': {
        title: 'Corporate Office',
        category: 'Commercial • Interior',
        description: 'A dynamic workspace designed to foster creativity and collaboration. Features include open-plan areas, private meeting pods, and biophilic design elements that enhance employee well-being.',
        client: 'Tech Innovations Ltd.',
        location: 'Bangalore, India',
        year: '2022',
        area: '12,000 sq.ft',
        images: [
            'images/gallery/corporate-office/image-1.jpg',
            'images/gallery/corporate-office/image-2.jpg',
            'images/gallery/corporate-office/image-3.jpg',
            'images/gallery/corporate-office/image-4.jpg',
            'images/gallery/corporate-office/image-5.jpg'
        ]
    },
    'luxury-apartment': {
        title: 'Luxury Apartment',
        category: 'Residential • Interior',
        description: 'An elegant penthouse apartment featuring bespoke interiors, premium materials, and panoramic city views. Every detail has been carefully curated to create a sophisticated living experience.',
        client: 'Private Client',
        location: 'Mumbai, India',
        year: '2023',
        area: '3,800 sq.ft',
        images: [
            'images/gallery/luxury-apartment/image-1.jpg',
            'images/gallery/luxury-apartment/image-2.jpg',
            'images/gallery/luxury-apartment/image-3.jpg',
            'images/gallery/luxury-apartment/image-4.jpg',
            'images/gallery/luxury-apartment/image-5.jpg',
            'images/gallery/luxury-apartment/image-6.jpg',
            'images/gallery/luxury-apartment/image-7.jpg'
        ]
    },
    'shopping-complex': {
        title: 'Shopping Complex',
        category: 'Commercial • Exterior',
        description: 'A modern retail destination that reimagines the shopping experience. Features sustainable design, natural lighting, and flexible spaces that adapt to changing retail needs.',
        client: 'Retail Developers Group',
        location: 'Hyderabad, India',
        year: '2021',
        area: '45,000 sq.ft',
        images: [
            'images/gallery/shopping-complex/image-1.jpg',
            'images/gallery/shopping-complex/image-2.jpg',
            'images/gallery/shopping-complex/image-3.jpg',
            'images/gallery/shopping-complex/image-4.jpg'
        ]
    },
    'contemporary-house': {
        title: 'Contemporary House',
        category: 'Residential • Exterior',
        description: 'A modern family home that balances privacy with openness. Features include a central courtyard, sustainable materials, and energy-efficient systems.',
        client: 'The Kumar Family',
        location: 'Chennai, India',
        year: '2022',
        area: '4,200 sq.ft',
        images: [
            'images/gallery/contemporary-house/image-1.jpg',
            'images/gallery/contemporary-house/image-2.jpg',
            'images/gallery/contemporary-house/image-3.jpg',
            'images/gallery/contemporary-house/image-4.jpg',
            'images/gallery/contemporary-house/image-5.jpg'
        ]
    },
    'hotel-lobby': {
        title: 'Hotel Lobby',
        category: 'Commercial • Interior',
        description: 'A luxury hotel lobby that creates a memorable first impression. Features include custom lighting, artistic installations, and flexible seating arrangements.',
        client: 'Luxury Hotels International',
        location: 'Delhi, India',
        year: '2023',
        area: '8,000 sq.ft',
        images: [
            'images/gallery/hotel-lobby/image-1.jpg',
            'images/gallery/hotel-lobby/image-2.jpg',
            'images/gallery/hotel-lobby/image-3.jpg',
            'images/gallery/hotel-lobby/image-4.jpg',
            'images/gallery/hotel-lobby/image-5.jpg',
            'images/gallery/hotel-lobby/image-6.jpg'
        ]
    }
};

let currentProjectId = null;
let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const galleryGrid = document.querySelector('.gallery-grid');
    
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            galleryItems.forEach(item => {
                const itemCategories = item.getAttribute('data-category').split(' ');
                
                if (filterValue === 'all' || itemCategories.includes(filterValue)) {
                    item.classList.remove('hidden');
                    item.style.display = 'block';
                } else {
                    item.classList.add('hidden');
                    setTimeout(() => {
                        if (item.classList.contains('hidden')) {
                            item.style.display = 'none';
                        }
                    }, 500);
                }
            });
        });
    });
    
    // Load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // This would typically load more projects from a server
            console.log('Load more projects...');
        });
    }
    
    // Initialize gallery animations
    initGalleryAnimations();
});

// Open project modal
function openProject(projectId) {
    currentProjectId = projectId;
    const project = projectsData[projectId];
    
    if (!project) return;
    
    const modal = document.getElementById('project-modal');
    
    // Update modal content
    document.querySelector('.project-title').textContent = project.title;
    document.querySelector('.project-category').textContent = project.category;
    document.querySelector('.project-description p').textContent = project.description;
    
    // Update project details
    document.getElementById('project-client').textContent = project.client;
    document.getElementById('project-location').textContent = project.location;
    document.getElementById('project-year').textContent = project.year;
    document.getElementById('project-area').textContent = project.area;
    
    // Load images
    loadProjectImages(project.images);
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);
}

// Close project modal
function closeProject() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

// Load project images
function loadProjectImages(images) {
    currentImageIndex = 0;
    const mainImage = document.getElementById('project-main-image');
    const thumbnailGrid = document.getElementById('project-thumbnails');
    
    // Set main image
    mainImage.src = images[0];
    mainImage.alt = 'Project Image 1';
    
    // Create thumbnails
    thumbnailGrid.innerHTML = '';
    images.forEach((image, index) => {
        const thumbnailItem = document.createElement('div');
        thumbnailItem.className = `thumbnail-item ${index === 0 ? 'active' : ''}`;
        thumbnailItem.innerHTML = `<img src="${image}" alt="Project Image ${index + 1}">`;
        thumbnailItem.addEventListener('click', () => changeMainImage(index));
        thumbnailGrid.appendChild(thumbnailItem);
    });
}

// Change main image
function changeMainImage(index) {
    const project = projectsData[currentProjectId];
    if (!project) return;
    
    currentImageIndex = index;
    const mainImage = document.getElementById('project-main-image');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    
    // Update main image
    mainImage.src = project.images[index];
    mainImage.alt = `Project Image ${index + 1}`;
    
    // Update active thumbnail
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Navigate between projects
function navigateProject(direction) {
    const projectIds = Object.keys(projectsData);
    const currentIndex = projectIds.indexOf(currentProjectId);
    let newIndex;
    
    if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : projectIds.length - 1;
    } else {
        newIndex = currentIndex < projectIds.length - 1 ? currentIndex + 1 : 0;
    }
    
    openProject(projectIds[newIndex]);
}

// Handle escape key
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeProject();
    }
}

// Initialize gallery animations
function initGalleryAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all gallery items
    document.querySelectorAll('.gallery-item').forEach(item => {
        observer.observe(item);
    });
}

// Optional: Add image lightbox for full-screen view
function initImageLightbox() {
    const mainImage = document.getElementById('project-main-image');
    
    mainImage.addEventListener('click', function() {
        const lightbox = document.createElement('div');
        lightbox.className = 'image-lightbox active';
        lightbox.innerHTML = `
            <img src="${this.src}" alt="${this.alt}" class="lightbox-image">
            <div class="lightbox-controls">
                <button class="lightbox-btn prev-lightbox">←</button>
                <button class="lightbox-btn close-lightbox">×</button>
                <button class="lightbox-btn next-lightbox">→</button>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // Add event listeners
        lightbox.querySelector('.close-lightbox').addEventListener('click', () => {
            lightbox.remove();
            document.body.style.overflow = '';
        });
        
        lightbox.querySelector('.prev-lightbox').addEventListener('click', () => {
            navigateLightboxImage(-1);
        });
        
        lightbox.querySelector('.next-lightbox').addEventListener('click', () => {
            navigateLightboxImage(1);
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.remove();
                document.body.style.overflow = '';
            }
        });
    });
}

function navigateLightboxImage(direction) {
    const project = projectsData[currentProjectId];
    if (!project) return;
    
    currentImageIndex = (currentImageIndex + direction + project.images.length) % project.images.length;
    
    const lightboxImage = document.querySelector('.lightbox-image');
    lightboxImage.src = project.images[currentImageIndex];
    lightboxImage.alt = `Project Image ${currentImageIndex + 1}`;
}

// Initialize lightbox when modal opens
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('project-modal');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                initImageLightbox();
            }
        });
    });
    
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
});