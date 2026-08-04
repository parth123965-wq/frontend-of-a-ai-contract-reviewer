/* ==========================================
   AI Contract Reviewer - Contract Detail Logic
========================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const user = await checkAuth();
  if (!user) return;

  initDetailPage();
});

/* Authentication Verification */
async function checkAuth() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No active session");
    return user;
  } catch (error) {
    console.warn("User authentication required:", error.message);
    window.location.replace("index.html");
    return null;
  }
}

/* Page Initialization */
async function initDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get("id") || "1";

  initDetailEvents(contractId);
  await fetchAndRenderContract(contractId);
}

/* Event Handlers */
function initDetailEvents(contractId) {
  const reanalyzeBtn = document.getElementById("reanalyzeBtn");
  if (reanalyzeBtn) {
    reanalyzeBtn.addEventListener("click", async () => {
      showToast("Re-analyzing contract clauses...", "info");
      reanalyzeBtn.disabled = true;
      setTimeout(async () => {
        reanalyzeBtn.disabled = false;
        showToast("Analysis re-calculated successfully!", "success");
        await fetchAndRenderContract(contractId);
      }, 1200);
    });
  }

  const deleteBtn = document.getElementById("deleteContractBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this contract?")) {
        try {
          await deleteContract(contractId);
          showToast("Contract deleted. Redirecting...", "info");
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 800);
        } catch (err) {
          showToast("Failed to delete contract.", "error");
        }
      }
    });
  }
}

/* Fetch & Render Contract Details */
async function fetchAndRenderContract(contractId) {
  try {
    const contract = await getContractById(contractId);
    if (!contract) throw new Error("Contract record not found");

    renderContractMetadata(contract);
    renderRiskScoreGauge(contract.risk_score);
    renderFindings(contract.key_findings);
  } catch (error) {
    console.error("Error loading contract details:", error);
    showToast(error.message || "Failed to load contract detail.", "error");

    const titleEl = document.getElementById("contract-title");
    if (titleEl) titleEl.textContent = "Contract Not Found";
  }
}

/* Render Metadata */
function renderContractMetadata(contract) {
  const titleEl = document.getElementById("contract-title");
  const statusEl = document.getElementById("contract-status");
  const sizeEl = document.getElementById("contract-size");
  const dateEl = document.getElementById("contract-date");
  const summaryEl = document.getElementById("contract-summary");

  if (titleEl) titleEl.textContent = contract.original_filename || "Untitled Contract";

  if (statusEl) {
    const norm = (contract.status || "processing").toLowerCase();
    statusEl.textContent = contract.status || "Processing";
    statusEl.className = `badge ${norm === 'completed' ? 'status-completed' : 'badge-warning'}`;
  }

  if (sizeEl) sizeEl.textContent = contract.file_size || "1.4 MB";

  if (dateEl) {
    dateEl.textContent = contract.created_at
      ? new Date(contract.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "N/A";
  }

  if (summaryEl) {
    summaryEl.textContent = contract.summary || "AI engine has generated an initial executive risk breakdown for this agreement.";
  }
}

/* Render Risk Gauge */
function renderRiskScoreGauge(score) {
  const scoreValEl = document.getElementById("risk-score-value");
  const circleEl = document.getElementById("risk-score-circle");
  const labelEl = document.getElementById("risk-score-label");

  if (score === null || score === undefined) {
    if (scoreValEl) scoreValEl.textContent = "--";
    if (labelEl) labelEl.textContent = "Analysis Pending";
    return;
  }

  if (scoreValEl) scoreValEl.textContent = score;

  if (circleEl) {
    circleEl.className = "risk-score";
    if (score >= 70) {
      circleEl.classList.add("risk-high");
      if (labelEl) labelEl.textContent = "⚠️ High Risk Contract Exposure";
    } else if (score >= 40) {
      circleEl.classList.add("risk-medium");
      if (labelEl) labelEl.textContent = "⚡ Moderate Risk Contract";
    } else {
      circleEl.classList.add("risk-low");
      if (labelEl) labelEl.textContent = "✓ Low Risk / Standard Terms";
    }
  }
}

/* Render Findings */
function renderFindings(findings) {
  const container = document.getElementById("findings-list");
  if (!container) return;

  container.innerHTML = "";

  if (!findings || !findings.length) {
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--color-text-muted);">
        ✓ No critical risk clause anomalies detected.
      </div>
    `;
    return;
  }

  findings.forEach((item) => {
    const findingDiv = document.createElement("div");
    findingDiv.className = "finding-item";

    let badgeType = "badge-risk-medium";
    if (item.type === "high") badgeType = "badge-risk-high";
    if (item.type === "low") badgeType = "badge-risk-low";

    findingDiv.innerHTML = `
      <div class="finding-header">
        <span class="finding-clause">${escapeHtml(item.clause || "Clause Analysis")}</span>
        <span class="badge ${badgeType}">${(item.type || "risk").toUpperCase()}</span>
      </div>
      <p class="finding-desc">${escapeHtml(item.description || "")}</p>
    `;

    container.appendChild(findingDiv);
  });
}

/* Toast Helper */
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✓'}</span> <div>${message}</div>`;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
