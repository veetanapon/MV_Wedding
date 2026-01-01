const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let hasDrawn = false;
let uploadBase64 = null;
let currentMode = "pen";
let lastColor = "#2C3E50";

/* ===== Utils ===== */
function autoExpand(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
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
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
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

  ctx.lineCap = "round";
  ctx.lineWidth = document.getElementById("penSize").value;

  if (currentMode === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = lastColor;
  }

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
document.querySelectorAll(".dot[data-color]").forEach(dot => {
  dot.addEventListener("click", () => {
    currentMode = "pen";
    lastColor = dot.dataset.color;
    document.querySelectorAll(".dot").forEach(d => d.classList.remove("active"));
    dot.classList.add("active");
  });
});

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

function setEraser() {
  currentMode = "eraser";
}

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
  document.getElementById("submitBtn").disabled =
    !(msg || hasDrawn || uploadBase64);
}

/* ===== Submit ===== */
function submitForm() {
  const btn = document.getElementById('submitBtn');
  if (document.getElementById("submitBtn").disabled) return;

  const payload = {
    sendingName: document.getElementById("sendingName").value || "ไม่ประสงค์ออกนาม",
    sendingMessage: document.getElementById("sendingMessage").value || "",
    image: hasDrawn ? canvas.toDataURL("image/png") : null,
    uploadImage: uploadBase64
  };

  console.log("SEND", payload);
  // fetch ไป GAS ตามของคุณได้เลย
  if (!payload.sendingMessage && !payload.image && !payload.uploadImage) {
        alert("กรุณาพิมพ์ข้อความ วาดรูป หรืออัปโหลดรูปก่อนส่งครับ");
        return;
      }

      btn.disabled = true;
      btn.innerText = "กำลังส่ง...";

      fetch("https://script.google.com/macros/s/AKfycbw1EGsx0VNAIJGsR_uqQzJbsVWGnvrZjL1OS0F9NmsbpWFvmGlmmMfGplJZmnYfYCpI/exec", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        }
      })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          alert("💙 ขอบคุณที่อวยพรเราสองคนค่ะ/ครับ 💙");
          document.getElementById("wishForm").reset();
          clearCanvas();
          canvas.style.display = "none";
          /*document.getElementById('show-Canvas').style.display = "block";
          document.getElementById('clear-Canvas').style.display = "none";
          document.getElementById('upload-area').style.display = 'none';
          document.getElementById('showUploadArea').style.display = 'block';*/
          btn.disabled = false;
          btn.innerText = "ส่งคำอวยพร 💙";
          location.reload();
        } else {
          throw new Error(res.error);
        }
      })
      .catch(err => {
        alert("เกิดข้อผิดพลาด: " + err.message);
        btn.disabled = false;
        btn.innerText = "ส่งคำอวยพร 💙";
      });
}
