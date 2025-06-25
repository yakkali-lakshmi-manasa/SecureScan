function showTool(tool) {
  const tools = ['text', 'link', 'file', 'image'];
  tools.forEach(t => {
    document.getElementById(`${t}-tool`).classList.add('hidden');
  });
  document.getElementById(`${tool}-tool`).classList.remove('hidden');
  document.getElementById('result-box').textContent = '';
}

async function scanText() {
  const text = document.getElementById("text-input").value;
  const res = await fetch("http://127.0.0.1:8000/scan/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  showResult(data);
}

async function scanLink() {
  const link = document.getElementById("link-input").value;
  const res = await fetch("http://127.0.0.1:8000/scan/link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: link })
  });
  const data = await res.json();
  showResult(data);
}

async function scanFile() {
  const file = document.getElementById("file-input").files[0];
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("http://127.0.0.1:8000/scan/file", {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  showResult(data);
}

async function scanImage() {
  const image = document.getElementById("image-input").files[0];
  const formData = new FormData();
  formData.append("image", image);
  const res = await fetch("http://127.0.0.1:8000/scan/image", {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  showResult(data);
}

function showResult(data) {
  const box = document.getElementById("result-box");
  box.textContent = `${data.status.toUpperCase()}: ${data.message}`;
}
