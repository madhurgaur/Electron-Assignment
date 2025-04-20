let captureCount = 0;

const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const statusText = document.getElementById('capture-status');
const folderPath = document.getElementById('folder-path');
const intervalInput = document.getElementById('interval');
const formatSelect = document.getElementById('format');

document.getElementById('select-folder').addEventListener('click', async () => {
  const folder = await window.electronAPI.selectFolder();
  if (folder) {
    folderPath.textContent = `Folder: ${folder}`;
    folderPath.dataset.path = folder; // Save for later
  }
});

startBtn.addEventListener('click', async () => {
  const interval = parseInt(intervalInput.value);
  const format = formatSelect.value;
  let folder = folderPath.dataset.path;
  const countdownEl = document.getElementById('countdown');

  if (!folder) {
    folder = await window.electronAPI.getHomeDir();
  }

  // Countdown before start
  let countdown = 3;
  countdownEl.textContent = `Starting in ${countdown}...`;
  startBtn.disabled = true;
  stopBtn.disabled = true;

  const countdownTimer = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      countdownEl.textContent = `Starting in ${countdown}...`;
    } else {
      clearInterval(countdownTimer);
      countdownEl.textContent = '';
      
      // Start capturing
      captureCount = 0;
      window.electronAPI.startCapturing({ interval, format, folder });

      statusText.textContent = `Capturing started... (0 screenshots)`;
      startBtn.textContent = 'Capturing...';
      startBtn.disabled = true;
      stopBtn.disabled = false;

      window.screenshotTimer = setInterval(() => {
        captureCount++;
        statusText.textContent = `Capturing... (${captureCount} screenshots)`;
      }, interval);
    }
  }, 1000);
});


stopBtn.addEventListener('click', () => {
  window.electronAPI.stopCapturing();

  clearInterval(window.screenshotTimer);
  statusText.textContent = `Capturing stopped after ${captureCount} screenshots.`;
  startBtn.textContent = 'Start Capturing';
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

document.getElementById('exit').addEventListener('click', () => {
  window.close(); // Closes the Electron window
});

const previewImg = document.getElementById('screenshot-preview');

window.electronAPI.onScreenshotPreview((fileUrl) => {
  previewImg.src = fileUrl;
});
