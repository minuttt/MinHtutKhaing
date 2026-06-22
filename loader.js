// ===== INFINITE DRAG GALLERY LOADING SCREEN =====
(function() {
    console.log('🎨 LOADER: Starting initialization...');

    // CLOUDINARY CDN - All 63 images with auto-optimization!
    // f_auto = auto format (WebP/AVIF), q_auto = smart quality, w_512 = max width 512px
    const CDN_BASE = 'https://res.cloudinary.com/dnmayywbs/image/upload/f_auto,q_auto,w_512/';

    const allAvailableImages = [
        CDN_BASE + 'IMG_0173_nlnlcr.jpg',
        CDN_BASE + 'IMG_0176_uirmtb.jpg',
        CDN_BASE + 'IMG_0192_ius3au.jpg',
        CDN_BASE + 'IMG_0199_atbzkn.jpg',
        CDN_BASE + 'IMG_0201_x0oqkv.jpg',
        CDN_BASE + 'IMG_0206_u74rgb.jpg',
        CDN_BASE + 'IMG_0208_nzbft2.jpg',
        CDN_BASE + 'IMG_0212_zc0ktk.jpg',
        CDN_BASE + 'IMG_0218_udxjqg.jpg',
        CDN_BASE + 'IMG_0219_kwkgh6.jpg',
        CDN_BASE + 'IMG_0220_jjbhkj.jpg',
        CDN_BASE + 'IMG_0221_k6bajb.jpg',
        CDN_BASE + 'IMG_0226_a4s8bk.jpg',
        CDN_BASE + 'IMG_0236_f71eqk.jpg',
        CDN_BASE + 'IMG_0237_qcd10z.jpg',
        CDN_BASE + 'IMG_0249_ty0wqo.jpg',
        CDN_BASE + 'IMG_0250_byed5z.jpg',
        CDN_BASE + 'IMG_0255_z0pgv0.jpg',
        CDN_BASE + 'IMG_0257_dye2fl.jpg',
        CDN_BASE + 'IMG_0267_yabba7.jpg',
        CDN_BASE + 'IMG_0268_wgdjx9.jpg',
        CDN_BASE + 'IMG_0274_vnaygl.jpg',
        CDN_BASE + 'IMG_0275_vhtni9.jpg',
        CDN_BASE + 'IMG_0276_pjdui9.jpg',
        CDN_BASE + 'IMG_0277_wdqakh.jpg',
        CDN_BASE + 'IMG_0301_rarlfb.jpg',
        CDN_BASE + 'IMG_0303_qclu3q.jpg',
        CDN_BASE + 'IMG_0307_witgum.jpg',
        CDN_BASE + 'IMG_0312_lle66s.jpg',
        CDN_BASE + 'IMG_0331_eldzla.jpg',
        CDN_BASE + 'IMG_0333_fxio0r.jpg',
        CDN_BASE + 'IMG_0343_ed1adc.jpg',
        CDN_BASE + 'IMG_0349_jjfrsa.jpg',
        CDN_BASE + 'IMG_0351_rxipgz.jpg',
        CDN_BASE + 'IMG_0353_nzj7do.jpg',
        CDN_BASE + 'IMG_0355_ig14wz.jpg',
        CDN_BASE + 'IMG_0357_l2jgty.jpg',
        CDN_BASE + 'IMG_0359_psf9jx.jpg',
        CDN_BASE + 'IMG_0371_sluabn.jpg',
        CDN_BASE + 'IMG_0395_i4fqmu.jpg',
        CDN_BASE + 'IMG_0546_qcpnf0.jpg',
        CDN_BASE + 'IMG_4130_hwd3vu.jpg',
        CDN_BASE + 'IMG_4144_jpllpj.jpg',
        CDN_BASE + 'IMG_4154_ota2de.jpg',
        CDN_BASE + 'IMG_6082_buxyz0.jpg',
        CDN_BASE + 'IMG_7995_tfotrq.jpg',
        CDN_BASE + 'IMG_8008_kuwaur.jpg',
        CDN_BASE + 'IMG_8044_c4jcze.jpg',
        CDN_BASE + 'IMG_8051_tejxcb.jpg',
        CDN_BASE + 'IMG_8053_mu42hm.jpg',
        CDN_BASE + 'IMG_8062_webmmb.jpg',
        CDN_BASE + 'IMG_8072_ek1ftm.jpg',
        CDN_BASE + 'IMG_8762_n4urgb.jpg',
        CDN_BASE + 'IMG_8819_kzqlll.jpg',
        CDN_BASE + 'IMG_8990_ttcyoj.jpg',
        CDN_BASE + 'IMG_8995_nc54pj.jpg',
        CDN_BASE + 'IMG_9888_p1ynds.jpg',
        CDN_BASE + 'IMG_9897_ryipul.jpg',
        CDN_BASE + 'IMG_9905_yh6lkx.jpg',
        CDN_BASE + '1354d826-0e6b-43f4-bad2-c49c270e16a1_gkp0cg.jpg',
        CDN_BASE + '5DE894B2-3103-4C30-8DFE-08793200DB9A_eyea0a.jpg',
        CDN_BASE + '7e64b24a-4c78-4d02-bf91-79aea9547b8e_zmbk3i.jpg',
        CDN_BASE + '99bb0256-edc8-4e65-8cae-5ed7cc35ea88_upiooo.jpg'
    ];

    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Use ALL 63 images - shuffled for variety!
    const allImages = shuffleArray(allAvailableImages);
    console.log(`🎨 FULL GALLERY: All ${allImages.length} images in random order!`);

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

    // Create 2x2 grid (4 copies) - each tile shuffled differently!
    // STRATEGY: Load images AFTER videos start loading (lazy loading)
    const fragment = document.createDocumentFragment();
    const imagesToLoad = [];

    for (let tileY = 0; tileY < 2; tileY++) {
        for (let tileX = 0; tileX < 2; tileX++) {
            // Each tile shows all images in random order!
            const shuffledForThisTile = shuffleArray(allImages);

            for (let i = 0; i < shuffledForThisTile.length; i++) {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.style.animationDelay = `${Math.random() * 1.5 + 1.5}s`;

                const img = document.createElement('img');
                // Don't set src yet - we'll load in batches!
                img.setAttribute('data-src', shuffledForThisTile[i]);
                img.alt = `Photo ${i + 1}`;
                img.draggable = false;

                item.appendChild(img);
                fragment.appendChild(item);
                imagesToLoad.push(img);
            }
        }
    }
    galleryGrid.appendChild(fragment);

    console.log(`📸 CREATED: ${4 * allImages.length} items (each tile shuffled differently!)`);

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

    // Set minimum loading times with BUFFER for videos (88MB total)
    let connectionType = 'fast';
    if (connectionSpeed >= 10) {
        maxLoadTime = 10000; // 10s for fast (buffer for videos)
        connectionType = 'fast';
        connectionBadge.textContent = 'Fast Connection';
        connectionBadge.className = 'connection-badge connection-fast';
    } else if (connectionSpeed >= 3) {
        maxLoadTime = 25000; // 25s for medium (more buffer)
        connectionType = 'medium';
        connectionBadge.textContent = 'Medium Connection';
        connectionBadge.className = 'connection-badge connection-medium';
    } else {
        maxLoadTime = 45000; // 45s for slow (lots of buffer)
        connectionType = 'slow';
        connectionBadge.textContent = 'Slow Connection';
        connectionBadge.className = 'connection-badge connection-slow';
    }

    // Track actual loading performance
    let actualLoadSpeed = null;
    const videoStartTime = Date.now();

    console.log(`⏱️ LOAD TIME: ${(maxLoadTime/1000).toFixed(1)}s`);

    // Loading status messages for engagement
    const loadingMessages = [
        'Loading gallery images...',
        'Preparing video backgrounds...',
        'Optimizing visuals...',
        'Almost there...',
        'Finalizing experience...'
    ];
    let currentMessageIndex = 0;

    function updateProgress(percent) {
        progressBar.style.width = percent + '%';
        progressPercentage.textContent = Math.floor(percent) + '%';

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (maxLoadTime - elapsed) / 1000);

        // Honest ETA + engaging status messages
        if (remaining > 0 && !exceedsMaxTime) {
            progressEta.textContent = `ETA: ${Math.ceil(remaining)}s • ${loadingMessages[currentMessageIndex]}`;

            // Update message every 20% progress
            const targetIndex = Math.min(Math.floor(percent / 20), loadingMessages.length - 1);
            if (targetIndex > currentMessageIndex) {
                currentMessageIndex = targetIndex;
            }
        } else if (exceedsMaxTime) {
            progressEta.textContent = 'Still loading... (slow connection detected)';
        } else if (!videosLoaded) {
            progressEta.textContent = 'Buffering videos... almost ready!';
        } else {
            progressEta.textContent = 'Ready to launch!';
        }
    }

    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        // Progress bar follows ETA/time (smooth, matches countdown)
        let progress = 0;

        if (elapsed < maxLoadTime) {
            // Progress based on TIME (0-90%), so it matches ETA countdown
            progress = (elapsed / maxLoadTime) * 90;
        } else if (!videosLoaded) {
            // After minimum time, wait for videos (90-95%)
            const waitTime = elapsed - maxLoadTime;
            progress = Math.min(90 + (waitTime / 10000) * 5, 95);
        } else {
            // Videos ready! Final push to 100%
            progress = 100;
        }

        updateProgress(progress);

        if (elapsed > maxLoadTime && !exceedsMaxTime) {
            exceedsMaxTime = true;
            console.warn(`⚠️ Exceeded ${maxLoadTime/1000}s minimum time (${connectionType} connection)`);
        }

        // Complete when:
        // 1. Minimum time passed AND videos loaded AND most images loaded, OR
        // 2. Time + grace period exceeded (give up waiting)
        const gracePeriod = connectionType === 'slow' ? 60000 : 30000; // 60s for slow, 30s for others
        const minTimePassed = elapsed >= maxLoadTime;
        const assetsReady = videosLoaded && (imagesLoaded / imagesToLoad.length) >= 0.8; // 80% images OK
        const forceComplete = elapsed > (maxLoadTime + gracePeriod);

        if ((minTimePassed && assetsReady) || forceComplete) {
            if (forceComplete && !videosLoaded) {
                console.warn(`⚠️ Videos not ready after ${gracePeriod/1000}s grace - continuing without them`);
                connectionBadge.textContent = 'Videos Unavailable';
                connectionBadge.className = 'connection-badge connection-slow';
            }
            clearInterval(progressInterval);
            updateProgress(100);
            completeLoading();
        }
    }, 100);

    let landingReady = false;
    let wormholeReady = false;
    let landingVideoWorking = false;
    let wormholeVideoWorking = false;

    // SMART IMAGE LOADING: Load visible images FIRST, rest after videos
    let imagesLoaded = 0;
    const VISIBLE_COUNT = 30; // First 30 images (enough to fill viewport!) - load immediately
    const BATCH_SIZE = 10; // Rest load in batches of 10
    const BATCH_DELAY = 100; // 100ms between batches (faster!)

    function loadImageBatch(startIndex) {
        const endIndex = Math.min(startIndex + BATCH_SIZE, imagesToLoad.length);

        for (let i = startIndex; i < endIndex; i++) {
            const img = imagesToLoad[i];
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.onload = () => {
                    imagesLoaded++;
                    if (imagesLoaded % 12 === 0 || imagesLoaded === imagesToLoad.length) {
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
            console.log(`✅ All ${imagesToLoad.length} images loaded!`);
        }
    }

    // IMMEDIATELY load ALL 48 images with retry on failure!
    console.log('🎬 Loading all images immediately from Cloudinary CDN...');

    function loadImageWithRetry(img, src, index, attempt = 1) {
        img.src = src;

        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded % 12 === 0 || imagesLoaded === imagesToLoad.length) {
                console.log(`📸 Loaded ${imagesLoaded}/${imagesToLoad.length} images`);
            }
        };

        img.onerror = () => {
            console.warn(`⚠️ Image ${index} failed (attempt ${attempt}): ${src}`);
            if (attempt < 5) {
                // Retry after delay
                setTimeout(() => {
                    console.log(`🔄 Retrying image ${index} (attempt ${attempt + 1})`);
                    loadImageWithRetry(img, src, index, attempt + 1);
                }, attempt * 500); // Progressive delay: 500ms, 1s, 1.5s, 2s
            } else {
                console.error(`❌ Image ${index} failed after 5 attempts: ${src}`);
                imagesLoaded++;
                // Set a fallback placeholder color
                img.style.background = 'rgba(16, 185, 129, 0.1)';
            }
        };
    }

    imagesToLoad.forEach((img, index) => {
        const src = img.getAttribute('data-src');
        if (src) {
            loadImageWithRetry(img, src, index);
        }
    });

    console.log(`✅ All ${imagesToLoad.length} images loading from CDN with retry logic!`);

    function checkVideos() {
        const elapsed = Date.now() - startTime;
        console.log(`🎥 VIDEO CHECK: Landing=${landingReady}, Wormhole=${wormholeReady} (${(elapsed/1000).toFixed(1)}s)`);

        if (landingReady && wormholeReady) {
            videosLoaded = true;
            const loadTime = (elapsed / 1000).toFixed(1);
            console.log(`✅ VIDEOS READY: Both videos loaded in ${loadTime}s!`);

            // All images already loading from CDN!
            console.log(`🎬 Videos loaded! Images: ${imagesLoaded}/${imagesToLoad.length}`);

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
