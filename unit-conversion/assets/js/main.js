/**
 * Unit Converter (AJAX) — main.js
 * Validates inputs and calls the conversion API via AJAX (fetch).
 */
 
(function () {
  'use strict';
 
  /* ── Helpers ──────────────────────────────────────────── */
 
  function showError(el, msg) {
    el.textContent = msg;
    el.classList.add('visible');
  }
 
  function clearError(el) {
    el.textContent = '';
    el.classList.remove('visible');
  }
 
  /* ── Validate ─────────────────────────────────────────── */
 
  function validate() {
    let valid = true;
 
    const fromValueInput = document.getElementById('from-value');
    const fromValueError = document.getElementById('from-value-error');
    const fromUnitError  = document.getElementById('from-unit-error');
    const toUnitError    = document.getElementById('to-unit-error');
 
    // Clear previous errors
    clearError(fromValueError);
    clearError(fromUnitError);
    clearError(toUnitError);
    fromValueInput.style.outlineColor = '';
 
    // From Value: required and numeric
    const rawValue = fromValueInput.value.trim();
    if (rawValue === '') {
      showError(fromValueError, 'Value is Required');
      fromValueInput.style.outline = '1px solid #cc0000';
      valid = false;
    } else if (isNaN(Number(rawValue))) {
      showError(fromValueError, 'Value must be numeric');
      fromValueInput.style.outline = '1px solid #cc0000';
      valid = false;
    }
 
    // From Unit: required
    const fromUnit = document.querySelector('input[name="FromUnit"]:checked');
    if (!fromUnit) {
      showError(fromUnitError, 'From Unit is Required');
      valid = false;
    }
 
    // To Unit: required
    const toUnit = document.querySelector('input[name="ToUnit"]:checked');
    if (!toUnit) {
      showError(toUnitError, 'To Unit is Required');
      valid = false;
    }
 
    return valid;
  }
 
  /* ── AJAX call ────────────────────────────────────────── */
 
  function doConvert() {
    if (!validate()) return;
 
    const fromValue = document.getElementById('from-value').value.trim();
    const fromUnit  = document.querySelector('input[name="FromUnit"]:checked').value;
    const toUnit    = document.querySelector('input[name="ToUnit"]:checked').value;
    const apiError  = document.getElementById('api-error');
    const toValueDisplay = document.getElementById('to-value-display');
 
    clearError(apiError);
    toValueDisplay.textContent = 'Calculating…';
 
    const url = `https://brucebauer.info/assets/ITEC3650/unitsconversion.php` +
                `?FromValue=${encodeURIComponent(fromValue)}` +
                `&FromUnit=${encodeURIComponent(fromUnit)}` +
                `&ToUnit=${encodeURIComponent(toUnit)}`;
 
    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Server returned ' + response.status);
        }
        return response.text();
      })
      .then(function (data) {
        toValueDisplay.textContent = data.trim();
      })
      .catch(function (err) {
        toValueDisplay.textContent = '';
        apiError.textContent = 'Error contacting the conversion service: ' + err.message;
        apiError.classList.add('visible');
      });
  }
 
  /* ── Clear ────────────────────────────────────────────── */
 
  function doClear() {
    // Clear text input
    document.getElementById('from-value').value = '';
    document.getElementById('from-value').style.outline = '';
 
    // Uncheck all radios
    document.querySelectorAll('input[type="radio"]').forEach(function (r) {
      r.checked = false;
    });
 
    // Clear all errors
    document.querySelectorAll('.error-msg').forEach(function (el) {
      el.textContent = '';
      el.classList.remove('visible');
    });
 
    // Clear result and API error
    document.getElementById('to-value-display').textContent = '';
    const apiError = document.getElementById('api-error');
    apiError.textContent = '';
    apiError.classList.remove('visible');
  }
 
  /* ── Event listeners ──────────────────────────────────── */
 
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-calculate').addEventListener('click', doConvert);
    document.getElementById('btn-clear').addEventListener('click', doClear);
 
    // Clear individual field error on input
    document.getElementById('from-value').addEventListener('input', function () {
      clearError(document.getElementById('from-value-error'));
      this.style.outline = '';
    });
 
    document.querySelectorAll('input[name="FromUnit"]').forEach(function (r) {
      r.addEventListener('change', function () {
        clearError(document.getElementById('from-unit-error'));
      });
    });
 
    document.querySelectorAll('input[name="ToUnit"]').forEach(function (r) {
      r.addEventListener('change', function () {
        clearError(document.getElementById('to-unit-error'));
      });
    });
  });
 
})();
 
