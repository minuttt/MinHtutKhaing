// ===== INFINITE DRAG GALLERY LOADING SCREEN =====
(function() {
    console.log('🎨 LOADER: Starting initialization...');

    // Get ALL images from both folders
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

    console.log(`📸 LOADER: Loaded ${allImages.length} images`);

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

    if (!loader || !galleryGrid || !dragContainer || !loadingInfo) {
        console.error('❌ LOADER: Required elements not found!');
        return;
    }

    // State
    let isDragging = false;
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;
    let velocityX = 0, velocityY = 0;
    let lastX = 0, lastY = 0;
    let hasScrolled = false;
    let videosLoaded = false;
    let maxLoadTime = 4500;
    const startTime = Date.now();

    // Create 3x3 tile grid (9 tiles) - each tile has 6 columns
    // Total: 18 columns (3 tiles wide × 6 cols each)
    const tilesWide = 3;
    const tilesHigh = 3;

    for (let ty = 0; ty < tilesHigh; ty++) {
        for (let tx = 0; tx < tilesWide; tx++) {
            for (let i = 0; i < allImages.length; i++) {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.style.animationDelay = `${Math.random() * 1.5 + 1.5}s`;

                const img = document.createElement('img');
                img.src = allImages[i];
                img.alt = `Photo ${i + 1}`;
                img.draggable = false;

                item.appendChild(img);
                galleryGrid.appendChild(item);
            }
        }
    }

    console.log(`📸 LOADER: Created ${tilesWide * tilesHigh * allImages.length} items in grid`);

    // Calculate wrapping boundaries
    const itemWidth = 256; // 16rem
    const itemHeight = 384; // 24rem
    const gap = 56; // 3.5rem
    const colsPerTile = 6;
    const rowsPerTile = 11; // 63 images / 6 cols ≈ 11 rows per tile

    const tileWidth = (itemWidth + gap) * colsPerTile;
    const tileHeight = (itemHeight + gap) * rowsPerTile;

    console.log(`🔲 LOADER: Tile dimensions - Width: ${tileWidth}px, Height: ${tileHeight}px`);

    // Infinite wrapping
    function wrapPosition() {
        const halfTileW = tileWidth / 2;
        const halfTileH = tileHeight / 2;

        if (currentX > halfTileW) {
            currentX -= tileWidth;
            lastX = currentX;
        } else if (currentX < -halfTileW) {
            currentX += tileWidth;
            lastX = currentX;
        }

        if (currentY > halfTileH) {
            currentY -= tileHeight;
            lastY = currentY;
        } else if (currentY < -halfTileH) {
            currentY += tileHeight;
            lastY = currentY;
        }
    }

    // Drag handlers
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
        e.stopPropagation();

        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        currentX = lastX + deltaX;
        currentY = lastY + deltaY;

        velocityX = deltaX * 0.05;
        velocityY = deltaY * 0.05;

        wrapPosition();
        galleryGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;

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

        wrapPosition();
        galleryGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;
        requestAnimationFrame(applyMomentum);
    }

    function handleWheel(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!isDragging) {
            currentY -= e.deltaY * 2.7;
            wrapPosition();
            galleryGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;

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

    // Connection detection - SIMPLE & CORRECT
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let connectionSpeed = 50;

    if (conn && conn.downlink) {
        connectionSpeed = conn.downlink;
    } else if (conn && conn.effectiveType) {
        const types = { 'slow-2g': 0.5, '2g': 1, '3g': 3, '4g': 20 };
        connectionSpeed = types[conn.effectiveType] || 20;
    }

    if (connectionSpeed >= 10) {
        maxLoadTime = 4500;
        connectionBadge.textContent = 'Lightning Fast';
        connectionBadge.className = 'connection-badge connection-fast';
    } else if (connectionSpeed >= 3) {
        maxLoadTime = 7000;
        connectionBadge.textContent = 'Smooth Connection';
        connectionBadge.className = 'connection-badge connection-medium';
    } else {
        maxLoadTime = 15000;
        connectionBadge.textContent = 'Slow Connection';
        connectionBadge.className = 'connection-badge connection-slow';
    }

    console.log(`⏱️ LOADER: Load time set to ${(maxLoadTime/1000).toFixed(1)}s`);

    // Progress
    function updateProgress(percent) {
        progressBar.style.width = percent + '%';
        progressPercentage.textContent = Math.floor(percent) + '%';

        const remaining = ((maxLoadTime * (100 - percent)) / 100) / 1000;
        if (remaining > 0) {
            progressEta.textContent = `ETA: ${Math.ceil(remaining)}s`;
        } else {
            progressEta.textContent = 'Almost ready...';
        }
    }

    let animProgress = 0;
    let canComplete = false;

    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const timeProgress = (elapsed / maxLoadTime) * 100;

        if (videosLoaded && canComplete) {
            animProgress += (100 - animProgress) * 0.15;
        } else {
            animProgress += (Math.min(timeProgress, 95) - animProgress) * 0.1;
        }

        updateProgress(animProgress);

        if (animProgress >= 99.5 && canComplete) {
            clearInterval(progressInterval);
            completeLoading();
        }
    }, 50);

    setTimeout(() => {
        canComplete = true;
        videosLoaded = true;
        console.log(`⏰ LOADER: Minimum time reached`);
    }, maxLoadTime);

    // Videos
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
        landingVideo.load();
    }

    if (wormholeVideo) {
        wormholeVideo.addEventListener('canplaythrough', () => {
            wormholeReady = true;
            checkVideos();
        }, { once: true });
        wormholeVideo.load();
    }

    function completeLoading() {
        console.log(`✅ LOADER: COMPLETING NOW`);

        loadingInfo.querySelector('.loading-title').textContent = 'All Set!';
        loadingInfo.querySelector('.loading-subtitle').innerHTML = '<span class="loading-complete">✓ Loading Complete</span><br>Welcome to my portfolio...';
        progressEta.textContent = 'Ready!';

        setTimeout(() => {
            loader.style.transition = 'opacity 1s ease-out';
            loader.classList.add('fade-out');

            setTimeout(() => {
                loader.classList.add('hidden');
                loader.style.display = 'none';

                window.removeEventListener('wheel', handleWheel);
                window.removeEventListener('mousemove', handleDragMove);
                window.removeEventListener('touchmove', handleDragMove);
                window.removeEventListener('mouseup', handleDragEnd);
                window.removeEventListener('touchend', handleDragEnd);

                // CRITICAL: Set flag BEFORE dispatching event
                window.loaderIsComplete = true;
                console.log(`🔓 LOADER: SET window.loaderIsComplete = true`);

                window.dispatchEvent(new CustomEvent('loaderComplete'));
                console.log(`📢 LOADER: Dispatched loaderComplete event`);

                // Force enable keyboard after 500ms
                setTimeout(() => {
                    console.log(`🔓 LOADER: Final check - window.loaderIsComplete = ${window.loaderIsComplete}`);
                }, 500);
            }, 1000);
        }, 1000);
    }
})();
