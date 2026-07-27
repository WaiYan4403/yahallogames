(function () {
    const measurementId = (window.GA_MEASUREMENT_ID || 'G-L9Q1SKLFL2').trim();

    if (!measurementId) {
        console.info('Analytics disabled: GA_MEASUREMENT_ID is not set.');
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
        anonymize_ip: true
    });
})();
