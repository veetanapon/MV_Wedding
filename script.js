const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing=false, hasDrawn=false, uploadBase64=null;
let currentMode="pen", lastColor="#2C3E50";
let canSubmit = false;

/* ===== Utils ===== */
function autoExpand(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width=rect.width*ratio;
  canvas.height=rect.height*ratio;
  ctx.setTransform(ratio,0,0,ratio,0,0);
}

/* ===== Canvas ===== */
function showCanvas() {
  canvas.style.display = "block";
  document.getElementById("canvasTools").style.display = "block";
  document.getElementById("btnShowCanvas").style.display = "none";
  resizeCanvas();
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const evt = e.touches ? e.touches[0] : e;
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  };
}

function startDrawing(e) {
  drawing = true;
  hasDrawn = true;
  updateSubmitState();
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  e.preventDefault();
}

function draw(e) {
  if (!drawing) return;
  const pos = getPos(e);
  ctx.lineWidth = document.getElementById("penSize").value;
  ctx.lineCap = "round";
  ctx.strokeStyle =
    currentMode === "eraser" ? "#ffffff" : lastColor;
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  e.preventDefault();
}

function stopDrawing() {
  drawing = false;
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", stopDrawing);

canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing);

/* ===== Tools ===== */
document.querySelectorAll(".dot[data-color]").forEach(d=>{
  d.onclick=()=>{
    lastColor=d.dataset.color;
    document.querySelectorAll(".dot").forEach(x=>x.classList.remove("active"));
    d.classList.add("active");
  };
});
/* CUSTOM COLOR FIX */
customColorBtn.onclick=()=>customColorInput.click();
customColorInput.oninput=e=>{
  lastColor=e.target.value;
  document.querySelectorAll(".dot").forEach(x=>x.classList.remove("active"));
  customColorBtn.classList.add("active");
};

function setEraser(){ lastColor="#fff"; }

function changePenSize(size) {
  document.getElementById("penSizeLabel").innerText = size + " px";
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hasDrawn = false;
  updateSubmitState();
}

/* ===== Upload ===== */
function toggleSupport() {
  document.getElementById("uploadArea").style.display = "block";
}

function previewImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    uploadBase64 = e.target.result;
    document.getElementById("filePreview").src = e.target.result;
    document.getElementById("previewContainer").style.display = "block";
    updateSubmitState();
  };
  reader.readAsDataURL(file);
}

function removeUpload() {
  uploadBase64 = null;
  document.getElementById("fileInput").value = "";
  document.getElementById("previewContainer").style.display = "none";
  updateSubmitState();
}

/* ===== Validation ===== */
function updateSubmitState() {
  const msg = document.getElementById("sendingMessage").value.trim();
  canSubmit = msg.length > 0 || hasDrawn || uploadBase64;
  document.getElementById("submitBtn").disabled = !canSubmit;
}

/* ===== Submit ===== */
function submitForm() {
  if (!canSubmit) return;

  const payload = {
    sendingName: document.getElementById("sendingName").value || "ไม่ประสงค์ออกนาม",
    sendingMessage: document.getElementById("sendingMessage").value || "",
    image: hasDrawn ? canvas.toDataURL("image/png") : null,
    uploadImage: uploadBase64
  };

  console.log("SEND", payload);
  // fetch ไป GAS ได้เลย
}

const customBtn = document.getElementById("customColorBtn");
const customInput = document.getElementById("customColorInput");

customBtn.addEventListener("click", () => {
  customInput.click();
});

customInput.addEventListener("input", e => {
  currentMode = "pen";
  lastColor = e.target.value;

  document.querySelectorAll(".dot").forEach(d => d.classList.remove("active"));
  customBtn.classList.add("active");
});
