// script.js - Client-side JavaScript for the inventory management system

document.addEventListener("DOMContentLoaded", function () {
  // Add Classification Form Handler
  const form = document.getElementById("add-classification-form");
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const classificationInput = document.getElementById("classificationName");
      const classificationName = classificationInput.value.trim();
      const pattern = /^[a-zA-Z0-9]+$/;

      // Find or create error container
      let errorContainer = document.getElementById("formErrors");
      if (!errorContainer) {
        errorContainer = document.createElement("div");
        errorContainer.id = "formErrors";
        form.parentNode.insertBefore(errorContainer, form);
      }
      errorContainer.innerHTML = "";

      // Validate input
      if (!pattern.test(classificationName)) {
        errorContainer.innerHTML =
          "<p>Classification name must not contain spaces or special characters.</p>";
        return;
      }

      // Submit form via AJAX
      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ classificationName }),
        });

        const data = await response.json();

        if (data.success) {
          // Update navigation bar
          const navContainer = document.getElementById("navContainer");
          if (navContainer) {
            navContainer.innerHTML = data.nav;
          }
          alert(data.message);

          // Clear the form input
          classificationInput.value = "";
        } else {
          errorContainer.innerHTML = `<p>${data.message}</p>`;
        }
      } catch (error) {
        errorContainer.innerHTML = `<p>Error submitting form: ${error.message}</p>`;
      }
    });
  }
});
