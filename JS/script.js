// Select DOM elements
const playBtn = document.getElementById("play");
const previousBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");
const volumeBtn = document.getElementById("volume");
const seekBar = document.getElementById("seekbar");
const volumeBar = document.getElementById("volume-bar");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");

console.log("Modern JavaScript Spotify Clone 🎵");

// Modern class-based approach
class SpotifyApp {
  constructor() {
    this.currentSong = new Audio();
    this.songs = [];
    this.currFolder = "";
    this.init();
  }

  // Utility function with modern syntax
  secondsToMinutesSeconds = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return [minutes, remainingSeconds]
      .map((time) => String(time).padStart(2, "0"))
      .join(":");
  };

  // Modern async/await with error handling
  async getSongs(folder) {
    try {
      this.currFolder = folder;

      // Template literal for cleaner string interpolation
      const response = await fetch(`http://127.0.0.1:3000/${folder}/`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();

      // Modern DOM manipulation
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const links = doc.querySelectorAll("a");

      // Modern array methods with destructuring
      this.songs = Array.from(links)
        .map((link) => link.href)
        .filter((href) => href.endsWith(".mp3"))
        .map((href) => {
          const [, songName] = href.split(`/${folder}/`);
          return songName;
        });

      await this.renderSongList();
      return this.songs;
    } catch (error) {
      console.error("Error fetching songs:", error);
      this.showError("Could not load songs. Please try again.");
      return [];
    }
  }

  // Modern DOM manipulation with template literals
  async renderSongList() {
    const songUL = document.querySelector(".songList ul");

    // Clear existing content
    songUL.innerHTML = "";

    // Modern forEach with arrow function
    this.songs.forEach((song) => {
      const listItem = this.createSongListItem(song);
      songUL.appendChild(listItem);
    });

    // Event delegation for better performance
    this.attachSongListeners();
  }

  // Create song list item with modern approach
  createSongListItem(song) {
    const li = document.createElement("li");
    const cleanSongName = decodeURIComponent(song.replaceAll("%20", " "));

    li.innerHTML = `
            <img class="invert" width="34" src="img/music.svg" alt="music">
            <div class="info">
                <h3>${cleanSongName}</h3>
                <p>Unknown Artist</p>
                
                
            </div>
            <div class="playnow">
                <h2>Play Now</h2>
                <img class="invert" play-btn src="img/play.svg" alt="play">
            </div>
        `;
        

    return li;
  }

  // Modern event handling with arrow functions
  attachSongListeners() {
    const songList = document.querySelector(".songList");

    // Event delegation - modern approach
    songList.addEventListener("click", (e) => {
      const listItem = e.target.closest("li");
      if (listItem) {
        const songName = listItem.querySelector(".info h3").textContent.trim();
        this.playMusic(songName);
      }
      
    });
    
  }

  // Modern method with default parameters
  playMusic = (track, pause = false) => {
    // Template literal for path
    this.currentSong.src = `/${this.currFolder}/${track}`;

    if (!pause) {
      this.currentSong.play().catch((error) => {
        console.error("Playback failed:", error);
        this.showError("Could not play this track");
      });
      this.updatePlayButton("pause");
    }

    // Modern DOM updates
    this.updateSongInfo(track);
    this.updateSongTime("00:00", "00:00");
  };

  // Separate methods for cleaner code
  updatePlayButton(state) {
    const playBtn = document.getElementById("play");
    playBtn.src = state === "pause" ? "img/pause.svg" : "img/play.svg";
  }

  updateSongInfo(track) {
    const songInfo = document.querySelector(".songinfo");
    songInfo.textContent = decodeURIComponent(track);
  }

  updateSongTime(current, duration) {
    const songTime = document.querySelector(".songtime");
    songTime.textContent = `${current} / ${duration}`;
  }

  // Modern async function for albums
  async displayAlbums() {
    try {
      console.log("Loading albums...");

      const response = await fetch("/songs/");
      if (!response.ok) throw new Error("Failed to fetch albums");

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const anchors = doc.querySelectorAll("a");

      const cardContainer = document.querySelector(".cardContainer");
      cardContainer.innerHTML = ""; // Clear existing cards

      // Modern array processing
      const albumPromises = Array.from(anchors)
        .filter((anchor) => anchor.href.includes("/songs/"))
        .filter((anchor) => {
          const folderName = anchor.href.split("/").slice(-2)[0];
          return folderName !== "songs"; // Exclude the parent folder link
        })
        .map((anchor) => this.createAlbumCard(anchor));

      // Wait for all album cards to be created
      await Promise.allSettled(albumPromises);

      this.attachCardListeners();
    } catch (error) {
      console.error("Error loading albums:", error);
      this.showError("Could not load albums");
    }
  }

  // Modern async album card creation
  async createAlbumCard(anchor) {
    try {
      const folder = anchor.href.split("/").slice(-2)[0];
      if (folder === "") return;

      // Fetch album info
      const infoResponse = await fetch(`/songs/${folder}/info.json`);
      if (!infoResponse.ok) {
        console.warn(`info.json not found for folder: ${folder}`);
        return;
      }
      const albumInfo = await infoResponse.json();

      const cardContainer = document.querySelector(".cardContainer");
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.folder = `songs/${folder}`;

      card.innerHTML = `
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="${albumInfo.title}">
                <h2>${albumInfo.title}</h2>
                <p>${albumInfo.description}</p>
            `;

      cardContainer.appendChild(card);
    } catch (error) {
      console.error(`Error creating card for folder:`, error);
    }
  }

  // Modern event listeners with arrow functions
  attachCardListeners() {
    const cards = document.querySelectorAll(".card");

    cards.forEach((card) => {
      card.addEventListener("click", async () => {
        const folder = card.dataset.folder;
        console.log(`Loading playlist: ${folder}`);

        this.songs = await this.getSongs(folder);
        if (this.songs.length > 0) {
          this.playMusic(this.songs[0]);
        }
      });
    });
  }

  // Modern control handlers
  setupControls() {
    const { play, previous, next } = this.getControlElements();

    // Play/Pause with modern syntax
    play?.addEventListener("click", () => {
      if (this.currentSong.paused) {
        this.currentSong.play();
        this.updatePlayButton("pause");
      } else {
        this.currentSong.pause();
        this.updatePlayButton("play");
      }
    });

    // Previous song with modern array methods
    previous?.addEventListener("click", () => {
      this.currentSong.pause();
      const currentIndex = this.songs.indexOf(
        this.currentSong.src.split("/").pop()
      );

      if (currentIndex > 0) {
        this.playMusic(this.songs[currentIndex - 1]);
      }
    });

    // Next song
    next?.addEventListener("click", () => {
      this.currentSong.pause();
      const currentIndex = this.songs.indexOf(
        this.currentSong.src.split("/").pop()
      );

      if (currentIndex < this.songs.length - 1) {
        this.playMusic(this.songs[currentIndex + 1]);
      }
    });
  }

  // Helper method with destructuring
  getControlElements() {
    return {
      play: document.getElementById("play"),
      previous: document.getElementById("previous"),
      next: document.getElementById("next"),
    };
  }

  // Modern time update handler
  setupTimeTracking() {
    this.currentSong.addEventListener("timeupdate", () => {
      const { currentTime, duration } = this.currentSong;

      if (!isNaN(duration)) {
        const current = this.secondsToMinutesSeconds(currentTime);
        const total = this.secondsToMinutesSeconds(duration);

        this.updateSongTime(current, total);
        this.updateSeekbar(currentTime, duration);
      }
    });
  }

  // Modern seekbar handling
  setupSeekbar() {
    const seekbar = document.querySelector(".seekbar");

    seekbar?.addEventListener("click", (e) => {
      const { offsetX } = e;
      const { width } = e.target.getBoundingClientRect();
      const percent = (offsetX / width) * 100;

      document.querySelector(".circle").style.left = `${percent}%`;
      this.currentSong.currentTime =
        (this.currentSong.duration * percent) / 100;
    });
  }

  updateSeekbar(currentTime, duration) {
    const percent = (currentTime / duration) * 100;
    document.querySelector(".circle").style.left = `${percent}%`;
  }

  // Modern volume control
  setupVolumeControl() {
    const volumeSlider = document.querySelector(".range input");
    const volumeIcon = document.querySelector(".volume > img");

    // Volume slider
    volumeSlider?.addEventListener("change", (e) => {
      const volume = parseInt(e.target.value) / 100;
      this.currentSong.volume = volume;

      // Update icon based on volume
      volumeIcon.src = volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });

    // Volume icon toggle
    volumeIcon?.addEventListener("click", () => {
      const isMuted = this.currentSong.volume === 0;

      if (isMuted) {
        volumeIcon.src = "img/volume.svg";
        this.currentSong.volume = 0.1;
        volumeSlider.value = 10;
      } else {
        this.currentSong.volume = 0;
        volumeIcon.src = "img/mute.svg";
        volumeSlider.value = 0;
      }
    });
  }

  // Modern mobile navigation
  setupMobileNavigation() {
    const hamburger = document.querySelector(".hamburger");
    const closeBtn = document.querySelector(".close");
    const leftPanel = document.querySelector(".left");

    hamburger?.addEventListener("click", () => {
      leftPanel.style.left = "0";
    });

    closeBtn?.addEventListener("click", () => {
      leftPanel.style.left = "-120%";
    });
  }

  // Modern error handling
  showError(message) {
    console.error(message);
    // আপাতত console এ show করছি, পরে UI toast বানানো যাবে
  }

  // Modern initialization
  async init() {
    try {
      console.log("🚀 Initializing Modern Spotify App...");

      // Load default songs from the first folder found
      const firstFolder = "songs/ncs"; // You can set any folder as default
      await this.getSongs(firstFolder);

      if (this.songs.length > 0) {
        this.playMusic(this.songs[0], true);
      }

      // Load albums
      await this.displayAlbums();

      // Setup all event listeners
      this.setupControls();
      this.setupTimeTracking();
      this.setupSeekbar();
      this.setupVolumeControl();
      this.setupMobileNavigation();

      console.log("✅ App initialized successfully!");
    } catch (error) {
      console.error("❌ App initialization failed:", error);
      this.showError("Failed to initialize app");
    }
  }
}

// Modern app instantiation
const spotifyApp = new SpotifyApp();
