// --- GLOBAL STATE & VARIABLES ---
    let playlist = [];
    let isPlaying = false;
    let currentTrackIndex = -1;

    // --- DOM ELEMENTS ---
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
    const videoPlayer = document.getElementById('videoPlayer');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('durationTime');
    const progressWrapper = document.getElementById('progressWrapper');
    const progressBar = document.getElementById('progressBar');
    const volumeSlider = document.getElementById('volumeSlider');
    const trackTitleEl = document.getElementById('trackTitle');
    const trackArtistEl = document.getElementById('trackArtist');

    // --- ICONS ---
    const playIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    const pauseIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

    // --- PLAYLIST & PLAYBACK LOGIC ---
    function handleFiles(files) {
        Array.from(files).forEach(file => {
          if (file.type === 'video/mp4') {
            playlist.push({
              file: file,
              url: URL.createObjectURL(file),
              name: file.name.replace('.mp4',''),
              artist: 'Local File',
            });
          }
        });
        if (currentTrackIndex === -1 && playlist.length > 0) {
          playTrack(0);
        }
        renderPlaylist();
        updateButtons();
    }

    function removeTrack(index) {
      const removedCurrent = index === currentTrackIndex;
      playlist.splice(index, 1);

      if (removedCurrent) {
        videoPlayer.pause();
        if (playlist.length > 0) {
            playTrack(index % playlist.length);
        } else {
            currentTrackIndex = -1;
            videoPlayer.src = '';
            trackTitleEl.textContent = 'No Video Loaded';
            trackArtistEl.textContent = 'Add videos to the playlist to begin';
            isPlaying = false;
            playPauseBtn.innerHTML = playIconSVG;
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

        currentTrackIndex = index;
        const track = playlist[index];
        trackTitleEl.textContent = track.name;
        trackArtistEl.textContent = track.artist;

        videoPlayer.src = track.url;
        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Playback error:", error);
                showAlert("Could not play the selected video.", "Playback Error");
            });
        }

        renderPlaylist();
        updateButtons();
    }

    function playNextTrack() {
        if (playlist.length === 0) return;
        playTrack((currentTrackIndex + 1) % playlist.length);
    }

    function playPrevTrack() {
        if (playlist.length === 0) return;
        playTrack((currentTrackIndex - 1 + playlist.length) % playlist.length);
    }

    function togglePlayPause() {
      if (!videoPlayer.src) return;
      if (videoPlayer.paused) {
        videoPlayer.play();
      } else {
        videoPlayer.pause();
      }
    }

    // --- UI & VISUALIZATION LOGIC ---
    function renderPlaylist() {
        playlistContainer.innerHTML = '';
        if (playlist.length === 0) {
            playlistContainer.innerHTML = `<p class="text-gray-400 text-center">No videos in the playlist.</p>`;
            return;
        }

        playlist.forEach((track, index) => {
            const isActive = index === currentTrackIndex;
            const item = document.createElement('div');
            item.className = `p-3 rounded-lg cursor-pointer flex items-center transition-colors ${isActive ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`;
            item.innerHTML = `
              <svg class="w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-indigo-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <div class="flex-1 min-w-0">
                <div class="font-bold truncate">${track.name}</div>
                <div class="text-sm text-gray-400 truncate">${track.artist}</div>
              </div>
              <button class="remove-btn ml-2 p-1 rounded-full hover:bg-red-500 hover:text-white transition-colors" aria-label="Remove track">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>`;
            item.addEventListener('click', e => {
              if (e.target.closest('.remove-btn')) return;
              playTrack(index);
            });
            item.querySelector('.remove-btn').addEventListener('click', e => {
              e.stopPropagation();
              removeTrack(index);
            });
            playlistContainer.appendChild(item);
        });
    }

    function updateButtons() {
        const hasTracks = playlist.length > 0;
        playPauseBtn.disabled = !hasTracks;
        nextBtn.disabled = !hasTracks;
        prevBtn.disabled = !hasTracks;
    }

    // --- HELPER FUNCTIONS FOR PLAYER CONTROLS ---
    function formatTime(sec) {
      if (isNaN(sec)) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    function seek(e) {
      if (!videoPlayer.duration) return;
      const rect = progressWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * videoPlayer.duration;
      videoPlayer.currentTime = newTime;
    }

    function updateProgressBar() {
        if (!videoPlayer.duration) {
            progressBar.style.width = '0%';
            currentTimeEl.textContent = '0:00';
            durationEl.textContent = '0:00';
            return;
        }
        const pct = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressBar.style.width = pct + '%';
        currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
    }

    // --- MODAL ANIMATION HELPERS ---
    function openModal(modalId) {
      const modal = document.getElementById(modalId);
      modal.classList.remove('hidden');
      anime({ targets: modal, opacity: [0, 1], duration: 300, easing: 'easeOutQuad' });
    }

    function closeModal(modalId) {
      const modal = document.getElementById(modalId);
      anime({
        targets: modal,
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInQuad',
        complete: () => modal.classList.add('hidden')
      });
    }

    function showAlert(message, title = 'Notice') {
      document.getElementById('alertTitle').textContent = title;
      document.getElementById('alertMessage').textContent = message;
      openModal('alertModal');
    }

    // --- EVENT LISTENERS ---
    document.addEventListener('DOMContentLoaded', () => {
      renderPlaylist();
      updateButtons();

      // Player controls
      playPauseBtn.addEventListener('click', togglePlayPause);
      nextBtn.addEventListener('click', playNextTrack);
      prevBtn.addEventListener('click', playPrevTrack);
      progressWrapper.addEventListener('click', seek);
      volumeSlider.addEventListener('input', e => videoPlayer.volume = e.target.value);
      fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

      // Video element events
      videoPlayer.addEventListener('play', () => {
        isPlaying = true;
        playPauseBtn.innerHTML = pauseIconSVG;
      });
      videoPlayer.addEventListener('pause', () => {
        isPlaying = false;
        playPauseBtn.innerHTML = playIconSVG;
      });
      videoPlayer.addEventListener('loadedmetadata', () => durationEl.textContent = formatTime(videoPlayer.duration));
      videoPlayer.addEventListener('timeupdate', updateProgressBar);
      videoPlayer.addEventListener('ended', playNextTrack);

      // URL input
      const urlInput = document.getElementById('urlInput');
      const addUrlBtn = document.getElementById('addUrlBtn');
      addUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) return;

        if (!/^https?:\/\/.+\.(mp4|webm|ogv)(\?.*)?$/i.test(url)) {
          showAlert('Please enter a direct link to a video file (mp4, webm, ogv).', 'Invalid URL');
          return;
        }

        const filename = url.split('/').pop().split('?')[0];
        playlist.push({
          file: null,
          url: url,
          name: decodeURIComponent(filename),
          artist:'Remote URL',
        });

        renderPlaylist();
        updateButtons();
        urlInput.value = '';
      });

      // Playlist sidebar
      function setSidebarVisibility(visible) {
        togglePlaylistBtn.setAttribute('aria-expanded', visible);
        if (visible) {
            playlistPanel.classList.remove('translate-x-full');
            mainContent.classList.add('lg:pr-80');
            playlistToggleIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />`;
        } else {
            playlistPanel.classList.add('translate-x-full');
            mainContent.classList.remove('lg:pr-80');
            playlistToggleIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>`;
        }
      }
      togglePlaylistBtn.addEventListener('click', () => {
          const isCurrentlyHidden = playlistPanel.classList.contains('translate-x-full');
          setSidebarVisibility(isCurrentlyHidden);
      });
      closePlaylistBtn.addEventListener('click', () => setSidebarVisibility(false));

      // Modals
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

      // Keyboard shortcuts
      document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.isContentEditable) return;
        switch (e.key) {
          case ' ': e.preventDefault(); togglePlayPause(); break;
          case 'ArrowRight': e.preventDefault(); playNextTrack(); break;
          case 'ArrowLeft': e.preventDefault(); playPrevTrack(); break;
        }
      });
      
      // Initialize tooltips
      tippy('[data-tippy-content]', {
        theme: 'material',
        animation: 'shift-away-subtle',
        delay: [150, 0],
      });
      
      // Initial page load animation
      anime({
        targets: '.container > *',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        easing: 'easeOutQuad'
      });
    });
