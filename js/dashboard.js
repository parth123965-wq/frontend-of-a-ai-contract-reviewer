/*
=========================================================
 DASHBOARD.JS

 Dashboard Page Logic

 Responsibilities:
 - Logout
 - Load current user
 - Dashboard initialization

=========================================================
*/
const dashboardElements = {
  username: document.getElementById("username"),

  totalContracts: document.getElementById("total-contracts"),

  completedReviews: document.getElementById("completed-reviews"),

  riskAlerts: document.getElementById("risk-alerts"),

  processingContracts: document.getElementById("processing-contracts"),

  contractTable: document.getElementById("contract-table-body"),
};

// =======================================================
// SECTION 1: LOGOUT BUTTON
// =======================================================

async function handleLogout() {
  try {
    await logout();

    window.location.replace("./index.html");
  } catch (error) {
    alert(error.message);
  }
}

// =======================================================
// SECTION 2: INITIALIZATION
// =======================================================

document.addEventListener("DOMContentLoaded", async () => {
  const user = await checkAuthentication();

  if (!user) {
    return;
  }

  const logoutButton = document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }
});
// =======================================================
// SECTION 1: AUTHENTICATION CHECK
// =======================================================

async function checkAuthentication() {
  try {
    const user = await getCurrentUser();

    return user;
  } catch (error) {
    window.location.replace("./index.html");

    return null;
  }
}
/*
==================================================

AI Contract Reviewer

File:
dashboard.js

Responsibility:
Dashboard UI Logic

Author:
OpenAI + Parth

==================================================
*/

/*
==================================================
CONFIGURATION
==================================================
*/

const LOGIN_PAGE = "./index.html";

/*
==================================================
DOM ELEMENTS
==================================================
*/

/*
==================================================
AUTHENTICATION CHECK
==================================================
*/

async function checkAuthentication() {
  try {
    console.log("Checking dashboard authentication...");

    const user = await getCurrentUser();

    console.log("Current user:", user);

    return user;
  } catch (error) {
    console.error("Authentication failed:", error);

    window.location.replace(LOGIN_PAGE);

    return null;
  }
}

/*
==================================================
LOAD USER INFORMATION
==================================================
*/

function renderUser(user) {
  if (!user) {
    return;
  }

  if (dashboardElements.username) {
    dashboardElements.username.textContent = user.username;
  }
}

/*
==================================================
DASHBOARD INITIALIZATION
==================================================
*/

async function initializeDashboard() {
  const user = await checkAuthentication();

  if (!user) {
    return;
  }

  renderUser(user);

  await loadContracts();

  console.log("Dashboard initialized");
}

/*
==================================================
APPLICATION START
==================================================
*/

document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard();
});
/*
==================================================
CONTRACT DATA
==================================================
*/

async function loadContracts() {
  try {
    const contracts = await getContracts();

    console.log("Contracts:", contracts);

    renderStatistics(contracts);

    renderContractsTable(contracts);
  } catch (error) {
    console.error("Failed loading contracts:", error);
  }
}
/*
==================================================
STATISTICS
==================================================
*/

function renderStatistics(contracts) {
  const total = contracts.length;

  const completed = contracts.filter(
    (contract) => contract.status === "completed",
  ).length;

  const processing = contracts.filter(
    (contract) => contract.status === "processing",
  ).length;

  const risk = contracts.filter(
    (contract) => contract.risk_score && contract.risk_score > 70,
  ).length;

  if (dashboardElements.totalContracts) {
    dashboardElements.totalContracts.textContent = total;
  }

  if (dashboardElements.completedReviews) {
    dashboardElements.completedReviews.textContent = completed;
  }

  if (dashboardElements.processingContracts) {
    dashboardElements.processingContracts.textContent = processing;
  }

  if (dashboardElements.riskAlerts) {
    dashboardElements.riskAlerts.textContent = risk;
  }
}
/*
==================================================
CONTRACT TABLE
==================================================
*/

function renderContractsTable(contracts) {
  const table = dashboardElements.contractTable;

  if (!table) {
    return;
  }

  table.innerHTML = "";

  if (!contracts.length) {
    table.innerHTML = `

        <tr>

            <td colspan="5">

                No contracts uploaded yet

            </td>

        </tr>

        `;

    return;
  }

  contracts.forEach((contract) => {
    const row = document.createElement("tr");

    row.innerHTML = `


            <td>

                ${contract.original_filename}

            </td>



            <td>

                ${getStatusBadge(contract.status)}

            </td>



            <td>

                ${contract.risk_score ?? "N/A"}

            </td>



            <td>

                ${new Date(contract.created_at).toLocaleDateString()}

            </td>



            <td>

                <button class="view-btn">

                    View

                </button>

            </td>


        `;

    table.appendChild(row);
  });
}
/*
==================================================
STATUS BADGE
==================================================
*/

function getStatusBadge(status) {
  const normalized = status.toLowerCase();

  return `
        <span class="status-badge status-${normalized}">
            ${status}
        </span>
    `;
}
