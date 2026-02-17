$(function () {
    // Attach jQuery Validation to the form
    var validator = $("#myform").validate({
        // Use data-* attributes for rules/messages already in the HTML
        errorPlacement: function (error, element) {
            // Put errors into the existing <label class="error"> placeholders
            var id = element.attr("id");
            if (id === "Operand1") {
                error.appendTo("#Operand1Error");
            } else if (id === "Operand3") {
                error.appendTo("#Operand2Error");
            } else if (element.attr("name") === "Operator") {
                error.appendTo("#OperatorError");
            } else {
                error.insertAfter(element);
            }
        }
    });

    // Clear function: clears inputs, radio buttons, errors, and result
    window.clearform = function () {
        // Clear values
        $("#Operand1").val("");
        $("#Operand2").val("");
        $("input[name='Operator']").prop("checked", false);

        // Clear result
        $("#Result").text("");

        // Clear validation messages and error styling
        validator.resetForm();      // removes plugin-generated error labels & classes [web:6]
        $(".error").empty();        // empty our custom error <label> contents
    };

    // Calculate function: validates, computes, and displays the result
    window.calculate = function () {
        // Run validation; stop if invalid
        if (!$("#myform").valid()) {
            $("#Result").text("");
            return false;
        }

        // Parse the two operands as floating point numbers
        let op1 = parseFloat($("#Operand1").val());
        let op2 = parseFloat($("#Operand2").val());

        // Extra numeric check (in case parseFloat fails)
        if (isNaN(op1) || isNaN(op2)) {
            $("#Result").text("Both operands must be numeric floating point.");
            return false;
        }

        // Determine which operator is selected
        let operator = $("input[name='Operator']:checked").val();
        let result;

        switch (operator) {
            case "Add":
                result = op1 + op2;
                break;
            case "Sub":
                result = op1 - op2;
                break;
            case "Mul":
                result = op1 * op2;
                break;
            case "Div":
                if (op2 === 0) {
                    $("#Result").text("Cannot divide by zero.");
                    return false;
                }
                result = op1 / op2;
                break;
            default:
                $("#Result").text("Please select an operator.");
                return false;
        }

        // Display the result (you can format/round if you like)
        $("#Result").text(result);
        return false;
    };
});