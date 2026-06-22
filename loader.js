// ===== INFINITE DRAG GALLERY LOADING SCREEN =====
(function() {
    console.log('🎨 LOADER: Starting initialization...');

    // Selected 12 images - fewer images = videos load faster!
    const allImages = [
        'Loading images/IMG_0173.jpg',
        'Loading images/IMG_0218.jpg',
        'Loading images/IMG_0257.jpg',
        'Loading images/IMG_0303.jpg',
        'Loading images/IMG_0353.jpg',
        'Loading images/IMG_4144.jpg',
        'Loading images/IMG_8008.jpg',
        'Loading images/IMG_8762.jpg',
        'Loading images/IMG_8995.jpg',
        'Loading images/IMG_9905.jpg',
        'Loading images/IMG_0199.jpg',
        'Loading images/IMG_0371.jpg'
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

    if (!loader || !galleryGrid) {
        console.error('❌ LOADER: Required elements not found!');
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
    // STRATEGY: Load images AFTER videos start loading (lazy loading)
    const fragment = document.createDocumentFragment();
    const imagesToLoad = [];

    for (let tileY = 0; tileY < 2; tileY++) {
        for (let tileX = 0; tileX < 2; tileX++) {
            for (let i = 0; i < allImages.length; i++) {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.style.animationDelay = `${Math.random() * 1.5 + 1.5}s`;

                const img = document.createElement('img');
                // Don't set src yet - we'll load in batches!
                img.setAttribute('data-src', allImages[i]);
                img.alt = `Photo ${i + 1}`;
                img.draggable = false;

                item.appendChild(img);
                fragment.appendChild(item);
                imagesToLoad.push(img);
            }
        }
    }
    galleryGrid.appendChild(fragment);

    console.log(`📸 CREATED: ${4 * allImages.length} items (will lazy-load in batches)`);

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

    function handleDragEnd() {
        isDragging = false;
        dragContainer.classList.remove('dragging');
        lastX = currentX;
        lastY = currentY;
        applyMomentum();
    }

    function applyMomentum() {
        if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) return;

        currentX += velocityX;
        currentY += velocityY;
        velocityX *= 0.95;
        velocityY *= 0.95;

        applyWrapping();
        lastX = currentX;
        lastY = currentY;
        galleryGrid.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        requestAnimationFrame(applyMomentum);
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

    // Initial connection detection (estimate only)
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let connectionSpeed = 50;

    if (conn && conn.downlink) {
        connectionSpeed = conn.downlink;
    } else if (conn && conn.effectiveType) {
        const types = { 'slow-2g': 0.5, '2g': 1, '3g': 3, '4g': 20 };
        connectionSpeed = types[conn.effectiveType] || 20;
    }

    // Start with "Detecting..." until we know actual speed
    connectionBadge.textContent = 'Detecting Connection...';
    connectionBadge.className = 'connection-badge connection-medium';

    // Set minimum loading times based on initial estimate
    // REDUCED times - fewer images = faster load!
    if (connectionSpeed >= 10) {
        maxLoadTime = 5000; // 5s minimum for fast estimate
    } else if (connectionSpeed >= 3) {
        maxLoadTime = 10000; // 10s for medium estimate
    } else {
        maxLoadTime = 20000; // 20s for slow estimate
    }

    // Track actual loading performance
    let actualLoadSpeed = null;
    const videoStartTime = Date.now();

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
        } else if (!videosLoaded) {
            // Time complete but videos still loading
            progressEta.textContent = 'Loading visuals...';
        } else {
            progressEta.textContent = 'Almost ready...';
        }
    }

    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        // Show honest time-based progress, don't wait forever for videos
        let progress;

        if (elapsed < maxLoadTime) {
            // Normal loading: 0-90%
            progress = (elapsed / maxLoadTime) * 90;
        } else if (!videosLoaded && elapsed < (maxLoadTime + 5000)) {
            // Grace period (5s): 90-95%
            const graceElapsed = elapsed - maxLoadTime;
            progress = 90 + (graceElapsed / 5000) * 5;
        } else if (!videosLoaded) {
            // Give up waiting: 95-100% quickly
            const giveUpElapsed = elapsed - (maxLoadTime + 5000);
            progress = Math.min(95 + (giveUpElapsed / 2000) * 5, 100);
        } else {
            // Videos loaded!
            progress = 100;
        }

        updateProgress(progress);

        if (elapsed > maxLoadTime && !exceedsMaxTime) {
            exceedsMaxTime = true;
        }

        // Complete when:
        // 1. Minimum time passed AND videos loaded, OR
        // 2. Time + grace period exceeded (give up waiting)
        const gracePeriod = 15000; // 15 seconds grace (reduced - fewer images competing)
        const minTimePassed = elapsed >= maxLoadTime;
        const forceComplete = elapsed > (maxLoadTime + gracePeriod);

        if ((minTimePassed && videosLoaded) || forceComplete) {
            if (forceComplete && !videosLoaded) {
                console.warn('⚠️ Videos not ready after 30s grace - continuing without them');
                connectionBadge.textContent = 'Videos Unavailable';
                connectionBadge.className = 'connection-badge connection-slow';
            }
            clearInterval(progressInterval);
            updateProgress(100);
            completeLoading();
        }
    }, 50);

    let landingReady = false;
    let wormholeReady = false;
    let landingVideoWorking = false;
    let wormholeVideoWorking = false;

    // BATCH LOAD IMAGES: Load in small batches to avoid blocking videos
    let imagesLoaded = 0;
    const BATCH_SIZE = 6; // Load 6 images at a time
    const BATCH_DELAY = 200; // Wait 200ms between batches

    function loadImageBatch(startIndex) {
        const endIndex = Math.min(startIndex + BATCH_SIZE, imagesToLoad.length);

        for (let i = startIndex; i < endIndex; i++) {
            const img = imagesToLoad[i];
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.onload = () => {
                    imagesLoaded++;
                    if (imagesLoaded % 12 === 0) {
                        console.log(`📸 Loaded ${imagesLoaded}/${imagesToLoad.length} images`);
                    }
                };
                img.onerror = () => {
                    console.warn(`⚠️ Failed to load: ${src}`);
                    imagesLoaded++;
                };
            }
        }

        // Schedule next batch
        if (endIndex < imagesToLoad.length) {
            setTimeout(() => loadImageBatch(endIndex), BATCH_DELAY);
        } else {
            console.log(`✅ All ${imagesToLoad.length} images queued!`);
        }
    }

    // Start loading images AFTER a short delay (let videos start first)
    setTimeout(() => {
        console.log('🎬 Starting batch image loading...');
        loadImageBatch(0);
    }, 500); // 500ms delay = videos get head start

    function checkVideos() {
        const elapsed = Date.now() - startTime;
        console.log(`🎥 VIDEO CHECK: Landing=${landingReady}, Wormhole=${wormholeReady} (${(elapsed/1000).toFixed(1)}s)`);

        if (landingReady && wormholeReady) {
            videosLoaded = true;
            const loadTime = (elapsed / 1000).toFixed(1);
            console.log(`✅ VIDEOS READY: Both videos loaded in ${loadTime}s!`);

            // Only calculate speed if videos actually loaded (not error fallback)
            if (landingVideoWorking && wormholeVideoWorking) {
                // Calculate ACTUAL connection speed based on video load time
                const videoSizeMB = 88;
                const loadTimeSeconds = elapsed / 1000;
                const actualSpeedMbps = (videoSizeMB * 8) / loadTimeSeconds;

                // Update badge with REAL performance
                if (actualSpeedMbps >= 10) {
                    connectionBadge.textContent = 'Fast Connection';
                    connectionBadge.className = 'connection-badge connection-fast';
                } else if (actualSpeedMbps >= 3) {
                    connectionBadge.textContent = 'Moderate Connection';
                    connectionBadge.className = 'connection-badge connection-medium';
                } else {
                    connectionBadge.textContent = 'Slow Connection';
                    connectionBadge.className = 'connection-badge connection-slow';
                }

                console.log(`📊 ACTUAL SPEED: ${actualSpeedMbps.toFixed(1)} Mbps (${videoSizeMB}MB in ${loadTimeSeconds.toFixed(1)}s)`);

                if (progressEta) {
                    progressEta.textContent = 'Visuals loaded!';
                }
            } else {
                console.warn('⚠️ Videos failed to load - continuing without them');
                connectionBadge.textContent = 'Videos Unavailable';
                connectionBadge.className = 'connection-badge connection-slow';
            }
        }
    }

    // Detect if running on file:// protocol (local testing)
    const isLocalFile = window.location.protocol === 'file:';

    if (landingVideo) {
        // iOS-specific: ensure video is properly configured
        landingVideo.muted = true;
        landingVideo.playsInline = true;
        landingVideo.setAttribute('playsinline', '');
        landingVideo.setAttribute('webkit-playsinline', '');

        // On file:// protocol, don't wait for videos (they may not load properly)
        if (isLocalFile) {
            console.log('⚠️ Local file:// detected - skipping video preload wait');
            setTimeout(() => {
                if (!landingReady) {
                    landingReady = true;
                    landingVideoWorking = true;
                    checkVideos();
                }
            }, 500);
        }

        landingVideo.addEventListener('canplaythrough', () => {
            console.log('✅ Landing video ready (canplaythrough)');
            landingReady = true;
            landingVideoWorking = true;
            checkVideos();
        }, { once: true });

        landingVideo.addEventListener('loadeddata', () => {
            if (!landingReady) {
                console.log('✅ Landing video ready (loadeddata fallback)');
                landingReady = true;
                landingVideoWorking = true;
                checkVideos();
            }
        }, { once: true });

        landingVideo.addEventListener('error', (e) => {
            console.warn('⚠️ Landing video load error:', e);
            landingReady = true; // Continue anyway but mark as failed
            landingVideoWorking = false;
            checkVideos();
        }, { once: true });

        landingVideo.load();
    } else {
        landingReady = true;
    }

    if (wormholeVideo) {
        // iOS-specific: ensure video is properly configured
        wormholeVideo.muted = true;
        wormholeVideo.playsInline = true;
        wormholeVideo.setAttribute('playsinline', '');
        wormholeVideo.setAttribute('webkit-playsinline', '');

        // On file:// protocol, don't wait for videos (they may not load properly)
        if (isLocalFile) {
            setTimeout(() => {
                if (!wormholeReady) {
                    wormholeReady = true;
                    wormholeVideoWorking = true;
                    checkVideos();
                }
            }, 500);
        }

        wormholeVideo.addEventListener('canplaythrough', () => {
            console.log('✅ Wormhole video ready (canplaythrough)');
            wormholeReady = true;
            wormholeVideoWorking = true;
            checkVideos();
        }, { once: true });

        wormholeVideo.addEventListener('loadeddata', () => {
            if (!wormholeReady) {
                console.log('✅ Wormhole video ready (loadeddata fallback)');
                wormholeReady = true;
                wormholeVideoWorking = true;
                checkVideos();
            }
        }, { once: true });

        wormholeVideo.addEventListener('error', (e) => {
            console.warn('⚠️ Wormhole video load error:', e);
            wormholeReady = true; // Continue anyway but mark as failed
            wormholeVideoWorking = false;
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

        // Wait 1 second to show "All Set!" message
        setTimeout(() => {
            const elapsed = Date.now() - startTime;
            console.log(`🎬 Starting fade-out NOW (total time: ${(elapsed/1000).toFixed(1)}s)`);
            loader.style.transition = 'opacity 1s ease-out';
            loader.classList.add('fade-out');

            // After fade-out completes, hide and cleanup
            setTimeout(() => {
                const fadeCompleteTime = Date.now() - startTime;
                console.log(`👻 Loader hidden - cleaning up (total time: ${(fadeCompleteTime/1000).toFixed(1)}s)`);
                loader.classList.add('hidden');
                loader.style.display = 'none';

                window.removeEventListener('wheel', handleWheel);
                window.removeEventListener('mousemove', handleDragMove);
                window.removeEventListener('touchmove', handleDragMove);
                window.removeEventListener('mouseup', handleDragEnd);
                window.removeEventListener('touchend', handleDragEnd);

                // DISPATCH EVENT NOW - so landing animations can start
                window.loaderIsComplete = true;
                const eventTime = Date.now() - startTime;
                console.log(`🔓 DISPATCHING loaderComplete event NOW (at ${(eventTime/1000).toFixed(1)}s)`);
                window.dispatchEvent(new CustomEvent('loaderComplete'));
                console.log(`✅ Event dispatched! Landing page should animate now.`);
            }, 1000);
        }, 1000);
    }
})();
