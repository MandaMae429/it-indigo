$(document).ready(function() {
    // Initialize validation for the form
    $("#CircleForm").validate({
        
    });

    // Calculate button click event
    $("#btnSubmitCalculate").on("click", function() {
        if ($("#CircleForm").valid()) {
            const radius = parseFloat($("#radius").val());
            const diameter = calcDiameter(radius);
            const circumference = calcCircumference(radius);
            const area = calcArea(radius);
            
            // Display results
            $("#diameter").text(diameter.toFixed(2));
            $("#circumference").text(circumference.toFixed(2));
            $("#area").text(area.toFixed(2));
        }
    });

    // Clear button click event
    $("#btnSubmitClear").on("click", function() {
        clearForm();
    });

    // Function to calculate diameter
    function calcDiameter(radius) {
        return radius * 2;
    }

    // Function to calculate circumference
    function calcCircumference(radius) {
        return 2 * Math.PI * radius;
    }

    // Function to calculate area
    function calcArea(radius) {
        return Math.PI * Math.pow(radius, 2);
    }

    // Function to clear the form
    function clearForm() {
        $("#radius").val('');
        $("#diameter").text('');
        $("#circumference").text('');
        $("#area").text('');
        $("#CircleForm").validate().resetForm(); // Reset validation
    }
});