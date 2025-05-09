let scene, camera, renderer, box;
let currentGifURL = "";
let currentMessage = "";

const urlParams = new URLSearchParams(window.location.search);
const giftId = urlParams.get('id');

// Load saved gift if ID exists
if (giftId && localStorage.getItem(`gift_${giftId}`)) {
  const savedGift = JSON.parse(localStorage.getItem(`gift_${giftId}`));
  currentGifURL = savedGift.gif;
  currentMessage = savedGift.message;

  document.getElementById("giftGif").src = currentGifURL;
  document.getElementById("messageBox").value = currentMessage;
}

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container').appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  box = new THREE.Mesh(geometry, material);
  scene.add(box);

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  // Restore message
  if (!giftId && localStorage.getItem("savedMessage")) {
    document.getElementById("messageBox").value = localStorage.getItem("savedMessage");
  }

  // Handle click/touch
  window.addEventListener('click', openGiftBox);
  window.addEventListener('touchstart', openGiftBox);

  // GIF upload handler
  document.getElementById("gifInput").addEventListener("change", handleGIFUpload);

  // Share button
  document.getElementById("shareBtn").addEventListener("click", generateShareLink);
}

function animate() {
  requestAnimationFrame(animate);
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
}

function openGiftBox() {
  document.getElementById('giftModal').style.display = 'flex';
}

document.getElementById('closeBtn').addEventListener('click', () => {
  document.getElementById('giftModal').style.display = 'none';
});

function addEmoji(emoji) {
  const msgBox = document.getElementById("messageBox");
  msgBox.value += emoji;
  msgBox.style.height = "auto";
  msgBox.style.height = Math.min(msgBox.scrollHeight, 100) + "px";
  saveMessage();
}

function saveMessage() {
  const msg = document.getElementById("messageBox").value;
  currentMessage = msg;

  if (!giftId) {
    localStorage.setItem("savedMessage", msg);
  }

  if (giftId) {
    const giftData = {
      gif: currentGifURL,
      message: msg
    };
    localStorage.setItem(`gift_${giftId}`, JSON.stringify(giftData));
  }
}

function handleGIFUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    currentGifURL = e.target.result;
    document.getElementById("giftGif").src = currentGifURL;

    if (!giftId) {
      localStorage.setItem("uploadedGif", currentGifURL);
    }
    saveMessage();
  };
  reader.readAsDataURL(file);
}

function generateShareLink() {
  const id = Date.now().toString();
  const giftData = {
    gif: currentGifURL,
    message: document.getElementById("messageBox").value
  };
  localStorage.setItem(`gift_${id}`, JSON.stringify(giftData));

  const shareLink = `${window.location.origin}${window.location.pathname}?id=${id}`;
  navigator.clipboard.writeText(shareLink).then(() => {
    alert("🎁 Link copied to clipboard!");
  });
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});