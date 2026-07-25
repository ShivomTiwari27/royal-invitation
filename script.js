// Script Document: Royal Indian Invitation Logic & Animations

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const bgMusic = document.getElementById("bg-music");
    const splashScreen = document.getElementById("splash-screen");
    const openBtn = document.getElementById("open-btn");
    const cinematicContainer = document.getElementById("cinematic-container");
    const musicToggle = document.getElementById("music-toggle");
    const playPauseToggle = document.getElementById("play-pause-toggle");
    const timelineProgress = document.getElementById("timeline-progress");
    const sceneDots = document.querySelectorAll(".dot");
    const scenes = document.querySelectorAll(".scene");
    const canvas = document.getElementById("petal-canvas");
    const ctx = canvas.getContext("2d");

    // Timeline Configuration
    const SCENE_DURATION = 10000; // 10 seconds per scene
    let currentSceneIndex = 0;
    let isPlaying = false;
    let isMuted = false;
    let timelineStartTime = 0;
    let elapsedBeforePause = 0;
    let animationFrameId = null;
    let sceneTimer = null;
    let progressTimer = null;

    // YouTube IFrame API Integration
    let ytPlayer = null;
    let useYT = false;
    const YT_VIDEO_ID = "vgJ7Ad5nKIE";

    // Load YouTube API script
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Global callback for YouTube API
    window.onYouTubeIframeAPIReady = function() {
        ytPlayer = new YT.Player('yt-player', {
            height: '0',
            width: '0',
            videoId: YT_VIDEO_ID,
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'loop': 1,
                'playlist': YT_VIDEO_ID, // Required for loop in YT player
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onReady': () => {
                    useYT = true;
                    console.log("YouTube Player is ready. Celebrating with the requested track!");
                },
                'onError': (err) => {
                    console.warn("YouTube Player error, falling back to local shehnai:", err);
                    useYT = false;
                }
            }
        });
    };

    // Canvas Petals and Sparkles Configuration
    let petals = [];
    let sparkles = [];
    const MAX_PETALS = 45;
    const MAX_SPARKLES = 60;
    let isCanvasActive = false;

    // Initialize Canvas Dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Petal Class (Rose and Marigold petals)
    class Petal {
        constructor() {
            this.reset(true);
        }

        reset(init = false) {
            this.x = Math.random() * canvas.width;
            this.y = init ? Math.random() * -canvas.height : -20;
            this.size = Math.random() * 12 + 8;
            this.speedY = Math.random() * 1.5 + 1; // fall speed
            this.speedX = Math.random() * 1 - 0.5; // drift speed
            this.spin = Math.random() * 360;
            this.spinSpeed = Math.random() * 2 - 1;
            this.type = Math.random() > 0.55 ? "marigold" : "rose"; // 45% rose, 55% marigold
            this.opacity = Math.random() * 0.4 + 0.6;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y / 30) * 0.5; // swaying effect
            this.spin += this.spinSpeed;

            // boundary check
            if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
                this.reset(false);
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.spin * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;

            if (this.type === "rose") {
                // Draw Rose Petal (Deep Pink/Red Ellipse)
                ctx.fillStyle = "rgba(180, 20, 40, 0.95)";
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(-this.size, -this.size / 2, -this.size / 2, -this.size);
                ctx.quadraticCurveTo(0, -this.size * 1.5, this.size / 2, -this.size);
                ctx.quadraticCurveTo(this.size, -this.size / 2, 0, 0);
                ctx.closePath();
                ctx.fill();
                
                // Add soft petal crease lines
                ctx.strokeStyle = "rgba(120, 5, 20, 0.4)";
                ctx.lineWidth = 1;
                ctx.stroke();
            } else {
                // Draw Marigold Flower Petal (Bright Orange/Yellow segment)
                const grad = ctx.createLinearGradient(0, -this.size, 0, 0);
                grad.addColorStop(0, "#FFD700"); // gold
                grad.addColorStop(1, "#FF8C00"); // orange-red
                ctx.fillStyle = grad;
                
                ctx.beginPath();
                ctx.ellipse(0, -this.size / 2, this.size / 2, this.size, 0, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Sparkle Class (Floating divine particles)
    class Sparkle {
        constructor() {
            this.reset(true);
        }

        reset(init = false) {
            this.x = Math.random() * canvas.width;
            this.y = init ? Math.random() * canvas.height : canvas.height + 10;
            this.radius = Math.random() * 2 + 0.5;
            this.speedY = -(Math.random() * 0.8 + 0.3); // floats up
            this.speedX = Math.random() * 0.4 - 0.2;
            this.opacity = Math.random() * 0.5 + 0.4;
            this.pulseSpeed = Math.random() * 0.05 + 0.02;
            this.pulseDirection = Math.random() > 0.5 ? 1 : -1;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y / 40) * 0.2;
            
            // Pulse opacity
            this.opacity += this.pulseDirection * this.pulseSpeed;
            if (this.opacity >= 1) {
                this.opacity = 1;
                this.pulseDirection = -1;
            } else if (this.opacity <= 0.2) {
                this.opacity = 0.2;
                this.pulseDirection = 1;
            }

            // boundary check
            if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                this.reset(false);
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            
            // Glow effect
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#FFDF73";
            ctx.fillStyle = "rgba(255, 223, 115, 0.9)";
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }

    // Initialize Particles
    function initParticles() {
        petals = [];
        sparkles = [];
        for (let i = 0; i < MAX_PETALS; i++) {
            petals.push(new Petal());
        }
        for (let i = 0; i < MAX_SPARKLES; i++) {
            sparkles.push(new Sparkle());
        }
    }

    // Animation Loop
    function animateParticles() {
        if (!isCanvasActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update & Draw Sparkles
        for (let i = 0; i < sparkles.length; i++) {
            sparkles[i].update();
            sparkles[i].draw();
        }

        // Update & Draw Petals
        for (let i = 0; i < petals.length; i++) {
            petals[i].update();
            petals[i].draw();
        }

        animationFrameId = requestAnimationFrame(animateParticles);
    }

    // Start Cinematic Presentation
    function startCinematic() {
        splashScreen.classList.remove("active");
        splashScreen.classList.add("fade-out");

        // Attempt playing audio
        if (useYT && ytPlayer) {
            try {
                if (isMuted) {
                    ytPlayer.mute();
                } else {
                    ytPlayer.unMute();
                }
                ytPlayer.playVideo();
                isPlaying = true;
            } catch (err) {
                console.warn("Error starting YouTube video, falling back:", err);
                fallbackPlayAudio();
            }
        } else {
            fallbackPlayAudio();
        }

        // Trigger temple doors opening after 800ms
        setTimeout(() => {
            cinematicContainer.classList.add("doors-open");
            // Start Canvas loops
            isCanvasActive = true;
            initParticles();
            animateParticles();
            
            // Start the invitation timeline sequence
            startTimeline();
        }, 800);
    }

    function fallbackPlayAudio() {
        bgMusic.play().then(() => {
            isPlaying = true;
        }).catch(err => {
            console.log("Autoplay blocked or audio failed. Waiting for interaction.", err);
            isPlaying = false;
        });
    }

    // Timeline Loop Manager
    function startTimeline() {
        isPlaying = true;
        playPauseToggle.classList.remove("paused");
        playPauseToggle.classList.add("playing");
        
        timelineStartTime = Date.now() - elapsedBeforePause;
        
        // Progress updater interval (100ms)
        progressTimer = setInterval(updateProgressBar, 100);

        // Scene changer scheduler
        const remainingTime = SCENE_DURATION - elapsedBeforePause;
        sceneTimer = setTimeout(moveToNextScene, remainingTime);
    }

    function pauseTimeline() {
        isPlaying = false;
        playPauseToggle.classList.remove("playing");
        playPauseToggle.classList.add("paused");

        elapsedBeforePause = Date.now() - timelineStartTime;
        
        clearInterval(progressTimer);
        clearTimeout(sceneTimer);
    }

    function updateProgressBar() {
        const elapsed = Date.now() - timelineStartTime;
        const percent = Math.min((elapsed / SCENE_DURATION) * 100, 100);
        timelineProgress.style.width = `${percent}%`;
    }

    function moveToNextScene() {
        clearInterval(progressTimer);
        clearTimeout(sceneTimer);
        elapsedBeforePause = 0;

        // Transition to next slide
        let nextIndex = currentSceneIndex + 1;
        
        if (nextIndex >= scenes.length) {
            // Stay on the final slide or slowly restart
            // To make it loops like a continuous showcase, go back to 0
            nextIndex = 0;
        }

        switchScene(nextIndex);

        if (isPlaying) {
            timelineStartTime = Date.now();
            progressTimer = setInterval(updateProgressBar, 100);
            sceneTimer = setTimeout(moveToNextScene, SCENE_DURATION);
        }
    }

    function switchScene(index) {
        // Remove active from old scene
        scenes[currentSceneIndex].classList.remove("active");
        sceneDots[currentSceneIndex].classList.remove("active");

        // Set active on new scene
        currentSceneIndex = index;
        scenes[currentSceneIndex].classList.add("active");
        sceneDots[currentSceneIndex].classList.add("active");
    }

    // Manual slide navigation via Dots
    sceneDots.forEach(dot => {
        dot.addEventListener("click", () => {
            const targetScene = parseInt(dot.getAttribute("data-scene"), 10);
            if (targetScene === currentSceneIndex) return;

            // Pause timeline first to avoid jumpy schedules
            const wasPlaying = isPlaying;
            pauseTimeline();
            
            elapsedBeforePause = 0;
            switchScene(targetScene);
            timelineProgress.style.width = "0%";

            if (wasPlaying) {
                startTimeline();
            }
        });
    });

    // Touch Swipe Gestures for Mobile
    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 50; // minimum pixels to be considered a swipe
    const scenesWrapper = document.getElementById("scenes-wrapper");

    scenesWrapper.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    scenesWrapper.addEventListener("touchend", (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    }, { passive: true });

    function handleSwipe(startX, startY, endX, endY) {
        const diffX = endX - startX;
        const diffY = endY - startY;

        // Ensure horizontal swipe is dominant and exceeds threshold
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
            const wasPlaying = isPlaying;
            pauseTimeline(); // pause timeline on manual swipe

            let targetIndex = currentSceneIndex;
            if (diffX < 0) {
                // Swipe Left -> Next Scene
                targetIndex = (currentSceneIndex + 1) % scenes.length;
            } else {
                // Swipe Right -> Previous Scene
                targetIndex = (currentSceneIndex - 1 + scenes.length) % scenes.length;
            }
            
            elapsedBeforePause = 0;
            switchScene(targetIndex);
            timelineProgress.style.width = "0%";

            if (wasPlaying) {
                startTimeline();
            }
        }
    }

    // EVENT LISTENERS

    // Open/Play button
    openBtn.addEventListener("click", startCinematic);

    // Play/Pause button
    playPauseToggle.addEventListener("click", () => {
        if (isPlaying) {
            pauseTimeline();
            if (useYT && ytPlayer) {
                ytPlayer.pauseVideo();
            } else {
                bgMusic.pause();
            }
        } else {
            startTimeline();
            if (useYT && ytPlayer) {
                ytPlayer.playVideo();
            } else {
                bgMusic.play().catch(e => console.log("Audio play blocked", e));
            }
        }
    });

    // Music Mute/Unmute button
    musicToggle.addEventListener("click", () => {
        if (isMuted) {
            if (useYT && ytPlayer) {
                ytPlayer.unMute();
            } else {
                bgMusic.muted = false;
            }
            musicToggle.classList.remove("audio-muted");
            musicToggle.classList.add("audio-playing");
            isMuted = false;
        } else {
            if (useYT && ytPlayer) {
                ytPlayer.mute();
            } else {
                bgMusic.muted = true;
            }
            musicToggle.classList.remove("audio-playing");
            musicToggle.classList.add("audio-muted");
            isMuted = true;
        }
    });
});
