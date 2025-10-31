document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('menu');

    hamburger.addEventListener('click', function() {
        menu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Close menu when clicking on a link
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Rewrite links in popular posts to point to specific Community Stories on share.html
    try {
    const STORAGE_KEY = 'staffyStories:v1';
    const popularContainers = document.querySelectorAll('.popular-posts, .popular-posts-container, .popular-dogs, .popular-dogs-container');

        if (popularContainers && popularContainers.length) {
            let stories = [];
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                stories = raw ? JSON.parse(raw) : [];
            } catch (_) {
                stories = [];
            }

            // Newest first
            stories.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            popularContainers.forEach(container => {
                const anchors = Array.from(container.querySelectorAll('a'));
                if (stories.length > 0) {
                    anchors.forEach((a, idx) => {
                        const story = stories[idx];
                        if (story) {
                            const dogName = story.dogName || 'Community Story';
                            const storyId = story.id ? `story-${story.id}` : 'stories-list-section';
                            a.setAttribute('href', `share.html#${storyId}`);
                            a.textContent = dogName;
                            a.setAttribute('rel', 'noopener');
                            a.setAttribute('title', `${dogName} — view story`);
                        } else {
                            // Fallback for extra anchors beyond available stories
                            a.setAttribute('href', 'share.html#stories-list-section');
                            a.setAttribute('rel', 'noopener');
                        }
                    });
                } else {
                    // No stories available yet; keep existing text but make sure they point to stories section
                    anchors.forEach(a => {
                        a.setAttribute('href', 'share.html#stories-list-section');
                        a.setAttribute('rel', 'noopener');
                    });
                }
            });
        }
    } catch (e) {
        // Fail silently if DOM not as expected
        console.warn('Popular posts link rewrite failed:', e);
    }
});

// Slideshow logic
// (Slideshow logic moved to slideshow.js)
