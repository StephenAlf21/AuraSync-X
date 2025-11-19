// --- GLOBAL STATE & VARIABLES ---
    const APP_VERSION = '1.6.9'; // Version with responsive spectrum layout
    let currentLayer = 'local';

    // --- FIX: Restored defaultTracks array ---
    const defaultTracks = [
      { name: "A Palestinian Protest Anthem", url: "assets/song1.mp3", artist: "zombies21", type: "local" },
      { name: "Common Flame of Deutschland", url: "assets/song2.mp3", artist: "zombies21", type: "local" },
      { name: "Arbeiter Canada v2", url: "assets/song3.mp3", artist: "zombies21", type: "local" }
    ];

    const recommendedStations = [
      { name: "BBC World Service", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", country: "UK" },
      { name: "NPR News", url: "https://npr-ice.streamguys1.com/live.mp3", country: "USA" }
    ];

    // --- FIX: Initialize playlist with the default tracks ---
    let playlist = defaultTracks.map(t => ({
      file: null, url: t.url, name: t.name, artist: t.artist, isDefault: true, type: t.type
    }));

    let scene, camera, renderer, audioElement;
    let particles, waves, sphere, tunnel;
    let currentVisualization = 'particles';
    let currentColorScheme = 'blue';
    let isPlaying = false;
    let animationId, spectrumAnimationId;
    let currentTrackIndex = -1;
    let animationSpeed = 5;
    let sensitivity = 5;
    let timeData;

    let audioContext, analyser, source;
    let bufferLength, dataArray;

    const mainContent = document.getElementById('mainContent');
    const playlistPanel = document.getElementById('playlistPanel');
    const playlistContainer = document.getElementById('playlistContainer');
    const togglePlaylistBtn = document.getElementById('togglePlaylistBtn');
    const closePlaylistBtn = document.getElementById('closePlaylistBtn');
    const playlistToggleIcon = document.getElementById('playlistToggleIcon');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const fileInput = document.getElementById('fileInput');
    let currentTimeEl, durationEl, progressWrapper, progressBar, volumeSlider, speedSlider, sensitivitySlider;
    let specCanvas, specCtx, decibelBar, decibelValue;

    const playIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-white" fill="none" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    const pauseIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-white" fill="none" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

    const colorSchemes = {
      blue: [0x4facfe, 0x00f2fe], purple: [0x9d50bb, 0x6e48aa],
      fire: [0xff9a9e, 0xfad0c4], nature: [0x0ba360, 0x3cba92]
    };
    
    function resizeSpectrumCanvas() {
      if (specCanvas) {
        const dpr = window.devicePixelRatio || 1;
        specCanvas.width  = specCanvas.clientWidth * dpr;
        specCanvas.height = specCanvas.clientHeight * dpr;
        if (specCtx) {
            specCtx.scale(dpr, dpr);
        }
      }
    }

    function initThreeJS() {
      const container = document.getElementById('visualizer');
      if (!container) return;
      while (container.firstChild) { container.removeChild(container.firstChild); }
      const width = container.clientWidth; const height = container.clientHeight;
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 30;
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);
      
      window.addEventListener('resize', () => {
        const newWidth = container.clientWidth; const newHeight = container.clientHeight;
        if (newHeight > 0) { // Avoid division by zero
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
        }
        renderer.setSize(newWidth, newHeight);
        resizeSpectrumCanvas();
      });

      initParticles(); initWaves(); initSphere(); initTunnel();
      scene.add(particles);
    }
    function initParticles() {
      const particleCount = 2000;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const baseColor = new THREE.Color(colorSchemes[currentColorScheme][0]);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        colors[i * 3] = baseColor.r; colors[i * 3 + 1] = baseColor.g; colors[i * 3 + 2] = baseColor.b;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.8 });
      particles = new THREE.Points(geometry, material);
    }
    function initWaves() {
        const geometry = new THREE.PlaneGeometry(100, 100, 64, 64);
        const material = new THREE.MeshBasicMaterial({ color: colorSchemes[currentColorScheme][0], wireframe: true, transparent: true, opacity: 0.7 });
        waves = new THREE.Mesh(geometry, material);
        waves.rotation.x = -Math.PI / 2;
    }
    function initSphere() {
        const geometry = new THREE.SphereGeometry(15, 64, 64);
        const material = new THREE.MeshBasicMaterial({ color: colorSchemes[currentColorScheme][0], wireframe: true, transparent: true, opacity: 0.7 });
        sphere = new THREE.Mesh(geometry, material);
        sphere.geometry.setAttribute('initialPosition', sphere.geometry.attributes.position.clone());
    }
    function initTunnel() {
        const geometry = new THREE.CylinderGeometry(10, 10, 200, 64, 32, true);
        const material = new THREE.MeshBasicMaterial({ color: colorSchemes[currentColorScheme][0], wireframe: true, transparent: true, opacity: 0.7, side: THREE.BackSide });
        tunnel = new THREE.Mesh(geometry, material);
        tunnel.rotation.x = Math.PI / 2;
    }
    
    function unlockAudio() {
        if (audioContext && audioContext.state === 'suspended') { audioContext.resume(); }
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.connect(audioContext.destination);
            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            timeData = new Float32Array(analyser.fftSize);
        }
    }

    function initAudio(track) {
      if (animationId) cancelAnimationFrame(animationId);
      if (spectrumAnimationId) cancelAnimationFrame(spectrumAnimationId);
      
      if (audioElement) { 
        audioElement.pause(); 
        audioElement.src = ''; 
        if (source) { source.disconnect(); }
      }
      audioElement = new Audio();

      // BUG FIX: Apply volume from slider every time a new track is initialized
      if (volumeSlider) {
        audioElement.volume = Number(volumeSlider.value);
      }
      
      if (track.file) {
        audioElement.src = URL.createObjectURL(track.file);
      } else {
        audioElement.crossOrigin = "anonymous"; 
        audioElement.src = track.url;
      }

      audioElement.addEventListener('play', () => { 
        isPlaying = true; 
        playPauseBtn.innerHTML = pauseIconSVG;
        playPauseBtn.setAttribute('aria-label','Pause');
        animate(); 
        drawSpectrum();
      });
      audioElement.addEventListener('pause', () => { 
          isPlaying = false; 
          playPauseBtn.innerHTML = playIconSVG;
          playPauseBtn.setAttribute('aria-label','Play');
      });

      source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);

      audioElement.addEventListener('loadedmetadata', setDuration);
      audioElement.addEventListener('timeupdate', updateProgressBar);
      audioElement.addEventListener('ended', playNextTrack);
    }

    function handleFiles(files) {
        Array.from(files).forEach(file => {
          if (file.type === 'audio/mpeg') {
            playlist.push({ 
              file, 
              name: file.name.replace('.mp3',''), 
              artist: 'Local File', 
              isDefault: false,
              type: 'local'
            });
          }
        });
        if (currentTrackIndex === -1 && playlist.length) {
          playTrack(0);
        }
        renderPlaylist();
        updateButtons();
    }
    
    function removeTrack(index) {
      const removedCurrent = index === currentTrackIndex;
      playlist.splice(index, 1);

      if (removedCurrent) {
        if (audioElement) audioElement.pause();
        if (playlist.length > 0) {
            playTrack(index % playlist.length);
        } else {
            currentTrackIndex = -1;
            document.getElementById('trackTitle').textContent = 'No Track Loaded';
            document.getElementById('trackArtist').textContent = 'Add songs to the playlist to begin';
            isPlaying = false;
            playPauseBtn.innerHTML = playIconSVG;
            playPauseBtn.setAttribute('aria-label','Play');
            updateProgressBar();
        }
      } else if (index < currentTrackIndex) {
          currentTrackIndex--;
      }
      renderPlaylist();
      updateButtons();
    }

    function playTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        unlockAudio(); 
        currentTrackIndex = index;
        const track = playlist[index];
        document.getElementById('trackTitle').textContent = track.name;
        document.getElementById('trackArtist').textContent = track.artist;
        initAudio(track);
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Playback error for track:", track.name, error);
                if (error.name === 'NotSupportedError') {
                    showAlert(`Could not play "${track.name}". The stream might be offline or in an unsupported format.`, 'Playback Error');
                } else if (error.name !== 'AbortError') {
                    showAlert("Playback was blocked. Click the main play button to start.", "Playback Notice");
                }
            });
        }
        renderPlaylist();
        updateButtons();
    }

    function playNextTrack() {
        if (!playlist.length) return;
        playTrack((currentTrackIndex + 1) % playlist.length);
    }
    function playPrevTrack() {
        if (!playlist.length) return;
        playTrack((currentTrackIndex - 1 + playlist.length) % playlist.length);
    }
    
    function togglePlayPause() {
      if (!audioElement) return;
      unlockAudio(); 
      if (audioElement.paused) { audioElement.play(); } else { audioElement.pause(); }
    }

    function renderPlaylist() {
        playlistContainer.innerHTML = '';
        const visible = playlist.filter(t => t.type === currentLayer);
        if (!visible.length) {
            playlistContainer.innerHTML = `<p class="text-gray-400 text-center">No songs in this list.</p>`;
            return;
        }
        visible.forEach((track) => {
            const realIndex = playlist.indexOf(track);
            const isActive = realIndex === currentTrackIndex;
            const item = document.createElement('div');
            item.className = `p-3 rounded-lg cursor-pointer flex items-center transition-colors ${isActive ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`;
            item.innerHTML = `
              <svg class="w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-indigo-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
              <div class="flex-1 min-w-0">
                <div class="font-bold truncate">${track.name}</div>
                <div class="text-sm text-gray-400 truncate">${track.artist}</div>
              </div>
              <button class="remove-btn ml-2 p-1 rounded-full hover:bg-red-500 hover:text-white transition-colors" aria-label="Remove track"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>`;
            item.addEventListener('click', e => {
              if (e.target.closest('.remove-btn')) return;
              playTrack(realIndex);
            });
            item.querySelector('.remove-btn').addEventListener('click', e => {
              e.stopPropagation();
              removeTrack(realIndex);
            });
            playlistContainer.appendChild(item);
        });
    }

    function renderRecommendedStations() {
      const container = document.querySelector("#recommendedStations ul");
      container.innerHTML = "";
      recommendedStations.forEach(station => {
        const li = document.createElement("li");
        li.className = "flex items-center justify-between bg-gray-700 p-2 rounded hover:bg-indigo-600 cursor-pointer transition-colors";
        li.innerHTML = `<span><span class="font-semibold">${station.name}</span><span class="text-xs text-gray-400 ml-2">${station.country}</span></span><button class="add-radio-btn px-2 py-1 rounded bg-indigo-500 hover:bg-indigo-400 text-xs font-semibold">Add</button>`;
        li.querySelector(".add-radio-btn").addEventListener("click", (e) => {
          playlist.push({ file: null, url: station.url, name: station.name, artist: station.country, isDefault: false, type: "radio" });
          renderPlaylist();
          updateButtons();
          document.querySelector('.playlist-tab[data-layer="radio"]').click();
        });
        container.appendChild(li);
      });
    }

    function updateButtons() {
        const hasTracks = !!playlist.length;
        playPauseBtn.disabled = !hasTracks;
        nextBtn.disabled = !hasTracks;
        prevBtn.disabled = !hasTracks;
    }

    function formatTime(sec) {
      if (!isFinite(sec)) return 'Live';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }
    
    function setDuration() { if (audioElement) { durationEl.textContent = formatTime(audioElement.duration); } }
    
    function seek(e) {
      if (!audioElement || !audioElement.duration || !isFinite(audioElement.duration)) return;
      const rect = progressWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      audioElement.currentTime = (clickX / rect.width) * audioElement.duration;
      updateProgressBar();
    }

    function updateProgressBar() {
        if (!audioElement || !isFinite(audioElement.duration)) {
            progressBar.style.width = '0%';
            currentTimeEl.textContent = '0:00';
            durationEl.textContent = '0:00';
            if (audioElement && !isFinite(audioElement.duration)) {
              progressBar.style.width = '100%';
              currentTimeEl.textContent = 'Live';
            }
            return;
        }
        const pct = (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.style.width = pct + '%';
        currentTimeEl.textContent = formatTime(audioElement.currentTime);
    }
    
    function animate() {
      if (!isPlaying) return;
      animationId = requestAnimationFrame(animate);
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      updateDecibelMeter();
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      const avgFrequency = sum / bufferLength;
      const speed = animationSpeed / 500;
      switch (currentVisualization) {
          case 'particles': updateParticles(avgFrequency, speed); break;
          case 'waves': updateWaves(speed); break;
          case 'sphere': updateSphere(speed); break;
          case 'tunnel': updateTunnel(speed); break;
      }
      camera.position.x = Math.sin(Date.now() * 0.0001) * 5;
      camera.position.y = Math.cos(Date.now() * 0.0001) * 5;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }

    function drawSpectrum() {
      if (!isPlaying || !specCtx) return;
      spectrumAnimationId = requestAnimationFrame(drawSpectrum);
      const unscaledWidth = specCanvas.clientWidth;
      const unscaledHeight = specCanvas.clientHeight;
      specCtx.clearRect(0, 0, unscaledWidth, unscaledHeight);
      specCtx.fillStyle = '#000';
      specCtx.fillRect(0, 0, unscaledWidth, unscaledHeight);
      const barWidth = unscaledWidth / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255;
        const barHeight = v * unscaledHeight;
        const hue = (i / bufferLength) * 360;
        specCtx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        specCtx.fillRect(x, unscaledHeight - barHeight, barWidth, barHeight);
        x += barWidth;
      }
    }
    
    function updateDecibelMeter() {
      analyser.getFloatTimeDomainData(timeData);
      let sumSquares = 0.0;
      for (const amplitude of timeData) { sumSquares += amplitude * amplitude; }
      const rms = Math.sqrt(sumSquares / timeData.length);
      const db = rms > 0 ? 20 * Math.log10(rms) : -100;
      decibelValue.textContent = `${Math.max(db, -100).toFixed(1)} dB`;
      decibelBar.style.width = `${Math.min(rms * 100, 100)}%`;
    }

    function updateParticles(avgFrequency, speed) {
        particles.rotation.y += speed;
        const scale = 1 + (avgFrequency / 128) * (sensitivity / 10);
        particles.scale.set(scale, scale, scale);
    }
    function updateWaves(speed) {
        const positions = waves.geometry.attributes.position.array;
        const currentSensitivity = sensitivity / 5;
        const time = Date.now() * 0.005;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i]; const z = positions[i + 2];
            const dataIndex = Math.floor(Math.abs(x + z) % bufferLength);
            positions[i + 1] = Math.sin((x + z) * 0.1 + time) * (dataArray[dataIndex] / 255) * 10 * currentSensitivity;
        }
        waves.geometry.attributes.position.needsUpdate = true;
        waves.rotation.y += speed / 2;
    }
    function updateSphere(speed) {
        const positions = sphere.geometry.attributes.position.array;
        const initialPositions = sphere.geometry.attributes.initialPosition.array;
        const currentSensitivity = sensitivity / 5;
        for (let i = 0; i < positions.length; i += 3) {
            const dataIndex = Math.floor((i / 3) % bufferLength);
            const scale = 1 + (dataArray[dataIndex] / 255) * 0.5 * currentSensitivity;
            positions[i] = initialPositions[i] * scale;
            positions[i + 1] = initialPositions[i + 1] * scale;
            positions[i + 2] = initialPositions[i + 2] * scale;
        }
        sphere.geometry.attributes.position.needsUpdate = true;
        sphere.rotation.x += speed;
        sphere.rotation.y += speed;
    }
    function updateTunnel(speed) {
        tunnel.position.z = (tunnel.position.z - speed * 50) % 100;
        const positions = tunnel.geometry.attributes.position.array;
        const currentSensitivity = sensitivity / 5;
        for (let i = 0; i < positions.length; i += 3) {
            const angle = Math.atan2(positions[i], positions[i+1]);
            const dataIndex = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * bufferLength) % bufferLength;
            const radius = 10 + (dataArray[dataIndex] / 255) * 10 * currentSensitivity;
            positions[i] = Math.cos(angle) * radius;
            positions[i+1] = Math.sin(angle) * radius;
        }
        tunnel.geometry.attributes.position.needsUpdate = true;
    }
    function switchVisualization(type) {
      scene.remove(particles, waves, sphere, tunnel);
      currentVisualization = type;
      switch (type) {
        case 'particles': scene.add(particles); break; case 'waves': scene.add(waves); break;
        case 'sphere': scene.add(sphere); break; case 'tunnel': scene.add(tunnel); break;
      }
      switchColorScheme(currentColorScheme);
      document.querySelectorAll('.viz-type').forEach(btn => {
        const pressed = btn.dataset.viz === type;
        btn.setAttribute('aria-pressed', pressed);
        btn.classList.toggle('bg-indigo-600', pressed); btn.classList.toggle('bg-gray-700', !pressed);
      });
    }
    function switchColorScheme(scheme) {
      currentColorScheme = scheme;
      const newColor = new THREE.Color(colorSchemes[scheme][0]);
      waves.material.color.set(newColor); sphere.material.color.set(newColor); tunnel.material.color.set(newColor);
      const particleColors = particles.geometry.attributes.color.array;
      for (let i = 0; i < particleColors.length; i += 3) {
        particleColors[i] = newColor.r; particleColors[i + 1] = newColor.g; particleColors[i + 2] = newColor.b;
      }
      particles.geometry.attributes.color.needsUpdate = true;
      document.querySelectorAll('.color-scheme').forEach(btn => {
        const pressed = btn.dataset.scheme === scheme;
        btn.setAttribute('aria-pressed', pressed);
        btn.classList.toggle('ring-2', pressed); btn.classList.toggle('ring-white', pressed);
      });
    }
    function adjustVolume(delta) {
        if (!audioElement) return;
        const newVolume = Math.min(1, Math.max(0, audioElement.volume + delta));
        audioElement.volume = newVolume;
        if (volumeSlider) { volumeSlider.value = newVolume; }
    }

    function openModal(modalId) {
      const modal = document.getElementById(modalId);
      const card  = modal.querySelector('.modal-card');
      modal.classList.remove('hidden');
      modal.style.opacity = 0;
      card.style.opacity  = 0;
      card.style.transform = 'translateY(50px)';
      anime.timeline().add({ targets: modal, opacity: [0,1], duration: 200, easing: 'linear' }).add({ targets: card, translateY: [50,0], opacity: [0,1], duration: 300, easing: 'easeOutQuad' }, '-=150');
    }

    function closeModal(modalId) {
      const modal = document.getElementById(modalId);
      const card  = modal.querySelector('.modal-card');
      anime.timeline().add({ targets: card, translateY: [0,50], opacity: [1,0], duration: 200, easing: 'easeInQuad' }).add({ targets: modal, opacity: [1,0], duration: 150, easing: 'linear' }, '-=150').finished.then(() => { modal.classList.add('hidden'); });
    }
    
    function showAlert(message, title = 'Notice') {
      document.getElementById('alertTitle').textContent = title;
      document.getElementById('alertMessage').textContent = message;
      openModal('alertModal');
    }

    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('appVersion').textContent = `v${APP_VERSION}`;
      
      specCanvas = document.getElementById('spectrumCanvas');
      specCtx = specCanvas.getContext('2d');
      decibelBar = document.getElementById('decibelBar');
      decibelValue = document.getElementById('decibelValue');

      initThreeJS();
      resizeSpectrumCanvas();
      renderPlaylist();
      renderRecommendedStations(); 
      updateButtons();

      currentTimeEl = document.getElementById('currentTime');
      durationEl = document.getElementById('durationTime');
      progressWrapper = document.getElementById('progressWrapper');
      progressBar = document.getElementById('progressBar');
      volumeSlider = document.getElementById('volumeSlider');
      // BUG FIX: Get slider elements
      speedSlider = document.getElementById('speed');
      sensitivitySlider = document.getElementById('sensitivity');
      
      progressWrapper.addEventListener('click', seek);
      volumeSlider.addEventListener('input', e => { if (audioElement) { audioElement.volume = e.target.value; } });
      
      // BUG FIX: Wire up visualization control sliders
      speedSlider.addEventListener('input', e => {
        animationSpeed = Number(e.target.value);
      });
      sensitivitySlider.addEventListener('input', e => {
        sensitivity = Number(e.target.value);
      });

      document.querySelectorAll('.viz-type').forEach(btn => btn.addEventListener('click', () => switchVisualization(btn.dataset.viz)));
      document.querySelectorAll('.color-scheme').forEach(btn => btn.addEventListener('click', () => switchColorScheme(btn.dataset.scheme)));
      playPauseBtn.addEventListener('click', togglePlayPause);
      nextBtn.addEventListener('click', playNextTrack);
      prevBtn.addEventListener('click', playPrevTrack);
      fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

      const urlInput  = document.getElementById('urlInput');
      const addUrlBtn = document.getElementById('addUrlBtn');
      addUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) return;
        if (!/^https?:\/\/.+\.(mp3|ogg|wav)(\?.*)?$/i.test(url)) {
          showAlert('Please enter a direct link to an audio file (mp3/ogg/wav).', 'Invalid URL');
          return;
        }
        const filename = url.split('/').pop().split('?')[0];
        playlist.push({ file: null, url, name: decodeURIComponent(filename), artist:'Remote URL', isDefault: false, type: 'remote' });
        renderPlaylist();
        updateButtons();
        urlInput.value = '';
      });

      async function fetchStation(name) {
        const endpoint = 'https://de1.api.radio-browser.info/json/stations/search';
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, country: 'Canada', state: 'Nova Scotia', limit: 15, hidebroken: true })
          });
          if (!response.ok) throw new Error(`API responded with ${response.status}`);
          let stations = await response.json();
          if (!stations || stations.length === 0) return null;
          return stations.find(s => s.url_resolved && s.url_resolved.startsWith('https://')) || stations.find(s => s.url_resolved) || null;
        } catch (err) {
          console.error('Radio-Browser API error:', err);
          showAlert('Could not connect to the radio station directory. Please try again later.', 'Network Error');
          return null;
        }
      }

      const radioSearchBtn = document.getElementById('radioSearchBtn');
      radioSearchBtn.addEventListener('click', async () => {
        const input = document.getElementById('radioSearchInput');
        const query = input.value.trim();
        if (!query) return;
        radioSearchBtn.disabled = true;
        radioSearchBtn.textContent = 'Searching...';
        const station = await fetchStation(query);
        radioSearchBtn.disabled = false;
        radioSearchBtn.textContent = 'Search';
        if (!station) {
          showAlert(`No playable stream found for “${query}” in Nova Scotia.`, 'Station Not Found');
          return;
        }
        playlist.push({ file: null, url: station.url_resolved, name: station.name || query, artist: station.state || station.country || 'Internet Radio', isDefault: false, type: 'radio' });
        renderPlaylist();
        updateButtons();
        input.value = '';
        document.querySelector('.playlist-tab[data-layer="radio"]').click();
      });

      function setSidebarVisibility(visible) {
        togglePlaylistBtn.setAttribute('aria-expanded', visible);
        const tooltip = togglePlaylistBtn._tippy;
        if (visible) {
            playlistPanel.classList.remove('translate-x-full');
            // This logic for adjusting main content is trickier with the new flex layout
            // We'll rely on the flexbox to handle resizing for now.
            playlistToggleIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />`;
            togglePlaylistBtn.setAttribute('aria-label', 'Close Playlist');
            if (tooltip) tooltip.setContent('Close Playlist');
        } else {
            playlistPanel.classList.add('translate-x-full');
            playlistToggleIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>`;
            togglePlaylistBtn.setAttribute('aria-label', 'Open Playlist');
            if (tooltip) tooltip.setContent('Open Playlist');
        }
      }

      togglePlaylistBtn.addEventListener('click', () => {
          const isCurrentlyHidden = playlistPanel.classList.contains('translate-x-full');
          setSidebarVisibility(isCurrentlyHidden);
      });

      closePlaylistBtn.addEventListener('click', () => {
          setSidebarVisibility(false);
          togglePlaylistBtn.focus();
      });

      document.querySelectorAll('.playlist-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          currentLayer = btn.dataset.layer; 
          document.querySelectorAll('.playlist-tab').forEach(b => {
            const isThis = b === btn;
            b.classList.toggle('bg-indigo-600', isThis);
            b.classList.toggle('font-semibold', isThis);
            b.classList.toggle('bg-gray-700', !isThis);
            b.classList.toggle('hover:bg-indigo-500', !isThis);
          });
          renderPlaylist();
        });
      });

      document.getElementById('accessibilityBtn').addEventListener('click', () => openModal('accessibilityModal'));
      document.getElementById('closeAccessibility').addEventListener('click', () => closeModal('accessibilityModal'));
      document.getElementById('helpBtn').addEventListener('click', () => openModal('helpModal'));
      document.getElementById('closeHelp').addEventListener('click', () => closeModal('helpModal'));
      document.getElementById('closeAlert').addEventListener('click', () => closeModal('alertModal'));
      
      // Back-to-menu logic
      const backBtn      = document.getElementById('backBtn');
      const backModal    = document.getElementById('backModal');
      const backConfirm  = document.getElementById('backConfirm');
      const backCancel   = document.getElementById('backCancel');
      const backCancel2  = document.getElementById('backCancel2');

      backBtn.addEventListener('click', () => {
        openModal('backModal');
      });

      backCancel.addEventListener('click', () => closeModal('backModal'));
      backCancel2.addEventListener('click', () => closeModal('backModal'));

      backConfirm.addEventListener('click', () => {
        window.top.location.href = 'index.html';
      });

      document.getElementById('highContrast').addEventListener('change', e => document.body.classList.toggle('high-contrast', e.target.checked));

      document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.isContentEditable) return;
        switch (e.key) {
          case ' ': e.preventDefault(); togglePlayPause(); break;
          case 'ArrowRight': e.preventDefault(); playNextTrack(); break;
          case 'ArrowLeft': e.preventDefault(); playPrevTrack(); break;
          case '+': case '=': e.preventDefault(); adjustVolume(0.1); break;
          case '-': e.preventDefault(); adjustVolume(-0.1); break;
        }
      });

      switchVisualization('particles');
      switchColorScheme('blue');
      
      anime({ 
        targets: '.container > *',
        translateY: [20, 0], 
        opacity: [0, 1], 
        delay: anime.stagger(100), 
        easing: 'easeOutQuad' 
      });
      
      tippy('[data-tippy-content]', {
        theme: 'material',
        animation: 'shift-away-subtle',
        delay: [150, 0],
      });
    });