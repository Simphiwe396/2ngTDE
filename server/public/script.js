// Contact form handling
if (document.getElementById('contact-form')) {
    document.getElementById('contact-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            message: document.getElementById('contact-message').value
        };
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            showNotification(result.message);
            
            if (result.success) {
                document.getElementById('contact-form').reset();
            }
        } catch (error) {
            showNotification('Error sending message. Please try again.');
        }
    });
}

// Newsletter subscription
if (document.getElementById('newsletter-form')) {
    document.getElementById('newsletter-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const result = await response.json();
            showNotification(result.message);
            
            if (result.success) {
                this.reset();
            }
        } catch (error) {
            showNotification('Error subscribing. Please try again.');
        }
    });
}

// Navigation active state
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === 'index.html' && linkHref === '#home')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setActiveNavLink();
    // ... rest of your existing initialization code
});