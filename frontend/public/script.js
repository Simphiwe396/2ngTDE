// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navBar = document.querySelector('.nav-bar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            if (navBar.style.display === 'flex') {
                navBar.style.display = 'none';
            } else {
                navBar.style.display = 'flex';
                navBar.style.flexDirection = 'column';
                navBar.style.position = 'fixed';
                navBar.style.top = '70px';
                navBar.style.left = '0';
                navBar.style.width = '100%';
                navBar.style.backgroundColor = 'var(--white)';
                navBar.style.padding = '20px';
                navBar.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                navBar.style.zIndex = '999';
            }
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 768 && navBar.style.display === 'flex') {
                    navBar.style.display = 'none';
                }
            }
        });
    });
    
    // Product category filtering
    const categoryLinks = document.querySelectorAll('.category-nav a');
    const productCards = document.querySelectorAll('.product-card');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            categoryLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            const filter = this.textContent.toLowerCase();
            
            productCards.forEach(card => {
                if (filter === 'all products') {
                    card.style.display = 'block';
                } else {
                    const productText = card.textContent.toLowerCase();
                    card.style.display = productText.includes(filter) ? 'block' : 'none';
                }
            });
        });
    });
});