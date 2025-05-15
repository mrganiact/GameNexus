document.addEventListener('DOMContentLoaded', function () {
    // Avatar upload preview
    const avatarUpload = document.getElementById('avatarUpload');
    const avatarPreview = document.getElementById('avatarPreview');

    avatarUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                avatarPreview.innerHTML = '';
                avatarPreview.appendChild(img);
            }
            reader.readAsDataURL(file);
        }
    });

    // Anime character animation
    const animeChar = document.getElementById('animeChar');
    let floatDirection = 1;

    function animateCharacter() {
        const currentY = parseFloat(getComputedStyle(animeChar).getPropertyValue('translate').split(',')[1]) || 0;
        if (Math.abs(currentY) > 15) floatDirection *= -1;
        animeChar.style.translate = `0px ${currentY + floatDirection * 0.2}px`;
        requestAnimationFrame(animateCharacter);
    }
    animateCharacter();

    // Form elements
    const signupForm = document.getElementById('signupForm');
    const name = document.getElementById('name');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const dob = document.getElementById('dob');

    // Validation functions
    function validateName() {
        const valid = name.value.trim() !== '';
        if (!valid) {
            document.getElementById('nameError').style.display = 'block';
            name.style.borderColor = 'var(--accent-color)';
        } else {
            document.getElementById('nameError').style.display = 'none';
            name.style.borderColor = 'var(--border-color)';
        }
        return valid;
    }

    function validateUsername() {
        const valid = username.value.length >= 4;
        if (!valid) {
            document.getElementById('usernameError').style.display = 'block';
            username.style.borderColor = 'var(--accent-color)';
        } else {
            document.getElementById('usernameError').style.display = 'none';
            username.style.borderColor = 'var(--border-color)';
        }
        return valid;
    }

    function validateEmail() {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
        if (!valid) {
            document.getElementById('emailError').style.display = 'block';
            email.style.borderColor = 'var(--accent-color)';
        } else {
            document.getElementById('emailError').style.display = 'none';
            email.style.borderColor = 'var(--border-color)';
        }
        return valid;
    }

    function validatePassword() {
        const valid = password.value.length >= 8;
        if (!valid) {
            document.getElementById('passwordError').style.display = 'block';
            password.style.borderColor = 'var(--accent-color)';
        } else {
            document.getElementById('passwordError').style.display = 'none';
            password.style.borderColor = 'var(--border-color)';
        }
        return valid;
    }

    function validateDOB() {
        if (!dob.value) {
            document.getElementById('dobError').textContent = 'Date of birth is required';
            document.getElementById('dobError').style.display = 'block';
            dob.style.borderColor = 'var(--accent-color)';
            return false;
        }

        const dobDate = new Date(dob.value);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            age--;
        }

        const valid = age >= 13;
        if (!valid) {
            document.getElementById('dobError').textContent = 'You must be at least 13 years old';
            document.getElementById('dobError').style.display = 'block';
            dob.style.borderColor = 'var(--accent-color)';
        } else {
            document.getElementById('dobError').style.display = 'none';
            dob.style.borderColor = 'var(--border-color)';
        }
        return valid;
    }

    // Real-time validation event listeners
    name.addEventListener('input', validateName);
    username.addEventListener('input', validateUsername);
    email.addEventListener('input', validateEmail);
    password.addEventListener('input', validatePassword);
    dob.addEventListener('input', validateDOB);

    // Form submission handler
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate all fields
        const isNameValid = validateName();
        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isDOBValid = validateDOB();

        const isValid = isNameValid && isUsernameValid && isEmailValid && 
                       isPasswordValid && isDOBValid;

        if (isValid) {
            // Create FormData object to handle file upload
            const formData = new FormData(signupForm);
            
            // Show loading state
            const submitButton = signupForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Creating account...';

            // Send data to server
            fetch('/signup', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    return response.text().then(text => {
                        throw new Error(text || 'Unknown error occurred');
                    });
                }
            })
            .catch(error => {
                alert('Error: ' + error.message);
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
        }
    });
});