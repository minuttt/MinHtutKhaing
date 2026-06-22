// ===== INFINITE DRAG GALLERY LOADING SCREEN =====
(function() {
    // Personal photos from Loading images folder (JPG only - browsers don't support HEIC)
    const personalPhotos = [
        'Loading images/Loading images/1354d826-0e6b-43f4-bad2-c49c270e16a1.jpg',
        'Loading images/Loading images/5DE894B2-3103-4C30-8DFE-08793200DB9A.jpg',
        'Loading images/Loading images/7e64b24a-4c78-4d02-bf91-79aea9547b8e.jpg',
        'Loading images/Loading images/99bb0256-edc8-4e65-8cae-5ed7cc35ea88.jpg',
        'Loading images/Loading images/IMG_6082.JPG'
    ];

    // Duplicate photos to create rich infinite grid effect
    const photos = [];
    for (let i = 0; i < 30; i++) {
        photos.push(personalPhotos[i % personalPhotos.length]);
    }

    // Elements
    const loader = document.getElementById('premium-loader');
    const galleryGrid = document.getElementById('gallery-grid');
    const dragContainer = document.getElementById('drag-gallery');
    const loadingInfo = document.getElementById('loading-info');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressEta = document.getElementById('progress-eta');
    const connectionBadge = document.getElementById('connection-badge');
    const landingVideo = document.getElementById('landing-video');
    const wormholeVideo = document.getElementById('wormhole-video');

    // State
    let isDragging = false;
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let velocityX = 0, velocityY = 0;
    let lastX = 0, lastY = 0;
    let hasScrolled = false;
    let loadProgress = 0;
    let videosLoaded = false;
    let connectionSpeed = 10;
    let maxLoadTime = 15000;
    const startTime = Date.now();

    // Populate gallery with photos (4 rows for infinite scroll effect)
    for (let row = 0; row < 4; row++) {
        photos.forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.style.animationDelay = `${Math.random() * 1.5 + 1.5}s`;

            const img = document.createElement('img');
            img.src = photo;
            img.alt = `Personal photo ${index + 1}`;
            img.draggable = false;

            item.appendChild(img);
            galleryGrid.appendChild(item);
        });
    }

    // Drag functionality
    function handleDragStart(e) {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        lastX = currentX;
        lastY = currentY;
        dragContainer.classList.add('dragging');
        velocityX = 0;
        velocityY = 0;
    }

    function handleDragMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        currentX = lastX + deltaX;
        currentY = lastY + deltaY;

        velocityX = deltaX * 0.05;
        velocityY = deltaY * 0.05;

        galleryGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;

        // Move info overlay down when user interacts
        if (!hasScrolled && (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20)) {
            hasScrolled = true;
            loadingInfo.classList.add('scrolled');
        }
    }

    function handleDragEnd() {
        isDragging = false;
        dragContainer.classList.remove('dragging');
        applyMomentum();
    }

    function applyMomentum() {
        if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) return;

        currentX += velocityX;
        currentY += velocityY;

        velocityX *= 0.95;
        velocityY *= 0.95;

        galleryGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;

        requestAnimationFrame(applyMomentum);
    }

    // Wheel scroll
    function handleWheel(e) {
        if (!isDragging) {
            e.preventDefault();
            currentY -= e.deltaY * 2.7;
            galleryGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;

            if (!hasScrolled && Math.abs(e.deltaY) > 5) {
                hasScrolled = true;
                loadingInfo.classList.add('scrolled');
            }
        }
    }

    // Event listeners
    dragContainer.addEventListener('mousedown', handleDragStart);
    dragContainer.addEventListener('touchstart', handleDragStart, { passive: false });
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('wheel', handleWheel, { passive: false });

    // Connection detection
    function detectConnection() {
        try {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (conn && conn.downlink) {
                connectionSpeed = conn.downlink;
            } else if (conn && conn.effectiveType) {
                const types = { 'slow-2g': 0.5, '2g': 1, '3g': 3, '4g': 20 };
                connectionSpeed = types[conn.effectiveType] || 10;
            }

            const estimatedSeconds = (88 * 8) / connectionSpeed;
            maxLoadTime = Math.min(Math.max(estimatedSeconds * 1000 * 1.2, 10000), 30000);

            if (connectionSpeed >= 20) {
                connectionBadge.textContent = '🚀 Lightning Fast';
                connectionBadge.className = 'connection-badge connection-fast';
            } else if (connectionSpeed >= 5) {
                connectionBadge.textContent = '⚡ Smooth Connection';
                connectionBadge.className = 'connection-badge connection-medium';
            } else {
                connectionBadge.textContent = '🐌 Hang tight...';
                connectionBadge.className = 'connection-badge connection-slow';
            }
        } catch (err) {
            connectionBadge.textContent = '⚡ Loading...';
            connectionBadge.className = 'connection-badge connection-medium';
        }
    }

    detectConnection();

    // Progress tracking
    function updateProgress(percent) {
        loadProgress = Math.min(percent, 100);
        progressBar.style.width = loadProgress + '%';
        progressPercentage.textContent = Math.floor(loadProgress) + '%';

        const elapsed = Date.now() - startTime;
        const remaining = ((maxLoadTime * (100 - loadProgress)) / 100) / 1000;
        if (remaining > 0 && !videosLoaded) {
            progressEta.textContent = `ETA: ${Math.ceil(remaining)}s`;
        } else {
            progressEta.textContent = 'Almost ready...';
        }
    }

    // Smooth progress animation
    let animProgress = 0;
    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const timeProgress = (elapsed / maxLoadTime) * 100;

        if (videosLoaded) {
            animProgress += (100 - animProgress) * 0.15;
        } else {
            animProgress += (Math.min(timeProgress, 95) - animProgress) * 0.1;
        }

        updateProgress(animProgress);

        if (animProgress >= 99.5) {
            clearInterval(progressInterval);
            completeLoading();
        }
    }, 50);

    // Force complete after max time
    setTimeout(() => {
        if (!videosLoaded) {
            videosLoaded = true;
        }
    }, maxLoadTime);

    // Track videos
    let landingReady = false;
    let wormholeReady = false;

    function checkVideosReady() {
        if (landingReady && wormholeReady) {
            videosLoaded = true;
        }
    }

    if (landingVideo) {
        landingVideo.addEventListener('canplaythrough', () => {
            landingReady = true;
            checkVideosReady();
        }, { once: true });
        landingVideo.load();
    }

    if (wormholeVideo) {
        wormholeVideo.addEventListener('canplaythrough', () => {
            wormholeReady = true;
            checkVideosReady();
        }, { once: true });
        wormholeVideo.load();
    }

    // Complete loading
    function completeLoading() {
        loadingInfo.querySelector('.loading-title').textContent = 'All Set!';
        loadingInfo.querySelector('.loading-subtitle').innerHTML = '<span class="loading-complete">✓ Loading Complete</span><br>Welcome to my portfolio...';
        progressEta.textContent = 'Ready!';

        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 800);
        }, 1500);
    }
})();
