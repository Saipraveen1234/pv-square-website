// Enhanced Gallery functionality with API integration
let projectsData = {};
let currentProjectId = null;
let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryGrid = document.querySelector('.gallery-grid');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    
    // Load projects from API
    async function loadProjects() {
        try {
            const response = await fetch('/api/public/projects');
            if (!response.ok) {
                throw new Error('Failed to load projects');
            }
            
            const projects = await response.json();
            
            // Convert array to object for easier access
            projectsData = projects.reduce((acc, project) => {
                acc[project.id] = project;
                return acc;
            }, {});
            
            // Render gallery
            renderGallery(projects);
            
            // Initialize gallery functionality
            initializeGallery();
            
        } catch (error) {
            console.error('Error loading projects:', error);
            // Fallback to static content if API fails
            initializeStaticGallery();
        }
    }
    
    // Render gallery items
    function renderGallery(projects) {
        galleryGrid.innerHTML = '';
        
        projects.forEach(project => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-category', project.category);
            galleryItem.setAttribute('data-project-id', project.id);
            
            galleryItem.innerHTML = `
                <div class="gallery-item-inner">
                    <img src="${project.coverImage}" alt="${project.title}">
                    <div class="gallery-item-overlay">
                        <h3>${project.title}</h3>
                        <p>${formatCategory(project.category)}</p>
                        <a href="javascript:void(0)" class="gallery-view-more" onclick="openProject('${project.id}')">View Project →</a>
                    </div>
                </div>
            `;
            
            galleryGrid.appendChild(galleryItem);
        });
    }
    
    // Format category for display
    function formatCategory(category) {
        const categoryMap = {
            'residential': 'Residential',
            'commercial': 'Commercial',
            'interior': 'Interior',
            'exterior': 'Exterior',
            'residential interior': 'Residential • Interior',
            'residential exterior': 'Residential • Exterior',
            'commercial interior': 'Commercial • Interior',
            'commercial exterior': 'Commercial • Exterior'
        };
        
        return categoryMap[category] || category;
    }
    
    // Initialize gallery functionality
    function initializeGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        // Filter functionality
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const filterValue = this.getAttribute('data-filter');
                
                galleryItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    
                    if (filterValue === 'all' || itemCategory.includes(filterValue)) {
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
                // In a real implementation, this would load more projects from the API
                console.log('Load more projects...');
            });
        }
        
        // Intersection Observer for reveal animation
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
        galleryItems.forEach(item => {
            observer.observe(item);
        });
    }
    
    // Load projects on page load
    loadProjects();
});

// Open project modal
function openProject(projectId) {
    currentProjectId = projectId;
    const project = projectsData[projectId];
    
    if (!project) return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('project-modal');
    if (!modal) {
        modal = createProjectModal();
    }
    
    // Update modal content
    document.querySelector('.project-title').textContent = project.title;
    document.querySelector('.project-category').textContent = formatCategory(project.category);
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

// Create project modal
function createProjectModal() {
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.id = 'project-modal';
    
    modal.innerHTML = `
        <div class="project-modal-content">
            <button class="project-close" onclick="closeProject()">&times;</button>
            <div class="project-header">
                <h2 class="project-title"></h2>
                <p class="project-category"></p>
            </div>
            
            <div class="project-description">
                <p></p>
            </div>
            
            <div class="project-gallery">
                <div class="main-image">
                    <img src="" alt="" id="project-main-image">
                </div>
                <div class="thumbnail-grid" id="project-thumbnails">
                    <!-- Thumbnails will be dynamically inserted here -->
                </div>
            </div>
            
            <div class="project-details">
                <div class="detail-item">
                    <h4>Client</h4>
                    <p id="project-client"></p>
                </div>
                <div class="detail-item">
                    <h4>Location</h4>
                    <p id="project-location"></p>
                </div>
                <div class="detail-item">
                    <h4>Year</h4>
                    <p id="project-year"></p>
                </div>
                <div class="detail-item">
                    <h4>Area</h4>
                    <p id="project-area"></p>
                </div>
            </div>
            
            <div class="project-navigation">
                <button class="prev-project" onclick="navigateProject('prev')">← Previous Project</button>
                <button class="next-project" onclick="navigateProject('next')">Next Project →</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
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

// Format category for display
function formatCategory(category) {
    const categoryMap = {
        'residential': 'Residential',
        'commercial': 'Commercial',
        'interior': 'Interior',
        'exterior': 'Exterior',
        'residential interior': 'Residential • Interior',
        'residential exterior': 'Residential • Exterior',
        'commercial interior': 'Commercial • Interior',
        'commercial exterior': 'Commercial • Exterior'
    };
    
    return categoryMap[category] || category;
}