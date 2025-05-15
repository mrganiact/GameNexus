document.addEventListener('DOMContentLoaded', function () {
  // Mobile menu toggle
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const searchbar = document.getElementById('searchbar');
  const mobileSearchBtn = document.getElementById('mobile-search-btn');

  hamburger.addEventListener('click', function () {
    this.classList.toggle('active');
    sidebar.classList.toggle('active');
  });

  // Mobile search toggle
  mobileSearchBtn.addEventListener('click', function () {
    searchbar.classList.toggle('active');
    if (searchbar.classList.contains('active')) {
      searchbar.focus();
    }
  });

  // Close search when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-center') && !e.target.closest('.mobile-search-btn')) {
      searchbar.classList.remove('active');
    }
  });

  // Edit profile functionality
  const editProfilePic = document.getElementById('edit-profile-pic');
  const editProfileModal = document.getElementById('edit-profile-modal');
  const closeEditModal = document.getElementById('close-edit-modal');
  const profilePicUpload = document.getElementById('profile-pic-upload');
  const profilePicPreview = document.getElementById('profile-pic-preview');

  // Open edit profile modal
  editProfilePic.addEventListener('click', function () {
    editProfileModal.style.display = 'flex';
    setTimeout(() => {
      editProfileModal.classList.add('active');
    }, 10);
  });

  // Close edit profile modal
  closeEditModal.addEventListener('click', function () {
    editProfileModal.classList.remove('active');
    setTimeout(() => {
      editProfileModal.style.display = 'none';
    }, 300);
  });

  // Close modal when clicking outside
  editProfileModal.addEventListener('click', function (e) {
    if (e.target === editProfileModal) {
      closeEditModal.click();
    }
  });

  // Preview profile picture when changed
  profilePicUpload.addEventListener('change', function (e) {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function (event) {
        profilePicPreview.src = event.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  // Handle form submission
  document.getElementById('profile-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Update nickname
    document.querySelector('.profile-info h2').textContent =
      document.getElementById('profile-nickname').value;

    // Update bio
    document.querySelector('.detail-item:last-child .detail-value').textContent =
      document.getElementById('profile-bio').value;

    // Update DOB
    const dob = new Date(document.getElementById('profile-dob').value);
    document.querySelector('.detail-item:first-child .detail-value').textContent =
      dob.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Update profile pic if changed
    if (profilePicUpload.files[0]) {
      const reader = new FileReader();
      reader.onload = function (event) {
        document.querySelector('.profile-pic').src = event.target.result;
      };
      reader.readAsDataURL(profilePicUpload.files[0]);
    }

    // Close modal
    closeEditModal.click();

    alert('Profile updated successfully!');
  });

  // Logout button functionality
  document.querySelector('.logout-btn').addEventListener('click', function () {
    if (confirm('Are you sure you want to log out?')) {
      alert('Logged out successfully');
      // In a real app, you would redirect to logout page
      // window.location.href = '/logout';
    }
  });
});

document.querySelectorAll('.sidebar-item').forEach(function (item) {
  item.addEventListener('click', function () {
    const link = item.querySelector('a');
    if (link) {
      window.location.href = link.getAttribute('href');
    }
  });
});

 async function fetchUserProfile() {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const user = await response.json();
        if (user.propic) {
          profilePic.src = `/static/propic/${user.propic}`;
          mobileProfileImg.src = `/static/propic/${user.propic}`;
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }


document.addEventListener('DOMContentLoaded', function () {
  // Edit profile modal
  const editProfilePic = document.getElementById('edit-profile-pic');
  const editProfileModal = document.getElementById('edit-profile-modal');
  const closeEditModal = document.getElementById('close-edit-modal');

  if (editProfilePic && editProfileModal) {
    editProfilePic.addEventListener('click', function () {
      editProfileModal.style.display = 'block';
    });

    closeEditModal.addEventListener('click', function () {
      editProfileModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
      if (event.target === editProfileModal) {
        editProfileModal.style.display = 'none';
      }
    });
  }

  // Profile picture preview
  const profilePicUpload = document.getElementById('profile-pic-upload');
  const profilePicPreview = document.getElementById('profile-pic-preview');

  if (profilePicUpload && profilePicPreview) {
    profilePicUpload.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          profilePicPreview.src = e.target.result;
        }
        reader.readAsDataURL(file);
      }
    });
  }
});
