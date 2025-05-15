
// DOM Elements
const addUserModal = document.getElementById('addUserModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const userForm = document.getElementById('userForm');
const adminsGrid = document.getElementById('adminsGrid');
const playersGrid = document.getElementById('playersGrid');
const roleAdmin = document.getElementById('roleAdmin');
const rolePlayer = document.getElementById('rolePlayer');
const passwordGroup = document.getElementById('passwordGroup');
const passwordModal = document.getElementById('passwordModal');
const closePasswordModal = document.getElementById('closePasswordModal');
const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
const savePasswordBtn = document.getElementById('savePasswordBtn');
const passwordForm = document.getElementById('passwordForm');
const fabBtn = document.getElementById('fab-btn');
const sidebar = document.getElementById('sidebar');
const mobileSearchBtn = document.getElementById('mobile-search-btn');
const mobileSearchContainer = document.getElementById('mobile-search-container');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

// Sample data
let users = [];
let adminPassword = "admin123"; // Default admin password



// DOM Elements

// Mobile menu toggle functionality
mobileMenuBtn?.addEventListener('click', function() {
    // Toggle sidebar
    sidebar.classList.toggle('active');
    
    // Toggle mobile menu button animation
    this.classList.toggle('active');
    
    // Toggle body overflow to prevent scrolling when sidebar is open
    document.body.classList.toggle('no-scroll');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnMenuBtn = event.target === mobileMenuBtn || mobileMenuBtn.contains(event.target);
    
    if (window.innerWidth <= 1024 && 
        !isClickInsideSidebar && 
        !isClickOnMenuBtn && 
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
});

// Close sidebar when a link is clicked (for mobile)
document.querySelectorAll('.sidebar-item a').forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 1024) {
        // Reset sidebar and menu button on larger screens
        sidebar.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
});
// Colors for avatars
const avatarColors = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#d35400', '#34495e'
];

// Event Listeners


addUserDesktopBtn.addEventListener('click', () => {
  addUserModal.style.display = 'flex';
});

fabBtn.addEventListener('click', () => {
  addUserModal.style.display = 'flex';
});

closeModal.addEventListener('click', closeUserModal);
cancelBtn.addEventListener('click', closeUserModal);
saveBtn.addEventListener('click', saveUser);

// Role selection change
roleAdmin.addEventListener('change', togglePasswordField);
rolePlayer.addEventListener('change', togglePasswordField);

// Password modal events
closePasswordModal.addEventListener('click', closePasswordChangeModal);
cancelPasswordBtn.addEventListener('click', closePasswordChangeModal);
savePasswordBtn.addEventListener('click', changeAdminPassword);

// Right-click context menu for password change
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.user-header')) {
    e.preventDefault();
    passwordModal.style.display = 'flex';
  }
});

// Mobile menu toggle

// Mobile search toggle

// Close sidebar when clicking on a link (for mobile)
// Mobile menu toggle



// Functions
function closeUserModal() {
  addUserModal.style.display = 'none';
  userForm.reset();
}

function closePasswordChangeModal() {
  passwordModal.style.display = 'none';
  passwordForm.reset();
}

function togglePasswordField() {
  if (roleAdmin.checked) {
    passwordGroup.style.display = 'block';
  } else {
    passwordGroup.style.display = 'none';
  }
}

function saveUser() {
  const name = document.getElementById('userName').value;
  const username = document.getElementById('userUsername').value;
  const role = document.querySelector('input[name="userRole"]:checked').value;
  const password = document.getElementById('userPassword').value;

  // Validate admin password if adding admin
  if (role === 'admin' && password !== adminPassword) {
    alert('Incorrect admin password!');
    return;
  }

  // Check if username already exists
  if (users.some(user => user.username === username)) {
    alert('Username already exists!');
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    name,
    username,
    role,
    initials: getInitials(name),
    color: getRandomColor(),
    joinDate: new Date().toLocaleDateString()
  };

  users.push(newUser);
  renderUsers();
  closeUserModal();
}

function changeAdminPassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (currentPassword !== adminPassword) {
    alert('Current password is incorrect!');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('New passwords do not match!');
    return;
  }

  if (newPassword.length < 4) {
    alert('Password must be at least 4 characters!');
    return;
  }

  adminPassword = newPassword;
  alert('Admin password changed successfully!');
  closePasswordChangeModal();
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getRandomColor() {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  users = users.filter(user => user.id !== userId);
  renderUsers();
}

function renderUsers() {
  // Clear grids
  adminsGrid.innerHTML = '';
  playersGrid.innerHTML = '';

  // Filter users by role
  const admins = users.filter(user => user.role === 'admin');
  const players = users.filter(user => user.role === 'player');

  // Render admins
  if (admins.length > 0) {
    admins.forEach(admin => {
      const card = createUserCard(admin);
      adminsGrid.appendChild(card);
    });
  } else {
    adminsGrid.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-user-slash"></i>
            <h3>No Admins Found</h3>
            <p>Add administrators to manage the system</p>
          </div>
        `;
  }

  // Render players
  if (players.length > 0) {
    players.forEach(player => {
      const card = createUserCard(player);
      playersGrid.appendChild(card);
    });
  } else {
    playersGrid.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-user-slash"></i>
            <h3>No Players Found</h3>
            <p>Add players to join the game</p>
          </div>
        `;
  }
}

function createUserCard(user) {
  const card = document.createElement('div');
  card.className = 'user-card';

  card.innerHTML = `
        <button class="delete-btn" onclick="deleteUser(${user.id})">
          <i class="fas fa-times"></i>
        </button>
        <div class="user-avatar" style="background-color: ${user.color}">${user.initials}</div>
        <div class="user-name">${user.name}</div>
        <div class="user-role ${user.role === 'admin' ? 'role-admin' : 'role-player'}">
          ${user.role === 'admin' ? 'Admin' : 'Player'}
        </div>
        <div class="user-tooltip">
          <div class="tooltip-title">${user.name}</div>
          <div class="tooltip-info"><strong>Username:</strong> ${user.username}</div>
          <div class="tooltip-info"><strong>Role:</strong> ${user.role === 'admin' ? 'Administrator' : 'Player'}</div>
          <div class="tooltip-info"><strong>ID:</strong> ${user.id}</div>
          <div class="tooltip-info"><strong>Joined:</strong> ${user.joinDate}</div>
        </div>
      `;

  return card;
}

// Initialize
togglePasswordField();

// Add some sample users
users = [
  {
    id: 1,
    name: "Admin User",
    username: "admin",
    role: "admin",
    initials: "AU",
    color: "#3498db",
    joinDate: new Date().toLocaleDateString()
  },
  {
    id: 2,
    name: "Game Player",
    username: "player1",
    role: "player",
    initials: "GP",
    color: "#e74c3c",
    joinDate: new Date().toLocaleDateString()
  }
];

renderUsers();



// सभी sidebar-item पर क्लिक इवेंट लगाएं
document.querySelectorAll('.sidebar-item').forEach(function (item) {
  item.addEventListener('click', function () {
    // अंदर मौजूद <a> एलिमेंट को ढूंढो
    const link = item.querySelector('a');
    if (link) {
      // लिंक पर click simulate करो
      window.location.href = link.getAttribute('href');
    }
  });
});


