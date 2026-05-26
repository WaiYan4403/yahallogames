const featuredCarousel = document.getElementById('featuredCarousel');

if (featuredCarousel) {
    const slides = Array.from(featuredCarousel.querySelectorAll('.featured-slide'));
    const dots = Array.from(featuredCarousel.querySelectorAll('.carousel-dot'));
    const prevBtn = document.getElementById('featuredPrev');
    const nextBtn = document.getElementById('featuredNext');
    const configuredDuration = Number.parseInt(featuredCarousel.dataset.autoplayMs || '5000', 10);
    const autoRotateMs = Number.isFinite(configuredDuration) && configuredDuration >= 2000
        ? configuredDuration
        : 5000;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (currentIndex < 0) currentIndex = 0;

    let autoRotateId = null;

    function showSlide(index) {
        if (!slides.length) return;

        currentIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            const isActive = i === currentIndex;
            slide.classList.toggle('is-active', isActive);
            slide.setAttribute('aria-hidden', String(!isActive));
        });

        dots.forEach((dot, i) => {
            const isActive = i === currentIndex;
            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }

    function startAutoRotate() {
        if (prefersReducedMotion) return;
        stopAutoRotate();
        autoRotateId = setInterval(() => {
            showSlide(currentIndex + 1);
        }, autoRotateMs);
    }

    function stopAutoRotate() {
        if (autoRotateId) {
            clearInterval(autoRotateId);
            autoRotateId = null;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            showSlide(currentIndex - 1);
            startAutoRotate();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            showSlide(currentIndex + 1);
            startAutoRotate();
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const target = Number.parseInt(dot.dataset.slide || '0', 10);
            showSlide(target);
            startAutoRotate();
        });
    });

    featuredCarousel.addEventListener('mouseenter', stopAutoRotate);
    featuredCarousel.addEventListener('mouseleave', startAutoRotate);
    featuredCarousel.addEventListener('focusin', stopAutoRotate);
    featuredCarousel.addEventListener('focusout', (event) => {
        const nextTarget = event.relatedTarget;
        if (!nextTarget || !featuredCarousel.contains(nextTarget)) {
            startAutoRotate();
        }
    });

    featuredCarousel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            showSlide(currentIndex - 1);
            startAutoRotate();
        } else if (event.key === 'ArrowRight') {
            showSlide(currentIndex + 1);
            startAutoRotate();
        }
    });

    showSlide(currentIndex);
    startAutoRotate();
}
