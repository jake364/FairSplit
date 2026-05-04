// Nav dropdown interactivity
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const dropdown = item.querySelector('.dropdown');

        if (dropdown) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Close other dropdowns
                document.querySelectorAll('.dropdown').forEach(d => {
                    if (d !== dropdown) d.style.display = 'none';
                });
                // Toggle this one
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item')) {
            document.querySelectorAll('.dropdown').forEach(d => d.style.display = 'none');
        }
    });

    // Add some animation to feature cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.opacity = '1';
            }
        });
    });

    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.transform = 'translateY(20px)';
        card.style.opacity = '0';
        card.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        observer.observe(card);
    });

    // Add roommate functionality with nice card design
    $('#addRoommateBtn').on('click', function() {
        const name = $('#roommateName').val().trim();
        if (name) {
            const roommateCard = `
                <div class="roommate-card">
                    <div class="roommate-avatar">${name.charAt(0).toUpperCase()}</div>
                    <div class="roommate-info">
                        <h3>${name}</h3>
                        <p class="roommate-status">Active</p>
                    </div>
                    <button class="roommate-remove" data-name="${name}">✕</button>
                </div>
            `;
            $('#roommateList').append(roommateCard);
            $('#roommateName').val('');
        }
    });

    // Remove roommate functionality
    $(document).on('click', '.roommate-remove', function() {
        $(this).closest('.roommate-card').fadeOut(300, function() {
            $(this).remove();
        });
    });

    // Roommate search functionality
    $('#roommateSearch').on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase();
        $('.roommate-card').each(function() {
            const roommateNameEl = $(this).find('.roommate-info h3');
            const roommateNameText = roommateNameEl.text().toLowerCase();
            
            if (roommateNameText.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});