const pricePerCanoe = 67;
const taxRate = 0.095;

const quantitySelect = document.getElementById("quantity");
const totalOutput = document.getElementById("total");
const canoeBox = document.getElementById("canoe-result");

quantitySelect.addEventListener("change", () => {
  const qty = parseInt(quantitySelect.value);

  if (!qty) {
    canoeBox.classList.remove("active");
    totalOutput.textContent = "$0.00";
    return;
  }

  const total = qty * pricePerCanoe * (1 + taxRate);
  totalOutput.textContent = `$${total.toFixed(2)}`;
  canoeBox.classList.add("active");
});

const RiverMap = (() => {

  const floatData = {
    "Steel Creek": { miles: 2.7, price: 21 },
    "Kyles": { miles: 10.7, price: 40 },
    "Pruitt": { miles: 23.9, price: 55 },
    "Ozark": { miles: 29.9, price: 61 },
    "Erbie": { miles: 34.9, price: 92 },
    "Hasty": { miles: 50.3, price: 55 },
    "Carver": { miles: 56.3, price: 65 }
  };

  let riverEl, resultEl, selectEl, currentSelection = "";

  const INSET = 6;

  const labels = Object.keys(floatData);
  const labelCount = labels.length;

  function init({ riverId, resultId, selectId }) {
    riverEl = document.getElementById(riverId);
    resultEl = document.getElementById(resultId);
    selectEl = document.getElementById(selectId);

    selectEl.addEventListener("change", e => setSelection(e.target.value));

    renderBase();
    window.addEventListener("resize", renderBase);
  }

  // EVEN spacing across full width (this is the key change)
  function position(index, total) {
    const usable = 100 - (INSET * 2);
    return INSET + (index / (total - 1)) * usable;
  }

  function renderBase() {
    riverEl.innerHTML = "";

    // =====================
    // TICKS (even spacing)
    // =====================
    const tickCount = 7;

    for (let i = 0; i < tickCount; i++) {
      const tick = document.createElement("div");
      tick.className = "river-tick";

      tick.style.left = `${position(i, tickCount)}%`;
      tick.innerHTML = `<span>${i * 10}</span>`; // visual scale only

      riverEl.appendChild(tick);
    }

    // =====================
    // LABELS (even spacing)
    // =====================
    labels.forEach((name, i) => {
      const label = document.createElement("div");
      label.className = "river-label";

      label.style.left = `${position(i, labelCount)}%`;
      label.innerHTML = `<small>${name}</small>`;

      riverEl.appendChild(label);
    });
  }

  function setSelection(value) {
    currentSelection = value;
    renderSelection();
  }

function renderSelection() {
  riverEl.querySelector(".river-dot")?.remove();

  if (!currentSelection) {
    resultEl.classList.remove("active");
    resultEl.innerHTML = "";
    return;
  }

  const labelsIndex = labels.indexOf(currentSelection);

  const percent = position(labelsIndex, labelCount);
  const trip = floatData[currentSelection];
  const hours = (trip.miles / 2).toFixed(1);

  const dot = document.createElement("div");
  dot.className = "river-dot";
  dot.style.left = `${percent}%`;
  dot.innerHTML = `<div class="circle"></div>`;
  riverEl.appendChild(dot);

  resultEl.innerHTML = `
    <h3>Ponca → ${currentSelection}</h3>
    <p><strong>Float Miles:</strong> ${trip.miles}</p>
    <div class="route-bar">
      <div class="route-fill" style="width:${percent}%"></div>
    </div>
    <p>Approx. Float Time: ${hours} hours</p>
    <p><strong>Cost:</strong> <span class="price">$${trip.price}</span></p>
  `;

  resultEl.classList.add("active");
}

  return { init };
})();

RiverMap.init({
  riverId: "river",
  resultId: "result",
  selectId: "end"
});

