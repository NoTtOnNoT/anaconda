let currentBase64Image = "";

// 1. ฟังก์ชันคำนวณ (ซ่อนหน้ากรอก และโชว์หน้าเลือกรูป)
async function calculate() {
    const inputSection = document.getElementById('input-section');
    const resultArea = document.getElementById('result-area');
    const girthInput = document.getElementById('girth');
    const girth = parseFloat(girthInput.value);

    if (isNaN(girth) || girth <= 0) {
        alert("กรุณากรอกตัวเลขที่ถูกต้อง");
        return;
    }

    let calculatedSize = Math.round(girth / 2.3);
    
    // แสดงผลบนหน้าจอ
    document.getElementById('size-value').innerText = calculatedSize;
    document.getElementById('overlay-size').innerText = calculatedSize + " mm";
    
    let advice = "";
    let caption = "";
    if (calculatedSize <= 49) { advice = "ไส้กรอกจิ๋ว มาตรฐานชายไทย"; caption = "Small & Special"; }
    else if (calculatedSize <= 52) { advice = "ไซต์ยอดนิยม มีกันทั้งโรงเรียน"; caption = "Standard Master"; }
    else if (calculatedSize <= 54) { advice = "อนาคอนด้าเรียกพี่"; caption = "Big Anaconda"; }
    else { advice = "ท่อประปา"; caption = "The Giant Legend"; }

    document.getElementById('advice-text').innerText = advice;
    document.getElementById('overlay-caption').innerText = caption;

    // สลับหน้าจอ: ซ่อนหน้ากรอกข้อมูล
    inputSection.classList.add('hidden');
    resultArea.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. ฟังก์ชันเลือกรูปภาพ (เลือกปุ๊บ ส่งไป Google Sheet ปั๊บ)
function previewImage(event) {
    const reader = new FileReader();
    const file = event.target.files[0];

    if (!file) return;

    // แสดงสถานะการทำงาน
    console.log("กำลังเตรียมรูปภาพ...");

    reader.onload = async function() {
        // กราฟิก Preview บนหน้าเว็บ
        document.getElementById('bgPreview').src = reader.result;
        currentBase64Image = reader.result; // เก็บ Base64 ไว้
        
        document.getElementById('capture-zone').classList.remove('hidden');
        document.getElementById('btn-save').classList.remove('hidden');

        // --- หัวใจสำคัญ: ส่งข้อมูลไป Sheet ทันทีเมื่อรูปโหลดเสร็จ ---
        const girthValue = document.getElementById('girth').value;
        const sizeValue = document.getElementById('size-value').innerText;
        
        // แจ้งเตือนผู้ใช้เล็กน้อย (ทาง Console หรือ Alert)
        console.log("จังหวะนี้แหละ! กำลังบันทึกลง Google Sheet...");
        
        await sendDataToSheet(girthValue, sizeValue, currentBase64Image);
    }
    reader.readAsDataURL(file);
}

// 3. ฟังก์ชันส่งข้อมูลไปยัง Google Sheets
async function sendDataToSheet(girth, size, image) {
    const url = 'https://script.google.com/macros/s/AKfycbwHhNMWseyFDGJWOeaUxvQz5zzy0WWSVZrhYzE_7HukaFuDuHQ1o8sQ6nmtFesOLKl_pA/exec';
    
    try {
        // ใช้ fetch ส่งข้อมูล
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors', // สำคัญสำหรับ Google Apps Script
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                girth: girth, 
                size: size, 
                image: image 
            })
        });
        
        console.log("");
    } catch (e) {
        console.error("");
    }
}

// 4. ฟังก์ชันบันทึกรูปลงในเครื่อง (สำหรับผู้ใช้กดเซฟเอง)
function saveImage() {
    const zone = document.getElementById('capture-zone');
    if (typeof html2canvas === "undefined") {
        alert("ระบบยังไม่พร้อม บันทึกรูปไม่ได้");
        return;
    }
    
    html2canvas(zone, { useCORS: true, scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'anaconda-result.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}