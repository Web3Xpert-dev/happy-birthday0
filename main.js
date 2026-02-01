const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* ================= CANVAS ================= */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ================= LOAD FACE ================= */
const face = new Image();
face.src = "images/face.jpeg";

/* ================= LOAD PHOTOS ================= */
const photos = [];
for (let i = 1; i <= 25; i++) {
  const img = new Image();
  img.src = `images/${i}.jpeg`;
  photos.push(img);
}

/* ================= STATE ================= */
let particles = [];
let started = false;
let LIMIT = window.innerWidth < 768 ? 900 : 1600;

/* ================= TREE ================= */
function drawTree() {
  ctx.strokeStyle = "#5b3a29";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, canvas.height);
  ctx.lineTo(canvas.width / 2, canvas.height * 0.55);
  ctx.stroke();
}

/* ================= BUILD FACE ================= */
function buildFace() {
  const fw = face.width;
  const fh = face.height;
  if (!fw || !fh) return;

  const scale = Math.min(
    (canvas.width / fw) * 0.6,
    (canvas.height / fh) * 0.6
  );

  const w = Math.floor(fw * scale);
  const h = Math.floor(fh * scale);
  const x0 = canvas.width / 2 - w / 2;
  const y0 = canvas.height * 0.55 - h / 2;

  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  const tctx = temp.getContext("2d");
  tctx.drawImage(face, 0, 0, w, h);

  let data;
  try {
    data = tctx.getImageData(0, 0, w, h).data;
  } catch (e) {
    console.error("ImageData error", e);
    return;
  }

  particles = [];

  for (let y = 0; y < h; y += 6) {
    for (let x = 0; x < w; x += 6) {
      const i = (y * w + x) * 4;
      if (data[i + 3] > 120 && particles.length < LIMIT) {
        particles.push({
          x: x0 + x,
          y: y0 + y,
          oy: y0 + y,
          a: Math.random() * Math.PI * 2,
          s: 4 + Math.random() * 4,
          img: photos[Math.floor(Math.random() * photos.length)]
        });
      }
    }
  }
}

/* ================= ANIMATE ================= */
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTree();

  particles.forEach(p => {
    p.a += 0.02;
    p.y = p.oy + Math.sin(p.a) * 2;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(p.img, p.x, p.y, p.s, p.s);
  });

  requestAnimationFrame(animate);
}

/* ================= AUTO START ================= */
function start() {
  if (started) return;
  started = true;
  buildFace();
  animate();
}

/* Start when face loads */
face.onload = () => {
  start();
};

/* Fallback (GitHub slow load fix) */
setTimeout(() => {
  if (!started) start();
}, 2000);
