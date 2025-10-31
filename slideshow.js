// Slideshow logic moved from script.js
document.addEventListener('DOMContentLoaded', function() {
    const images = [
        'Images2/Staffy.png',
        'Images2/Staffy2.png',
        'Images2/Staffy3.png',
        'Images2/Staffy4.png',
        'Images2/Staffy5.png',
        'Images2/Staffy6.png',
        'Images2/Staffy7.png',
        'Images2/Staffy8.png',
        'Images2/Staffy9.png',
        'Images2/Staffy10.png'
    ];

    const slideshow = document.getElementById('slideshow');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let current = 0;

    function createSlides() {
        images.forEach((src, i) => {
            const slide = document.createElement('div');
            slide.className = 'slideshow-slide';
            slide.setAttribute('data-index', i);

            const img = document.createElement('img');
                img.src = src;
                img.alt = `Staffy image ${i + 1}`;
                // Performance & responsiveness
                img.loading = 'lazy';
                img.decoding = 'async';
                // If you add different-size image files later, replace the srcset with proper variants.
                img.setAttribute('srcset', `${src} 1x`);
                img.setAttribute('sizes', '(max-width:479px) 100vw, (min-width:768px) 50vw, 700px');

            slide.appendChild(img);
            slideshow.appendChild(slide);
        });
    }

    function showSlide(index) {
        const slides = slideshow.querySelectorAll('.slideshow-slide');
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(s => s.classList.remove('active'));
        const active = slideshow.querySelector(`.slideshow-slide[data-index="${current}"]`);
        if (active) active.classList.add('active');
    }

    prevBtn.addEventListener('click', function() { showSlide(current - 1); });
    nextBtn.addEventListener('click', function() { showSlide(current + 1); });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') showSlide(current - 1);
        if (e.key === 'ArrowRight') showSlide(current + 1);
    });

    // Initialize
    createSlides();
    showSlide(0);
});
