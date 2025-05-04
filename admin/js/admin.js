// Admin Panel JavaScript - js/admin.js

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
let authToken = localStorage.getItem('authToken');

// DOM Elements
const loginContainer = document.getElementById('login-container');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.admin-section');
const toast = document.getElementById('toast');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
        loadSlides();
        loadProjects();
    } else {
        showLogin();
    }

    // Navigation event listeners
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            switchSection(sectionId);
        });
    });
});

// Show login form
function showLogin() {
    loginContainer.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

// Show dashboard
function showDashboard() {
    loginContainer.style.display = 'none';
    adminDashboard.style.display = 'block';
}

// Switch between sections
function switchSection(sectionId) {
    navBtns.forEach(btn => btn.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));

    const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
    const activeSection = document.getElementById(`${sectionId}-section`);

    if (activeBtn && activeSection) {
        activeBtn.classList.add('active');
        activeSection.classList.add('active');
    }
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            showDashboard();
            loadSlides();
            loadProjects();
        } else {
            const error = await response.json();
            document.getElementById('login-error').textContent = error.message || 'Login failed';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('login-error').textContent = 'An error occurred. Please try again.';
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    authToken = null;
    showLogin();
});

// Load slides
async function loadSlides() {
    try {
        const response = await fetch(`${API_BASE_URL}/slides`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const slides = await response.json();
            displaySlides(slides);
        }
    } catch (error) {
        console.error('Error loading slides:', error);
        showToast('Error loading slides');
    }
}

// Display slides
function displaySlides(slides) {
    const slideList = document.getElementById('slide-list');
    slideList.innerHTML = '';

    slides.forEach(slide => {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide-item';
        slideElement.innerHTML = `
            <div class="slide-info">
                <h4>${slide.title}</h4>
                <p>${slide.description.substring(0, 100)}...</p>
            </div>
            <div class="slide-actions">
                <button class="btn-edit" onclick="editSlide('${slide.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteSlide('${slide.id}')">Delete</button>
            </div>
        `;
        slideList.appendChild(slideElement);
    });
}

// Add new slide button
document.getElementById('add-slide-btn').addEventListener('click', () => {
    showSlideForm();
});

// Show slide form
function showSlideForm(slide = null) {
    const form = document.getElementById('slide-edit-form');
    const formTitle = document.getElementById('slide-form-title');
    const slideForm = document.getElementById('slide-form');

    formTitle.textContent = slide ? 'Edit Slide' : 'Add New Slide';
    form.style.display = 'block';

    if (slide) {
        document.getElementById('slide-id').value = slide.id;
        document.getElementById('slide-title').value = slide.title;
        document.getElementById('slide-description').value = slide.description;
        
        // Show existing images
        if (slide.desktopImage) {
            const desktopPreview = document.getElementById('desktop-preview');
            desktopPreview.src = slide.desktopImage;
            desktopPreview.style.display = 'block';
        }
        
        if (slide.mobileImage) {
            const mobilePreview = document.getElementById('mobile-preview');
            mobilePreview.src = slide.mobileImage;
            mobilePreview.style.display = 'block';
        }
    } else {
        slideForm.reset();
        document.getElementById('desktop-preview').style.display = 'none';
        document.getElementById('mobile-preview').style.display = 'none';
    }
}

// Cancel slide form
document.getElementById('cancel-slide-btn').addEventListener('click', () => {
    document.getElementById('slide-edit-form').style.display = 'none';
});

// Handle slide form submission
document.getElementById('slide-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const slideId = document.getElementById('slide-id').value;
    
    formData.append('title', document.getElementById('slide-title').value);
    formData.append('description', document.getElementById('slide-description').value);
    
    const desktopImage = document.getElementById('slide-desktop-image').files[0];
    if (desktopImage) {
        formData.append('desktopImage', desktopImage);
    }
    
    const mobileImage = document.getElementById('slide-mobile-image').files[0];
    if (mobileImage) {
        formData.append('mobileImage', mobileImage);
    }
    
    try {
        const url = slideId ? `${API_BASE_URL}/slides/${slideId}` : `${API_BASE_URL}/slides`;
        const method = slideId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (response.ok) {
            showToast(slideId ? 'Slide updated successfully' : 'Slide added successfully');
            document.getElementById('slide-edit-form').style.display = 'none';
            loadSlides();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to save slide', 'error');
        }
    } catch (error) {
        console.error('Error saving slide:', error);
        showToast('An error occurred while saving the slide', 'error');
    }
});

// Edit slide
async function editSlide(slideId) {
    try {
        const response = await fetch(`${API_BASE_URL}/slides/${slideId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const slide = await response.json();
            showSlideForm(slide);
        }
    } catch (error) {
        console.error('Error loading slide:', error);
        showToast('Error loading slide details', 'error');
    }
}

// Delete slide
async function deleteSlide(slideId) {
    if (!confirm('Are you sure you want to delete this slide?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/slides/${slideId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showToast('Slide deleted successfully');
            loadSlides();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to delete slide', 'error');
        }
    } catch (error) {
        console.error('Error deleting slide:', error);
        showToast('An error occurred while deleting the slide', 'error');
    }
}

// Load projects
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const projects = await response.json();
            displayProjects(projects);
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        showToast('Error loading projects');
    }
}

// Display projects
function displayProjects(projects) {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';

    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-item';
        projectElement.innerHTML = `
            <div class="project-info">
                <h4>${project.title}</h4>
                <p>${project.category} • ${project.location}</p>
            </div>
            <div class="project-actions">
                <button class="btn-edit" onclick="editProject('${project.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteProject('${project.id}')">Delete</button>
            </div>
        `;
        projectList.appendChild(projectElement);
    });
}

// Add new project button
document.getElementById('add-project-btn').addEventListener('click', () => {
    showProjectForm();
});

// Show project form
function showProjectForm(project = null) {
    const form = document.getElementById('project-edit-form');
    const formTitle = document.getElementById('project-form-title');
    const projectForm = document.getElementById('project-form');

    formTitle.textContent = project ? 'Edit Project' : 'Add New Project';
    form.style.display = 'block';

    if (project) {
        document.getElementById('project-id').value = project.id;
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-category').value = project.category;
        document.getElementById('project-description').value = project.description;
        document.getElementById('project-client').value = project.client;
        document.getElementById('project-location').value = project.location;
        document.getElementById('project-year').value = project.year;
        document.getElementById('project-area').value = project.area;
        
        // Show existing cover image
        if (project.coverImage) {
            const coverPreview = document.getElementById('cover-preview');
            coverPreview.src = project.coverImage;
            coverPreview.style.display = 'block';
        }
        
        // Show existing project images
        if (project.images && project.images.length > 0) {
            displayProjectImages(project.images);
        }
    } else {
        projectForm.reset();
        document.getElementById('cover-preview').style.display = 'none';
        document.getElementById('images-preview').innerHTML = '';
    }
}

// Display project images in the form
function displayProjectImages(images) {
    const imagesPreview = document.getElementById('images-preview');
    imagesPreview.innerHTML = '';
    
    images.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${image}" alt="Project image ${index + 1}">
            <button type="button" class="remove-image" onclick="removeProjectImage(${index})">&times;</button>
        `;
        imagesPreview.appendChild(imageItem);
    });
}

// Cancel project form
document.getElementById('cancel-project-btn').addEventListener('click', () => {
    document.getElementById('project-edit-form').style.display = 'none';
});

// Handle project form submission
document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const projectId = document.getElementById('project-id').value;
    
    formData.append('title', document.getElementById('project-title').value);
    formData.append('category', document.getElementById('project-category').value);
    formData.append('description', document.getElementById('project-description').value);
    formData.append('client', document.getElementById('project-client').value);
    formData.append('location', document.getElementById('project-location').value);
    formData.append('year', document.getElementById('project-year').value);
    formData.append('area', document.getElementById('project-area').value);
    
    const coverImage = document.getElementById('project-cover').files[0];
    if (coverImage) {
        formData.append('coverImage', coverImage);
    }
    
    const projectImages = document.getElementById('project-images').files;
    if (projectImages.length > 0) {
        Array.from(projectImages).forEach((image, index) => {
            formData.append('projectImages', image);
        });
    }
    
    try {
        const url = projectId ? `${API_BASE_URL}/projects/${projectId}` : `${API_BASE_URL}/projects`;
        const method = projectId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (response.ok) {
            showToast(projectId ? 'Project updated successfully' : 'Project added successfully');
            document.getElementById('project-edit-form').style.display = 'none';
            loadProjects();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to save project', 'error');
        }
    } catch (error) {
        console.error('Error saving project:', error);
        showToast('An error occurred while saving the project', 'error');
    }
});

// Edit project
async function editProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const project = await response.json();
            showProjectForm(project);
        }
    } catch (error) {
        console.error('Error loading project:', error);
        showToast('Error loading project details', 'error');
    }
}

// Delete project
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            showToast('Project deleted successfully');
            loadProjects();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to delete project', 'error');
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        showToast('An error occurred while deleting the project', 'error');
    }
}

// Image preview handlers
document.getElementById('slide-desktop-image').addEventListener('change', function(e) {
    previewImage(e.target, 'desktop-preview');
});

document.getElementById('slide-mobile-image').addEventListener('change', function(e) {
    previewImage(e.target, 'mobile-preview');
});

document.getElementById('project-cover').addEventListener('change', function(e) {
    previewImage(e.target, 'cover-preview');
});

document.getElementById('project-images').addEventListener('change', function(e) {
    previewMultipleImages(e.target, 'images-preview');
});

// Preview single image
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.style.display = 'none';
    }
}

// Preview multiple images
function previewMultipleImages(input, previewId) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = '';
    
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item';
                imageItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <button type="button" class="remove-image" onclick="removeNewImage(${index})">&times;</button>
                `;
                preview.appendChild(imageItem);
            };
            
            reader.readAsDataURL(file);
        });
    }
}

// Remove new image from preview
function removeNewImage(index) {
    // This is a simplified version. In a real implementation, you'd need to manage the file input
    const imageItem = event.target.closest('.image-item');
    imageItem.remove();
}

// Settings form handlers
document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/settings/password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        if (response.ok) {
            showToast('Password updated successfully');
            e.target.reset();
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to update password', 'error');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        showToast('An error occurred while updating password', 'error');
    }
});

// Contact info form handler
document.getElementById('contact-info-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const contactData = {
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        address: document.getElementById('contact-address').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/settings/contact`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });
        
        if (response.ok) {
            showToast('Contact information updated successfully');
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to update contact information', 'error');
        }
    } catch (error) {
        console.error('Error updating contact info:', error);
        showToast('An error occurred while updating contact information', 'error');
    }
});

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Close toast on click
document.querySelector('.toast-close').addEventListener('click', () => {
    document.getElementById('toast').className = 'toast';
});

// Image optimization function
function optimizeImage(file, maxWidth, maxHeight, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, file.type, quality);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Load contact information on settings page
async function loadContactInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/settings/contact`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('contact-email').value = data.email || '';
            document.getElementById('contact-phone').value = data.phone || '';
            document.getElementById('contact-address').value = data.address || '';
        }
    } catch (error) {
        console.error('Error loading contact info:', error);
    }
}

// Load contact info when settings section is shown
document.querySelector('[data-section="settings"]').addEventListener('click', () => {
    loadContactInfo();
});

// Initialize the admin panel
function initializeAdminPanel() {
    // Check if all required elements exist
    const requiredElements = [
        'login-container',
        'admin-dashboard',
        'login-form',
        'logout-btn',
        'slide-list',
        'project-list',
        'toast'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return;
    }
    
    // Add event listeners for cancel buttons if they exist
    const cancelSlideBtn = document.getElementById('cancel-slide-btn');
    if (cancelSlideBtn) {
        cancelSlideBtn.addEventListener('click', () => {
            document.getElementById('slide-edit-form').style.display = 'none';
        });
    }
    
    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    if (cancelProjectBtn) {
        cancelProjectBtn.addEventListener('click', () => {
            document.getElementById('project-edit-form').style.display = 'none';
        });
    }
    
    // Initialize navigation
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            switchSection(sectionId);
        });
    });
    
    console.log('Admin panel initialized successfully');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAdminPanel);

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast('An unexpected error occurred', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred', 'error');
});

// Export functions for global access
window.editSlide = editSlide;
window.deleteSlide = deleteSlide;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.removeProjectImage = removeProjectImage;
window.removeNewImage = removeNewImage;