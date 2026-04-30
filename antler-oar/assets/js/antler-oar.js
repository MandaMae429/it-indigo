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

