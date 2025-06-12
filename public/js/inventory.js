"use Strict";
//Get list of vehicles in the inventory based on the Classification_id

let classificationList = document.querySelector("#classification_id");
classificationList.addEventListener("change", function () {
  let Classification_id = classificationList.value;
  console.log(`classificationId is: ${Classification_id}`);
  let classIdURL = "/inv/getInventory/" + Classification_id;
  fetch(classIdURL)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw Error("Network response was not OK");
    })
    .then(function (data) {
      console.log(data);
      buildInventoryList(data);
    })
    .catch(function (error) {
      console.log("JSON fetch error:".error.message);
      throw Error("Fetch of JSON data failed.");
    });
});

//Building inventory items into the HTML Table
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");
  //The table
  let dataTable = "<thead>";
  dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>";
  dataTable += "</thead>";
  //the table's body
  dataTable += "<tbody>";
  //loop over all the vehicles
  data.forEach(function (element) {
    console.log(element.inv_id + "", "" + element.inv_model);
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
    dataTable += `<td><a href = "/inv/edit/${element.inv_id}" title = "Click to Update">
        Modify</a></td>`;
    dataTable += `<td><a href = "/inv/delete/${element.inv_id}" title = "Click to Delete">
        Delete</a></td></tr>`;
  });
  dataTable += "</tbody>";

  //Display the contents in the Inventory Managemnet view
  inventoryDisplay.innerHTML = dataTable;
}
