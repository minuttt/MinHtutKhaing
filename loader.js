// ===== INFINITE DRAG GALLERY LOADING SCREEN =====
(function() {
    console.log('🎨 LOADER: Starting initialization...');

    const allImages = [
        'Loading images/IMG_0173.jpg', 'Loading images/IMG_0176.jpg', 'Loading images/IMG_0192.jpg',
        'Loading images/IMG_0199.jpg', 'Loading images/IMG_0201.jpg', 'Loading images/IMG_0206.jpg',
        'Loading images/IMG_0208.jpg', 'Loading images/IMG_0212.jpg', 'Loading images/IMG_0218.jpg',
        'Loading images/IMG_0219.jpg', 'Loading images/IMG_0220.jpg', 'Loading images/IMG_0221.jpg',
        'Loading images/IMG_0226.jpg', 'Loading images/IMG_0236.jpg', 'Loading images/IMG_0237.jpg',
        'Loading images/IMG_0249.jpg', 'Loading images/IMG_0250.jpg', 'Loading images/IMG_0255.jpg',
        'Loading images/IMG_0257.jpg', 'Loading images/IMG_0267.jpg', 'Loading images/IMG_0268.jpg',
        'Loading images/IMG_0274.jpg', 'Loading images/IMG_0275.jpg', 'Loading images/IMG_0276.jpg',
        'Loading images/IMG_0277.jpg', 'Loading images/IMG_0283.jpg', 'Loading images/IMG_0301.jpg',
        'Loading images/IMG_0303.jpg', 'Loading images/IMG_0307.jpg', 'Loading images/IMG_0312.jpg',
        'Loading images/IMG_0331.jpg', 'Loading images/IMG_0333.jpg', 'Loading images/IMG_0343.jpg',
        'Loading images/IMG_0349.jpg', 'Loading images/IMG_0351.jpg', 'Loading images/IMG_0353.jpg',
        'Loading images/IMG_0355.jpg', 'Loading images/IMG_0357.jpg', 'Loading images/IMG_0359.jpg',
        'Loading images/IMG_0371.jpg', 'Loading images/IMG_0395.jpg', 'Loading images/IMG_0546.jpg',
        'Loading images/IMG_4130.jpg', 'Loading images/IMG_4144.jpg', 'Loading images/IMG_4154.jpg',
        'Loading images/IMG_7995.jpg', 'Loading images/IMG_8008.jpg', 'Loading images/IMG_8044.jpg',
        'Loading images/IMG_8051.jpg', 'Loading images/IMG_8053.jpg', 'Loading images/IMG_8062.jpg',
        'Loading images/IMG_8072.jpg', 'Loading images/IMG_8762.jpg', 'Loading images/IMG_8819.jpg',
        'Loading images/IMG_8990.jpg', 'Loading images/IMG_8995.jpg', 'Loading images/IMG_9888.jpg',
        'Loading images/IMG_9897.jpg', 'Loading images/IMG_9905.jpg',
        'Loading images/Loading images/1354d826-0e6b-43f4-bad2-c49c270e16a1.jpg',
        'Loading images/Loading images/5DE894B2-3103-4C30-8DFE-08793200DB9A.jpg',
        'Loading images/Loading images/7e64b24a-4c78-4d02-bf91-79aea9547b8e.jpg',
        'Loading images/Loading images/99bb0256-edc8-4e65-8cae-5ed7cc35ea88.jpg'
    ];

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

    if (!loader || !galleryGrid || !dragContainer) {
        console.error('❌ LOADER: Required elements not found!');
        console.error('Missing:', { loader: !!loader, galleryGrid: !!galleryGrid, dragContainer: !!dragContainer });
        return;
    }

    // Calculate dimensions
    const COLS = 6;
    const ROWS = Math.ceil(allImages.length / COLS);
    const itemWidth = 256; // 16rem
    const itemHeight = 384; // 24rem
    const gap = 56; // 3.5rem
    const padding = 56;

    const tileWidth = (itemWidth * COLS) + (gap * (COLS - 1)) + (padding * 2);
    const tileHeight = (itemHeight * ROWS) + (gap * (ROWS - 1)) + (padding * 2);

    console.log(`🔲 TILE: ${tileWidth}px × ${tileHeight}px`);

    // Create 2x2 grid (4 copies) for PERFORMANCE - still infinite!
    const fragment = document.createDocumentFragment();
    for (let tileY = 0; tileY < 2; tileY++) {
        for (let tileX = 0; tileX < 2; tileX++) {
            for (let i = 0; i < allImages.length; i++) {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.style.animationDelay = `${Math.random() * 1.5 + 1.5}s`;

                const img = document.createElement('img');
                img.src = allImages[i];
                img.alt = `Photo ${i + 1}`;
                img.draggable = false;

                item.appendChild(img);
                fragment.appendChild(item);
            }
        }
    }
    galleryGrid.appendChild(fragment);

    console.log(`📸 CREATED: ${4 * allImages.length} items (2×2 tiles for performance)`);

    // State - START AT CENTER POSITION (2x2 grid)
    let isDragging = false;
    let startX = 0, startY = 0;
    // CRITICAL: Start at -tileWidth/2, -tileHeight/2 for 2x2 grid
    let currentX = -tileWidth / 2;
    let currentY = -tileHeight / 2;
    let velocityX = 0, velocityY = 0;
    let lastX = currentX;
    let lastY = currentY;
    let hasScrolled = false;
    let videosLoaded = false;
    let maxLoadTime = 5500;
    let exceedsMaxTime = false;
    const startTime = Date.now();

    // Set initial position to show center tile - use translate3d for GPU acceleration
    galleryGrid.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    console.log(`📍 INITIAL POSITION: (${currentX}, ${currentY})`);

    // Wrap function (keeps position within one tile range)
    function wrap(min, max, value) {
        const range = max - min;
        return ((value - min) % range + range) % range + min;
    }

    function applyWrapping() {
        // Wrap X between -tileWidth and 0 (2 tiles wide)
        currentX = wrap(-tileWidth, 0, currentX);
        // Wrap Y between -tileHeight and 0 (2 tiles high)
        currentY = wrap(-tileHeight, 0, currentY);
    }

    function handleDragStart(e) {
        isDragging = true;
        const touch = e.type === 'touchstart' ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        lastX = currentX;
        lastY = currentY;
        dragContainer.classList.add('dragging');
        velocityX = 0;
        velocityY = 0;
    }

    let rafId = null;
    function handleDragMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();

        const touch = e.type === 'touchmove' ? e.touches[0] : e;
        const clientX = touch.clientX;
        const clientY = touch.clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        currentX = lastX + deltaX;
        currentY = lastY + deltaY;

        velocityX = deltaX * 0.05;
        velocityY = deltaY * 0.05;

        // Use RAF for smooth transform updates
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            applyWrapping();
            galleryGrid.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        });

        if (!hasScrolled && (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20)) {
            hasScrolled = true;
            loadingInfo.classList.add('scrolled');
        }
    }

    let momentumRaf = null;
    function handleDragEnd() {
        isDragging = false;
        dragContainer.classList.remove('dragging');
        lastX = currentX;
        lastY = currentY;

        // Cancel any existing RAF
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        applyMomentum();
    }

    function applyMomentum() {
        if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) {
            momentumRaf = null;
            return;
        }

        currentX += velocityX;
        currentY += velocityY;
        velocityX *= 0.95;
        velocityY *= 0.95;

        applyWrapping();
        lastX = currentX;
        lastY = currentY;
        galleryGrid.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        momentumRaf = requestAnimationFrame(applyMomentum);
    }

    function handleWheel(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!isDragging) {
            currentY -= e.deltaY * 2.7;
            applyWrapping();
            lastY = currentY;
            galleryGrid.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

            if (!hasScrolled && Math.abs(e.deltaY) > 5) {
                hasScrolled = true;
                loadingInfo.classList.add('scrolled');
            }
        }
        return false;
    }

    dragContainer.addEventListener('mousedown', handleDragStart);
    dragContainer.addEventListener('touchstart', handleDragStart, { passive: false });
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('wheel', handleWheel, { passive: false });

    // Connection detection
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let connectionSpeed = 50;

    if (conn && conn.downlink) {
        connectionSpeed = conn.downlink;
    } else if (conn && conn.effectiveType) {
        const types = { 'slow-2g': 0.5, '2g': 1, '3g': 3, '4g': 20 };
        connectionSpeed = types[conn.effectiveType] || 20;
    }

    if (connectionSpeed >= 10) {
        maxLoadTime = 5500;
        connectionBadge.textContent = 'Fast Connection';
        connectionBadge.className = 'connection-badge connection-fast';
    } else if (connectionSpeed >= 3) {
        maxLoadTime = 10000;
        connectionBadge.textContent = 'Slow Connection';
        connectionBadge.className = 'connection-badge connection-medium';
    } else {
        maxLoadTime = 25000;
        connectionBadge.textContent = 'Very Slow Connection';
        connectionBadge.className = 'connection-badge connection-slow';
    }

    console.log(`⏱️ LOAD TIME: ${(maxLoadTime/1000).toFixed(1)}s`);

    function updateProgress(percent) {
        progressBar.style.width = percent + '%';
        progressPercentage.textContent = Math.floor(percent) + '%';

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (maxLoadTime - elapsed) / 1000);

        if (remaining > 0 && !exceedsMaxTime) {
            progressEta.textContent = `ETA: ${Math.ceil(remaining)}s`;
        } else if (exceedsMaxTime) {
            progressEta.textContent = 'Exceeded maximum loading time, continuing with static background';
        } else {
            progressEta.textContent = 'Almost ready...';
        }
    }

    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const timeProgress = Math.min((elapsed / maxLoadTime) * 100, 100);

        updateProgress(timeProgress);

        if (elapsed > maxLoadTime && !exceedsMaxTime) {
            exceedsMaxTime = true;
            updateProgress(100);
        }

        if (timeProgress >= 100) {
            clearInterval(progressInterval);
            completeLoading();
        }
    }, 50);

    let landingReady = false;
    let wormholeReady = false;

    function checkVideos() {
        if (landingReady && wormholeReady) {
            videosLoaded = true;
        }
    }

    if (landingVideo) {
        landingVideo.addEventListener('canplaythrough', () => {
            landingReady = true;
            checkVideos();
        }, { once: true });

        landingVideo.addEventListener('error', (e) => {
            console.warn('⚠️ Landing video load error:', e);
            landingReady = true; // Continue anyway
            checkVideos();
        }, { once: true });

        landingVideo.load();
    } else {
        landingReady = true;
    }

    if (wormholeVideo) {
        wormholeVideo.addEventListener('canplaythrough', () => {
            wormholeReady = true;
            checkVideos();
        }, { once: true });

        wormholeVideo.addEventListener('error', (e) => {
            console.warn('⚠️ Wormhole video load error:', e);
            wormholeReady = true; // Continue anyway
            checkVideos();
        }, { once: true });

        wormholeVideo.load();
    } else {
        wormholeReady = true;
    }

    function completeLoading() {
        console.log(`✅ LOADER: COMPLETE`);

        const titleEl = loadingInfo?.querySelector('.loading-title');
        const subtitleEl = loadingInfo?.querySelector('.loading-subtitle');

        if (titleEl) titleEl.textContent = 'All Set!';
        if (subtitleEl) subtitleEl.textContent = 'Loading Complete';
        if (progressEta) progressEta.textContent = 'Ready!';

        setTimeout(() => {
            loader.style.transition = 'opacity 1s ease-out';
            loader.classList.add('fade-out');

            setTimeout(() => {
                loader.classList.add('hidden');
                loader.style.display = 'none';

                // Clean up event listeners
                window.removeEventListener('wheel', handleWheel);
                window.removeEventListener('mousemove', handleDragMove);
                window.removeEventListener('touchmove', handleDragMove);
                window.removeEventListener('mouseup', handleDragEnd);
                window.removeEventListener('touchend', handleDragEnd);

                // Cancel any pending RAF
                if (rafId) cancelAnimationFrame(rafId);
                if (momentumRaf) cancelAnimationFrame(momentumRaf);

                window.loaderIsComplete = true;
                window.dispatchEvent(new CustomEvent('loaderComplete'));
                console.log(`🔓 KEYBOARD ENABLED`);
            }, 1000);
        }, 1000);
    }
})();
