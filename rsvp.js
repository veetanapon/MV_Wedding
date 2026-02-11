const statusMessage = document.getElementById('statusMessage');
const GAS_URL = "https://script.google.com/macros/s/AKfycbw1EGsx0VNAIJGsR_uqQzJbsVWGnvrZjL1OS0F9NmsbpWFvmGlmmMfGplJZmnYfYCpI/exec";

async function submitRSVP(isComing) {

  const name = document.getElementById('name').value.trim();

  if (!name) {
    statusMessage.style.color = "red";
    statusMessage.innerText = "กรุณากรอกชื่อก่อนยืนยัน";
    return;
  }

  statusMessage.style.color = "#999";
  statusMessage.innerText = "กำลังบันทึกข้อมูล...";

  try {
    const payload = {
      action: "rsvp",
      sendingName: name,
      isComingSelection: isComing
    };
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.text();

    if (result === "done") {
      statusMessage.style.color = "green";
      statusMessage.innerText = "บันทึกเรียบร้อย ขอบคุณมากค่ะ 🤍";
      document.getElementById('name').value = "";
    } else {
      throw new Error("Unexpected response");
    }

  } catch (error) {
    statusMessage.style.color = "red";
    statusMessage.innerText = "เกิดข้อผิดพลาด กรุณาลองใหม่";
  }
}
