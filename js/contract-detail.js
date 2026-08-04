/*
==================================================

AI Contract Reviewer

File:
contract-detail.js

Responsibility:
Contract Detail Page Logic

==================================================
*/

const params = new URLSearchParams(window.location.search);

const contractId = params.get("id");

async function loadContractDetail() {
  try {
    const contract = await getContractById(contractId);

    document.getElementById("contract-title").textContent =
      contract.original_filename;

    document.getElementById("contract-status").textContent = contract.status;

    document.getElementById("contract-size").textContent = contract.file_size;

    document.getElementById("contract-date").textContent = new Date(
      contract.created_at,
    ).toLocaleDateString();
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", loadContractDetail);
