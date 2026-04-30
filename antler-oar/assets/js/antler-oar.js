// Carousel function
$(document).ready(function() {

    $('.fade').slick({
      dots: false,
      infinite: true,
      speed: 500,
      fade: true,
      slide: 'div',
      cssEase: 'linear',
      autoplay: true,
      autoplaySpeed: 2000,
      arrows: false,
      mobileFirst: true,
      useAutoplayToggleButton: false
    });


});

// River Gage function
async function getHeight(){
    "use strict";

    // Get a reference to the form - Use the ID of the form
    let form = $("#myform");

    // If all of the form elements are valid, the get the form values
    if (form.valid()){

        // URL for call
        
        let url = "https://api.waterdata.usgs.gov/ogcapi/v0/collections/continuous/items?f=json&lang=en-US&limit=10000&properties=monitoring_location_id,parameter_code,statistic_id,time,value,unit_of_measure&skipGeometry=true&offset=0&monitoring_location_id=USGS-07055660%2C%20USGS-07055646%2C%20USGS-07055680&parameter_code=00065&time=P7D"

        // Make call
        let msgObject = await fetch(url);

        let msgJSONText = await msgObject.text();
        // Parse JSON string into object
        let msg = JSON.parse(msgJSONText);

        /* Site 1 */
        /* Information about the PID */
        var sitename = "Ponca"
        var sitecode = "USGS-07055660"
        var siteDescription = "Ponca Bridge"

        /* Holds the dates and values to be graphed */
        var dates = [];
        var values = [];

        /* fLen contains the length of the array (number of values) */
        var fLen = msg.features.length

        // Populate Dates and Values
        for (let i = 0; i < fLen; i++) {
            if (msg.features[i].properties.monitoring_location_id == sitecode) {
                if (msg.features[i].properties.value != 0){
                    values[i] = msg.features[i].properties.value;
                }
                // Convert date to unix milliseconds
                let unixmillsec = Date.parse(msg.features[i].properties.time);
                // Create temporary date variable 
                let tmpdate = new Date(unixmillsec);
                // Extract the date/time string for a more friendly format
                dates[i] = tmpdate.toLocaleString();
            }
        }

        /* Site 2 */
        /* Information about the PID */
        var sitename2 = "Boxley"
        var sitecode2 = "USGS-07055646"
        var siteDescription = "Near Boxley"

        /* Holds the dates and values to be graphed */
        var dates2 = [];
        var values2 = [];
        let j = 0;

        // Populate Dates and Values
        for (let  i = 0; i < fLen; i++) {
            if (msg.features[i].properties.monitoring_location_id == sitecode2) {
                if (msg.features[i].properties.value != 0){
                    values2[j] = msg.features[i].properties.value;
                }
                // Convert date to unix milliseconds
                let unixmillsec2 = Date.parse(msg.features[i].properties.time);
                // Create temporary date variable 
                let tmpdate2 = new Date(unixmillsec2);
                // Extract the date/time string for a more friendly format
                dates2[i] = tmpdate2.toLocaleString();
                j++;
            }
        }

        /* Site 3 */
        /* Information about the PID */
        var sitename3 = "Pruitt"
        var sitecode3 = "USGS-07055680"
        var siteDescription = "Pruitt"

        /* Holds the dates and values to be graphed */
        var dates3 = [];
        var values3 = [];
        let k = 0;

        // Populate Dates and Values
        for (let i = 0; i < fLen; i++) {
            if (msg.features[i].properties.monitoring_location_id == sitecode3) {
                if (msg.features[k].properties.value != 0){
                    values3[k] = msg.features[i].properties.value;
                }
                // Convert date to unix milliseconds
                let unixmillsec3 = Date.parse(msg.features[i].properties.time);
                // Create temporary date variable 
                let tmpdate3 = new Date(unixmillsec3);
                // Extract the date/time string for a more friendly format
                dates3[i] = tmpdate3.toLocaleString();
                k++;
            }
        }

        // Create chart showing data from 3 locations
        var ctx = document.getElementById("chartjs-0");
        var myChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: dates, dates2, dates3,
                datasets: [
                {   label: sitename,
                    data: values,
                    fill: false,
                    borderColor:"#6E7349",
                    pointRadius:0,
                    pointBackgroundColor:"#fff",
                    lineTension:0.5
                },
                {   label: sitename3,
                    data: values3,
                    fill: false,
                    borderColor:"#8EB6BF",
                    pointRadius:0,
                    pointBackgroundColor:"#fff",
                    lineTension:1
                },
                {   label: sitename2,
                    data: values2,
                    fill: false,
                    borderColor:"#D93D1A",
                    pointRadius:0,
                    pointBackgroundColor:"#fff",
                    lineTension:2
                }]},
            options:{ 
                responsive: false,
                maintainAspectRatio: true,
                title: {
                    display: true,
                    text: 'Buffalo River Water Levels'
                },
                scales: {
                    xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Time/Date'
                    }
                    }],
                    yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'River Height'
                    }
                    }]
                }
            },
        });
    }
};

// Clear graph function
function clearform(){
    "use strict;"

    // Clear the canvas
    let canvas0 = document.getElementById("chartjs-0");
    let context0 = canvas0.getContext('2d');    
    context0.clearRect(0, 0, canvas0.width, canvas0.height);
};

// Clear contact form function
function clearForm() {
    
    /* Form Validation */
    $( "#myform" ).validate({
    
    });
    /* Set all of the form values to blank or false */
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("firstNameError").innerHTML = "";
    document.getElementById("lastNameError").innerHTML = "";
    document.getElementById("email").value = "";
    document.getElementById("telNumber").value = "";
    document.getElementById("message").value = "";
    document.getElementById("emailError").innerHTML = "";
    document.getElementById("messageError").innerHTML = "";

    document.getElementById("detail").innerHTML = "<h3>Thank you for contacting us! Please allow 48 hours for a response.</h3>";
}

/*---------CABIN-----------*/

"use strict";

/* =========================
   CABIN CALCULATOR
========================= */

const TAX_RATE = 1.095;

function setupCalculator(config) {
  const select = document.getElementById(config.selectId);
  const output = document.getElementById(config.outputId);
  const box = document.getElementById(config.boxId);

  if (!select || !output || !box) return;

  select.addEventListener("change", () => {
    const value = parseInt(select.value);

    if (!value) {
      box.classList.remove("active");
      output.textContent = "$0.00";
      return;
    }

    const total = config.calculate(value);
    output.textContent = $${total.toFixed(2)};
    box.classList.add("active");
  });
}

setupCalculator({
  selectId: "days",
  outputId: "cabin-total",
  boxId: "cabin-result",
  calculate: (days) => {
    const base = (days === 7) ? 1195 : days * 195;
    return base * TAX_RATE;
  }
});


/* =========================
   CAROUSEL STATE
========================= */

const track = document.getElementById("carouselTrack");
const images = document.querySelectorAll(".carousel-image");
const dots = document.querySelectorAll(".dot");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

let index = 0;
const total = images.length;

if (!track || images.length === 0) {
  console.warn("Carousel not found or no images.");
}


/* =========================
   GO TO SLIDE
========================= */

function goToSlide(i) {
  index = (i + total) % total;

  const slideWidth = track.clientWidth; 
  // IMPORTANT: avoids offset bugs from image width + gaps

  track.scrollTo({
    left: slideWidth * index,
    behavior: "smooth"
  });

  updateDots();
}


/* =========================
   DOT UPDATE
========================= */

function updateDots() {
  dots.forEach(d => d.classList.remove("active"));
  if (dots[index]) dots[index].classList.add("active");
}


/* =========================
   AUTOPLAY (SAFE)
========================= */

let autoplay = setInterval(() => {
  goToSlide(index + 1);
}, 4000);


/* =========================
   PAUSE ON INTERACTION
========================= */

track.addEventListener("mouseenter", () => clearInterval(autoplay));
track.addEventListener("mouseleave", () => {
  autoplay = setInterval(() => goToSlide(index + 1), 4000);
});


/* =========================
   DOT NAVIGATION
========================= */

dots.forEach(dot => {
  dot.addEventListener("click", () => {
    const i = parseInt(dot.dataset.index);
    goToSlide(i);
  });
});


/* =========================
   MANUAL SCROLL SYNC
========================= */

track.addEventListener("scroll", () => {
  const slideWidth = track.clientWidth;
  const newIndex = Math.round(track.scrollLeft / slideWidth);

  if (newIndex !== index && newIndex < total) {
    index = newIndex;
    updateDots();
  }
});


/* =========================
   LIGHTBOX (FIXED)
========================= */

images.forEach(img => {
  img.addEventListener("click", () => {
    if (!lightbox || !lightboxImg) return;

    lightbox.classList.add("active");
    lightboxImg.src = img.src;
  });
});

if (lightbox) {
  lightbox.addEventListener("click", () => {
    lightbox.classList.remove("active");
  });
}

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
  totalOutput.textContent = $${total.toFixed(2)};
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

      tick.style.left = ${position(i, tickCount)}%;
      tick.innerHTML = <span>${i * 10}</span>; // visual scale only

      riverEl.appendChild(tick);
    }

    // =====================
    // LABELS (even spacing)
    // =====================
    labels.forEach((name, i) => {
      const label = document.createElement("div");
      label.className = "river-label";

      label.style.left = ${position(i, labelCount)}%;
      label.innerHTML = <small>${name}</small>;

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
  dot.style.left = ${percent}%;
  dot.innerHTML = <div class="circle"></div>;
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