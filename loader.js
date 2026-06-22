// ===== INFINITE DRAG GALLERY LOADING SCREEN =====
(function() {
    console.log('🎨 Initializing infinite drag gallery loader...');

    // Get ALL images from both folders
    const allImages = [
        // Main Loading images folder
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
        // Nested Loading images/Loading images folder
        'Loading images/Loading images/1354d826-0e6b-43f4-bad2-c49c270e16a1.jpg',
        'Loading images/Loading images/5DE894B2-3103-4C30-8DFE-08793200DB9A.jpg',
        'Loading images/Loading images/7e64b24a-4c78-4d02-bf91-79aea9547b8e.jpg',
        'Loading images/Loading images/99bb0256-edc8-4e65-8cae-5ed7cc35ea88.jpg'
    ];

    console.log(`📸 Loaded ${allImages.length} personal photos for infinite gallery`);

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

    // Create truly infinite grid - 6 columns x 4 rows per section, repeat 4 times
    const imagesPerRow = 6;
    const rowsPerSection = 4;
    const sections = 4; // Repeat 4 times for seamless infinite effect

    for (let section = 0; section < sections; section++) {
        for (let i = 0; i < allImages.length; i++) {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.style.animationDelay = `${Math.random() * 1.5 + 1.5}s`;

            const img = document.createElement('img');
            img.src = allImages[i];
            img.alt = `Personal photo ${i + 1}`;
            img.draggable = false;

            item.appendChild(img);
            galleryGrid.appendChild(item);
        }
    }

    console.log(`📸 Created ${sections * allImages.length} gallery items for infinite scroll`);

    // Drag functionality with momentum
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

        // Move info overlay when user scrolls
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
        e.preventDefault();
        e.stopPropagation();

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

    // Event listeners for dragging
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

            if (!conn) {
                connectionSpeed = 50;
                console.log('📡 Connection API unavailable, assuming fast connection');
            } else if (conn.downlink && conn.downlink > 0) {
                connectionSpeed = conn.downlink;
                console.log(`📡 Detected speed: ${connectionSpeed.toFixed(1)} Mbps (downlink)`);
            } else if (conn.effectiveType) {
                const types = { 'slow-2g': 0.5, '2g': 1, '3g': 3, '4g': 20 };
                connectionSpeed = types[conn.effectiveType] || 20;
                console.log(`📡 Detected speed: ${connectionSpeed.toFixed(1)} Mbps (${conn.effectiveType})`);
            } else {
                connectionSpeed = 50;
                console.log('📡 No speed info, assuming fast connection');
            }

            const estimatedSeconds = (88 * 8) / connectionSpeed;

            let minLoadTime;
            if (connectionSpeed >= 20) {
                minLoadTime = 4500;
                connectionBadge.textContent = 'Lightning Fast';
                connectionBadge.className = 'connection-badge connection-fast';
            } else if (connectionSpeed >= 5) {
                minLoadTime = 5500;
                connectionBadge.textContent = 'Smooth Connection';
                connectionBadge.className = 'connection-badge connection-medium';
            } else {
                minLoadTime = 7000;
                connectionBadge.textContent = 'Loading...';
                connectionBadge.className = 'connection-badge connection-slow';
            }

            maxLoadTime = Math.min(Math.max(estimatedSeconds * 1000 * 1.2, minLoadTime), 30000);
            console.log(`⏱️ Final load time: ${(maxLoadTime/1000).toFixed(1)}s (min: ${(minLoadTime/1000).toFixed(1)}s)`);
        } catch (err) {
            console.error('❌ Connection detection error:', err);
            connectionSpeed = 50;
            connectionBadge.textContent = 'Loading...';
            maxLoadTime = 4500;
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

    // Enforce minimum time
    setTimeout(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        canComplete = true;
        if (!videosLoaded) {
            videosLoaded = true;
        }
        console.log(`⏰ Minimum time ${elapsed}s reached - completion allowed`);
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
        const loadCompleteTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Loading complete at ${loadCompleteTime}s`);

        loadingInfo.querySelector('.loading-title').textContent = 'All Set!';
        loadingInfo.querySelector('.loading-subtitle').innerHTML = '<span class="loading-complete">✓ Loading Complete</span><br>Welcome to my portfolio...';
        progressEta.textContent = 'Ready!';

        // Fade out after 1 second
        setTimeout(() => {
            console.log('🎭 Starting loader fade-out...');
            loader.style.transition = 'opacity 1s ease-out';
            loader.classList.add('fade-out');

            setTimeout(() => {
                console.log('👻 Loader now hidden');
                loader.classList.add('hidden');
                loader.style.display = 'none';

                // Clean up event listeners
                window.removeEventListener('wheel', handleWheel);
                window.removeEventListener('mousemove', handleDragMove);
                window.removeEventListener('touchmove', handleDragMove);
                window.removeEventListener('mouseup', handleDragEnd);
                window.removeEventListener('touchend', handleDragEnd);

                const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`✅ Loader cleanup complete at ${totalTime}s`);
                console.log('🔓 Landing page is now active!');

                // Signal completion
                window.loaderComplete = true;
                window.dispatchEvent(new CustomEvent('loaderComplete'));
            }, 1000);
        }, 1000);
    }
})();
