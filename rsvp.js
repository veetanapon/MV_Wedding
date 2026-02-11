const statusMessage = document.getElementById("statusMessage");
const nameInput = document.getElementById("name");
const buttons = document.querySelectorAll(".btn");

const GAS_URL = "https://script.google.com/macros/s/AKfycbw1EGsx0VNAIJGsR_uqQzJbsVWGnvrZjL1OS0F9NmsbpWFvmGlmmMfGplJZmnYfYCpI/exec";

async function submitRSVP(isComing) {
  const name = nameInput.value.trim();

  if (!name) {
    showMessage("กรุณากรอกชื่อก่อนยืนยัน", "error");
    return;
  }

  toggleButtons(true);
  showMessage("กำลังบันทึกข้อมูล...", "loading");

  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "rsvp",
        sendingName: name,
        isComingSelection: isComing
      })
    });

    if (!response.ok) {
      throw new Error("Network response not ok");
    }

    const result = (await response.text()).trim();

    if (result === "done") {
      showMessage("บันทึกเรียบร้อย ขอบคุณค่ะ/ครับ 🤍", "success");
      nameInput.value = "";
    } else {
      throw new Error("Unexpected response: " + result);
    }

  } catch (error) {
    console.error(error);
    showMessage("เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
  } finally {
    toggleButtons(false);
  }
}

/* ---------- Helper Functions ---------- */

function toggleButtons(disabled) {
  buttons.forEach(btn => btn.disabled = disabled);
}

function showMessage(text, type) {
  statusMessage.innerText = text;

  switch (type) {
    case "success":
      statusMessage.style.color = "green";
      break;
    case "error":
      statusMessage.style.color = "red";
      break;
    case "loading":
      statusMessage.style.color = "#999";
      break;
    default:
      statusMessage.style.color = "#333";
  }
}
