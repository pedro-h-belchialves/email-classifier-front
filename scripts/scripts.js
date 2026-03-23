let currentTab = "text";
let selectedFile = null;
let isLoading = false;

function switchTab(tab) {
  currentTab = tab;
  document
    .getElementById("tab-text")
    .classList.toggle("active", tab === "text");
  document
    .getElementById("tab-file")
    .classList.toggle("active", tab === "file");
  document
    .getElementById("tab-text")
    .setAttribute("aria-selected", tab === "text");
  document
    .getElementById("tab-file")
    .setAttribute("aria-selected", tab === "file");

  // Show/hide the panels
  document
    .getElementById("panel-text")
    .classList.toggle("hidden", tab !== "text");
  document
    .getElementById("panel-file")
    .classList.toggle("hidden", tab !== "file");
  hideError();
}

// funçao de contagem de caracteres
function updateCharCount() {
  const ta = document.getElementById("email-text");
  const count = ta.value.length;
  const el = document.getElementById("char-count");
  el.textContent = `${count.toLocaleString("pt-BR")} / 8,000`;
  el.style.color = count > 7000 ? "#dc2626" : "var(--ink-muted)";
}

// tratamento de arquivos
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) setFile(file);
}

function handleDragOver(event) {
  event.preventDefault();
  document.getElementById("drop-zone").classList.add("drag-over");
}

function handleDragLeave(event) {
  document.getElementById("drop-zone").classList.remove("drag-over");
}

function handleDrop(event) {
  event.preventDefault();
  document.getElementById("drop-zone").classList.remove("drag-over");
  const file = event.dataTransfer.files[0];
  if (file) {
    if (!file.name.match(/\.(txt|pdf)$/i)) {
      showError("Only .txt and .pdf files are supported.");
      return;
    }
    setFile(file);
  }
}

function setFile(file) {
  selectedFile = file;
  document.getElementById("file-name").textContent = file.name;
  document.getElementById("file-size").textContent = formatFileSize(file.size);
  document.getElementById("file-info").classList.remove("hidden");
  hideError();
}

function clearFile() {
  selectedFile = null;
  document.getElementById("file-input").value = "";
  document.getElementById("file-info").classList.add("hidden");
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

//tratamento de erros
function showError(msg) {
  const el = document.getElementById("error-msg");
  document.getElementById("error-text").textContent = msg;
  el.classList.remove("hidden");
}

function hideError() {
  document.getElementById("error-msg").classList.add("hidden");
}

//tratamento de loading
function setLoading(loading) {
  isLoading = loading;
  const btn = document.getElementById("classify-btn");
  const btnText = document.getElementById("btn-text");
  const btnIcon = document.getElementById("btn-icon");

  btn.disabled = loading;

  if (loading) {
    // troca o icone do botão ao carregar
    btnIcon.outerHTML = `<svg id="btn-icon" class="w-4 h-4 spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="3"/>
          <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>`;
    btnText.textContent = "Processando...";
  } else {
    document.getElementById("btn-icon").outerHTML =
      `<svg id="btn-icon" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
        </svg>`;
    btnText.textContent = "Classificar";
  }
}

// liga e desliga o skeleton
function showSkeleton() {
  const area = document.getElementById("result-area");
  area.classList.remove("hidden");
  document.getElementById("skeleton").classList.remove("hidden");
  document.getElementById("result-card").classList.add("hidden");
}

function hideSkeleton() {
  document.getElementById("skeleton").classList.add("hidden");
}

// Função para lidar com o resultado da api
function renderResult(data) {
  const isProductivo = data.category.toLowerCase() === "produtivo";
  const badge = document.getElementById("classification-badge");

  if (isProductivo) {
    badge.textContent = "✓ Produtivo";
    badge.style.cssText = `background: var(--green-soft); color: var(--green); border: 1px solid rgba(22,163,74,0.25);`;
    badge.classList.add("badge-productive");
  } else {
    badge.textContent = "— Improdutivo";
    badge.style.cssText = `background: var(--gray-badge-soft); color: var(--gray-badge); border: 1px solid rgba(107,114,128,0.2);`;
    badge.classList.remove("badge-productive");
  }

  document.getElementById("response-text").textContent =
    data.suggested_response || "No suggested response provided.";

  hideSkeleton();

  // animação do card
  const card = document.getElementById("result-card");
  card.classList.remove("result-animate");
  void card.offsetWidth;
  card.classList.add("result-animate", "hidden");
  requestAnimationFrame(() => {
    card.classList.remove("hidden");
  });

  // scroll para o card gerado
  setTimeout(() => {
    document
      .getElementById("result-area")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

// funçao de copiar o texto sugerido
function copyResponse() {
  const text = document.getElementById("response-text").textContent;
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const btn = document.getElementById("copy-btn");
      const label = document.getElementById("copy-label");
      const icon = document.getElementById("copy-icon");
      btn.classList.add("copied");
      label.textContent = "Copiado!";
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>`;
      setTimeout(() => {
        btn.classList.remove("copied");
        label.textContent = "Copiar";
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/>`;
      }, 2200);
    })
    .catch(() => {
      showError("Could not copy to clipboard. Please copy manually.");
    });
}

// interação com a api
async function classifyText(text) {
  const response = await fetch("http://localhost:8000/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text }),
  });
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}

async function classifyFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("http://localhost:8000/classify-file", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  return response.json();
}

// funçao de classificação principal
async function classify() {
  if (isLoading) return;
  hideError();

  // verifica se o texto ou o arquivo foi selecionado
  if (currentTab === "text") {
    const text = document.getElementById("email-text").value.trim();
    if (!text) {
      showError("Please paste an email before classifying.");
      return;
    }
  } else {
    if (!selectedFile) {
      showError("Please upload a file before classifying.");
      return;
    }
  }

  setLoading(true);
  showSkeleton();

  try {
    let data;
    if (currentTab === "text") {
      const text = document.getElementById("email-text").value.trim();
      data = await classifyText(text);
    } else {
      data = await classifyFile(selectedFile);
    }
    renderResult(data);
  } catch (err) {
    console.error("Classification error:", err);
    hideSkeleton();
    document.getElementById("result-area").classList.add("hidden");
    showError(err.message || "Algo deu errado... tente novamente mais tarde.");
  } finally {
    setLoading(false);
  }
}

// lidr com os atalhos do teclado
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    classify();
  }
});
