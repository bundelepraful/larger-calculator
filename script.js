let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(value);
}

function updateDashboard() {
    const totalGiven = transactions
        .filter(t => t.type === "Given")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalTaken = transactions
        .filter(t => t.type === "Taken")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const netBalance = totalGiven - totalTaken;

    document.getElementById("totalGiven").textContent =
        formatCurrency(totalGiven);

    document.getElementById("totalTaken").textContent =
        formatCurrency(totalTaken);

    document.getElementById("netBalance").textContent =
        formatCurrency(netBalance);
}

document.getElementById("ledgerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("personName").value.trim();
    const type = document.getElementById("transactionType").value;
    const amount = document.getElementById("transactionAmount").value;
    const date = document.getElementById("transactionDate").value;

    if (!name || !amount || !date) return;

    transactions.push({
        id: Date.now(),
        name,
        type,
        amount,
        date
    });

    saveData();
    renderLedger();
    updateDashboard();

    this.reset();
});

function renderLedger() {
    const tbody = document.getElementById("ledgerTableBody");
    tbody.innerHTML = "";

    const summary = {};

    transactions.forEach(t => {
        if (!summary[t.name]) {
            summary[t.name] = {
                given: 0,
                taken: 0
            };
        }

        if (t.type === "Given") {
            summary[t.name].given += Number(t.amount);
        } else {
            summary[t.name].taken += Number(t.amount);
        }
    });

    const names = Object.keys(summary);

    if (names.length === 0) {
        tbody.innerHTML =
            `<tr><td colspan="4">No Records Found</td></tr>`;
        return;
    }

    names.forEach(name => {

        const given = summary[name].given;
        const taken = summary[name].taken;
        const balance = given - taken;

        let cls = "zero";

        if (balance > 0) cls = "positive";
        if (balance < 0) cls = "negative";

        tbody.innerHTML += `
        <tr>
            <td>
                <button class="person-btn"
                    onclick="openHistory('${name}')">
                    ${name}
                </button>
            </td>
            <td>${formatCurrency(given)}</td>
            <td>${formatCurrency(taken)}</td>
            <td class="${cls}">
                ${formatCurrency(balance)}
            </td>
        </tr>
        `;
    });
}

function openHistory(name) {

    document.getElementById("historyModal").style.display = "flex";

    document.getElementById("historyTitle").textContent =
        `${name} Transaction History`;

    const tbody =
        document.getElementById("historyTableBody");

    tbody.innerHTML = "";

    const records = transactions.filter(
        t => t.name === name
    );

    records.forEach(record => {

        tbody.innerHTML += `
        <tr>
            <td>${record.date}</td>
            <td>${record.type}</td>
            <td>${formatCurrency(record.amount)}</td>
            <td>
                <button class="delete-btn"
                    onclick="deleteTransaction(${record.id},'${name}')">
                    Delete
                </button>
            </td>
        </tr>
        `;
    });
}

function deleteTransaction(id, name) {

    if (!confirm("Delete Transaction?")) return;

    transactions = transactions.filter(
        t => t.id !== id
    );

    saveData();
    renderLedger();
    updateDashboard();
    openHistory(name);
}

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("historyModal").style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target.id === "historyModal") {
        document.getElementById("historyModal").style.display = "none";
    }
});

renderLedger();
updateDashboard();