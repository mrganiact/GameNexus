document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const addImageBtn = document.getElementById('add-image-btn');
  const uploadEmptyBtn = document.getElementById('upload-empty-btn');
  const uploadModal = document.getElementById('upload-modal');
  const closeModal = document.getElementById('close-modal');
  const uploadForm = document.getElementById('upload-form');
  const imageGrid = document.getElementById('image-grid');
  const emptyState = document.getElementById('empty-state');
  const imageFileInput = document.getElementById('image-file');
  const imagePreview = document.getElementById('image-preview');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  const fabBtn = document.getElementById('fab-btn');
  const profilePic = document.getElementById('profile-pic');
  const searchBar = document.getElementById('searchbar');
  const searchBtn = document.getElementById('search-btn');

  // Initial fetch
  fetchUserProfile();
  fetchPosts();

  // Event Listeners
  addImageBtn?.addEventListener('click', openUploadModal);
  uploadEmptyBtn?.addEventListener('click', openUploadModal);
  fabBtn?.addEventListener('click', openUploadModal);
  closeModal?.addEventListener('click', closeUploadModal);
  searchBtn?.addEventListener('click', performSearch);
  searchBar?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') performSearch();
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === uploadModal) closeUploadModal();
  });

  // Image preview handler
  imageFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Form submission with better error handling
  uploadForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = uploadForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';

    try {
      const formData = new FormData(uploadForm);
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Success handling
      fetchPosts();
      closeUploadModal();
      resetForm();
      showToast('Image uploaded successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      showToast(error.message || 'Error uploading image', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Upload Image';
    }
  });

  // Mobile menu toggle
  mobileMenuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Functions
  function openUploadModal() {
    uploadModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      uploadModal.classList.add('active');
    }, 10);
  }

  function closeUploadModal() {
    uploadModal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      uploadModal.style.display = 'none';
      resetForm();
    }, 300);
  }

  function resetForm() {
    uploadForm.reset();
    imagePreview.style.display = 'none';
    imagePreview.src = '';
  }

  function performSearch() {
    const query = searchBar.value.trim();
    fetchPosts(query);
  }

  async function fetchUserProfile() {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const user = await response.json();
        if (user.propic) {
          profilePic.src = user.propic;
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  async function fetchPosts(query = '') {
    try {
      const url = query ? `/api/posts?q=${encodeURIComponent(query)}` : '/api/posts';
      const response = await fetch(url);

      if (response.ok) {
        const posts = await response.json();
        renderPosts(posts);
        toggleEmptyState(posts.length === 0);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      showToast('Error loading posts', 'error');
    }
  }

  // Add image click to open preview modal
  function renderPosts(posts) {
    imageGrid.innerHTML = '';
    posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'grid-item';
      postElement.innerHTML = `
      <img src="${post.filename}" alt="${post.title}" loading="lazy">
      <div class="post-info">
        <span class="post-title">${post.title}</span>
        <span class="post-description">${post.description}</span>
      </div>
    `;
      postElement.querySelector('img').addEventListener('click', () => openImagePreview(post));
      imageGrid.appendChild(postElement);
    });
  }

  // Image Preview Modal handlers
  const imageViewModal = document.getElementById('image-view-modal');
  const modalImage = document.getElementById('modal-image');
  const modalInfo = document.getElementById('modal-info');
  const imageViewClose = document.getElementById('image-view-close');

  function openImagePreview(post) {
    modalImage.src = post.filename;
    modalInfo.innerHTML = `<strong>${post.title}</strong><br>${post.description}`;
    imageViewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  imageViewClose?.addEventListener('click', () => {
    imageViewModal.classList.remove('active');
    document.body.style.overflow = '';
  });


  function toggleEmptyState(isEmpty) {
    emptyState.style.display = isEmpty ? 'flex' : 'none';
    imageGrid.style.display = isEmpty ? 'none' : 'grid';
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Responsive handling
  function handleResponsive() {
    if (window.innerWidth <= 768) {
      fabBtn.style.display = 'flex';
      addImageBtn.style.display = 'none';
    } else {
      fabBtn.style.display = 'none';
      addImageBtn.style.display = 'block';
    }
  }

  window.addEventListener('resize', handleResponsive);
  handleResponsive();
});

// Helper function for toast notifications
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}


