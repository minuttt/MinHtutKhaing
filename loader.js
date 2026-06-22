// ===== INFINITE DRAG GALLERY LOADING SCREEN =====
(function() {
    console.log('🎨 Initializing infinite drag gallery loader...');

    // All 59 personal photos from Loading images folder (converted to JPG)
    const personalPhotos = [
        'Loading%20images/IMG_0173.jpg', 'Loading%20images/IMG_0176.jpg', 'Loading%20images/IMG_0192.jpg',
        'Loading%20images/IMG_0199.jpg', 'Loading%20images/IMG_0201.jpg', 'Loading%20images/IMG_0206.jpg',
        'Loading%20images/IMG_0208.jpg', 'Loading%20images/IMG_0212.jpg', 'Loading%20images/IMG_0218.jpg',
        'Loading%20images/IMG_0219.jpg', 'Loading%20images/IMG_0220.jpg', 'Loading%20images/IMG_0221.jpg',
        'Loading%20images/IMG_0226.jpg', 'Loading%20images/IMG_0236.jpg', 'Loading%20images/IMG_0237.jpg',
        'Loading%20images/IMG_0249.jpg', 'Loading%20images/IMG_0250.jpg', 'Loading%20images/IMG_0255.jpg',
        'Loading%20images/IMG_0257.jpg', 'Loading%20images/IMG_0267.jpg', 'Loading%20images/IMG_0268.jpg',
        'Loading%20images/IMG_0274.jpg', 'Loading%20images/IMG_0275.jpg', 'Loading%20images/IMG_0276.jpg',
        'Loading%20images/IMG_0277.jpg', 'Loading%20images/IMG_0283.jpg', 'Loading%20images/IMG_0301.jpg',
        'Loading%20images/IMG_0303.jpg', 'Loading%20images/IMG_0307.jpg', 'Loading%20images/IMG_0312.jpg',
        'Loading%20images/IMG_0331.jpg', 'Loading%20images/IMG_0333.jpg', 'Loading%20images/IMG_0343.jpg',
        'Loading%20images/IMG_0349.jpg', 'Loading%20images/IMG_0351.jpg', 'Loading%20images/IMG_0353.jpg',
        'Loading%20images/IMG_0355.jpg', 'Loading%20images/IMG_0357.jpg', 'Loading%20images/IMG_0359.jpg',
        'Loading%20images/IMG_0371.jpg', 'Loading%20images/IMG_0395.jpg', 'Loading%20images/IMG_0546.jpg',
        'Loading%20images/IMG_4130.jpg', 'Loading%20images/IMG_4144.jpg', 'Loading%20images/IMG_4154.jpg',
        'Loading%20images/IMG_7995.jpg', 'Loading%20images/IMG_8008.jpg', 'Loading%20images/IMG_8044.jpg',
        'Loading%20images/IMG_8051.jpg', 'Loading%20images/IMG_8053.jpg', 'Loading%20images/IMG_8062.jpg',
        'Loading%20images/IMG_8072.jpg', 'Loading%20images/IMG_8762.jpg', 'Loading%20images/IMG_8819.jpg',
        'Loading%20images/IMG_8990.jpg', 'Loading%20images/IMG_8995.jpg', 'Loading%20images/IMG_9888.jpg',
        'Loading%20images/IMG_9897.jpg', 'Loading%20images/IMG_9905.jpg'
    ];

    // Use all photos directly - no duplication needed!
    const photos = personalPhotos;

    console.log(`📸 Loaded ${photos.length} unique personal photos for gallery`);

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

    // Check if all elements exist
    if (!loader || !galleryGrid || !dragContainer || !loadingInfo) {
        console.error('❌ Required loader elements not found!');
        console.log('loader:', !!loader, 'galleryGrid:', !!galleryGrid, 'dragContainer:', !!dragContainer, 'loadingInfo:', !!loadingInfo);
        return;
    }

    console.log('✅ All loader elements found');

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
        e.stopPropagation();

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

    // Wheel scroll - prevent from propagating to landing page
    function handleWheel(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (!isDragging) {
            currentY -= e.deltaY * 2.7;
            galleryGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;

            if (!hasScrolled && Math.abs(e.deltaY) > 5) {
                hasScrolled = true;
                loadingInfo.classList.add('scrolled');
            }
        }

        return false;
    }

    // Block keyboard events during loading to prevent landing page skip
    function blockKeyboard(e) {
        if (loader && !loader.classList.contains('hidden')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }

    // Store references for cleanup
    const keydownBlocker = blockKeyboard;
    const keypressBlocker = blockKeyboard;
    const keyupBlocker = blockKeyboard;

    // Event listeners
    dragContainer.addEventListener('mousedown', handleDragStart);
    dragContainer.addEventListener('touchstart', handleDragStart, { passive: false });
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', keydownBlocker, { passive: false, capture: true });
    window.addEventListener('keypress', keypressBlocker, { passive: false, capture: true });
    window.addEventListener('keyup', keyupBlocker, { passive: false, capture: true });

    // Connection detection with smart minimum load times
    function detectConnection() {
        try {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

            // Set default to high speed if API unavailable
            if (!conn) {
                connectionSpeed = 50; // Assume fast if unknown
                console.log('📡 Connection API unavailable, assuming fast connection');
            } else if (conn.downlink && conn.downlink > 0) {
                connectionSpeed = conn.downlink;
                console.log(`📡 Detected speed: ${connectionSpeed.toFixed(1)} Mbps (downlink)`);
            } else if (conn.effectiveType) {
                const types = { 'slow-2g': 0.5, '2g': 1, '3g': 3, '4g': 20 };
                connectionSpeed = types[conn.effectiveType] || 20;
                console.log(`📡 Detected speed: ${connectionSpeed.toFixed(1)} Mbps (${conn.effectiveType})`);
            } else {
                connectionSpeed = 50; // Assume fast
                console.log('📡 No speed info, assuming fast connection');
            }

            const estimatedSeconds = (88 * 8) / connectionSpeed;

            // Smart minimum times based on connection:
            // Fast (20+ Mbps): 4.5s minimum
            // Medium (5-20 Mbps): 5.5s minimum
            // Slow (<5 Mbps): 7s minimum, up to 30s max
            let minLoadTime;
            if (connectionSpeed >= 20) {
                minLoadTime = 4500; // 4.5 seconds for fast connections
                connectionBadge.textContent = 'Lightning Fast';
                connectionBadge.className = 'connection-badge connection-fast';
            } else if (connectionSpeed >= 5) {
                minLoadTime = 5500; // 5.5 seconds for medium
                connectionBadge.textContent = 'Smooth Connection';
                connectionBadge.className = 'connection-badge connection-medium';
            } else {
                minLoadTime = 7000; // 7 seconds for slow
                connectionBadge.textContent = 'Loading...';
                connectionBadge.className = 'connection-badge connection-slow';
            }

            maxLoadTime = Math.min(Math.max(estimatedSeconds * 1000 * 1.2, minLoadTime), 30000);
            console.log(`⏱️ Final load time: ${(maxLoadTime/1000).toFixed(1)}s (min: ${(minLoadTime/1000).toFixed(1)}s, estimated: ${estimatedSeconds.toFixed(1)}s)`);
        } catch (err) {
            console.error('❌ Connection detection error:', err);
            connectionSpeed = 50;
            connectionBadge.textContent = 'Loading...';
            connectionBadge.className = 'connection-badge connection-medium';
            maxLoadTime = 4500; // Default 4.5 seconds for fast
            console.log(`⏱️ Fallback load time: ${(maxLoadTime/1000).toFixed(1)}s`);
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

    // Complete loading with smooth fade
    function completeLoading() {
        loadingInfo.querySelector('.loading-title').textContent = 'All Set!';
        loadingInfo.querySelector('.loading-subtitle').innerHTML = '<span class="loading-complete">✓ Loading Complete</span><br>Welcome to my portfolio...';
        progressEta.textContent = 'Ready!';

        // Smooth fade out after 1 second
        setTimeout(() => {
            loader.style.transition = 'opacity 1s ease-out';
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.classList.add('hidden');

                // CRITICAL: Clean up ALL event listeners including keyboard blockers
                window.removeEventListener('wheel', handleWheel);
                window.removeEventListener('mousemove', handleDragMove);
                window.removeEventListener('touchmove', handleDragMove);
                window.removeEventListener('mouseup', handleDragEnd);
                window.removeEventListener('touchend', handleDragEnd);
                window.removeEventListener('keydown', keydownBlocker, { capture: true });
                window.removeEventListener('keypress', keypressBlocker, { capture: true });
                window.removeEventListener('keyup', keyupBlocker, { capture: true });

                console.log('🧹 All loader event listeners cleaned up - keyboard unblocked!');
            }, 1000);
        }, 1000);
    }
})();
