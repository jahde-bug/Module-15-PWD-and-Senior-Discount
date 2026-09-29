// ==========================================
// Module 15: PWDs, Senior Citizen Discount
// Procedural JavaScript. Arrays use array[index], for/while loops,
// if/else and console.log() only.
// ==========================================

// ------------------------------------------
// 1. Catalog (parallel arrays: same index = same product)
// ------------------------------------------
var catName = ["Running Shoe", "Jacket", "Crocs", "T-Shirt", "Bag"];
var catCategory = ["Shoes", "Jackets", "Crocs", "T-Shirts", "Bags"];
var catPrice = [1900, 1200, 1500, 800, 1100];
var CAT_SIZE = 5;

// Categories that get the 10% discount
var Eligible_Categories_Set = ["Bags", "Jackets", "T-Shirts", "Crocs"];
var ELIGIBLE_SIZE = 4;

// ------------------------------------------
// 2. Cart: stores catalog indexes, tracked with a manual counter
// ------------------------------------------
var cartItem = [];
var cartCount = 0;

// Start with a Jacket and Crocs in the cart
cartItem[0] = 1;
cartItem[1] = 2;
cartCount = 2;

// PWD / Senior toggle
var on = true;

// ------------------------------------------
// 3. Helper functions
// ------------------------------------------
function el(id) {
  return document.getElementById(id);
}

// Format a whole number as pesos, e.g. 2430 -> "₱2,430"
function peso(n) {
  var sign = "";
  if (n < 0) {
    sign = "-";
    n = 0 - n;
  }
  var digits = "" + n;
  var len = digits.length;
  var out = "";
  for (var i = 0; i < len; i++) {
    out = out + digits[i];
    var left = len - 1 - i;
    if (left > 0 && left % 3 === 0) {
      out = out + ",";
    }
  }
  return sign + "₱" + out;
}

function isEligible(category) {
  for (var i = 0; i < ELIGIBLE_SIZE; i++) {
    if (Eligible_Categories_Set[i] === category) {
      return true;
    }
  }
  return false;
}

function countInCart(catalogIndex) {
  var qty = 0;
  for (var i = 0; i < cartCount; i++) {
    if (cartItem[i] === catalogIndex) {
      qty = qty + 1;
    }
  }
  return qty;
}

function addToCart(catalogIndex) {
  cartItem[cartCount] = catalogIndex;
  cartCount = cartCount + 1;
}

// Removes the last matching item, then moves the items after it one step left
function removeFromCart(catalogIndex) {
  var found = -1;
  var i = cartCount - 1;
  while (i >= 0 && found === -1) {
    if (cartItem[i] === catalogIndex) {
      found = i;
    }
    i = i - 1;
  }

  if (found === -1) {
    return;
  }

  for (var j = found; j < cartCount - 1; j++) {
    cartItem[j] = cartItem[j + 1];
  }
  cartCount = cartCount - 1;
  cartItem[cartCount] = -1;
}

function stepItem(text, active) {
  if (active) {
    return "<li>" + text + "</li>";
  } else {
    return '<li class="off">' + text + "</li>";
  }
}

function receiptRow(label, value, extraClass) {
  return '<div class="r ' + extraClass + '"><span>' + label + "</span><span>" + value + "</span></div>";
}

// ------------------------------------------
// 4. Render
// ------------------------------------------
function render() {
  // Catalog list
  var catalogHTML = "";
  for (var c = 0; c < CAT_SIZE; c++) {
    var eligible = isEligible(catCategory[c]);
    var pillClass = "pill n";
    var pillText = "no discount";
    if (eligible) {
      pillClass = "pill";
      pillText = "10% eligible";
    }

    catalogHTML = catalogHTML +
      '<div class="it"><div>' +
      "<b>" + catName[c] + '</b> <span class="' + pillClass + '">' + pillText + "</span>" +
      "<small>" + catCategory[c] + " · " + peso(catPrice[c]) + " · in cart: " + countInCart(c) + "</small>" +
      "</div><span>" +
      '<button data-add="' + c + '">Add</button> ' +
      '<button data-rm="' + c + '" style="background:var(--card);color:var(--ink);border:1.5px solid var(--ink)">−</button>' +
      "</span></div>";
  }
  el("catalog").innerHTML = catalogHTML;

  // Empty cart note
  if (cartCount === 0) {
    el("empty").textContent = "Cart is empty. Add items above.";
  } else {
    el("empty").textContent = "";
  }

  // Toggle state
  if (on) {
    el("pwd").setAttribute("aria-checked", "true");
  } else {
    el("pwd").setAttribute("aria-checked", "false");
  }

  // Subtotal
  var subtotal = 0;
  for (var s = 0; s < cartCount; s++) {
    subtotal = subtotal + catPrice[cartItem[s]];
  }

  // Discount: only runs when the toggle is ON (10% = price / 10)
  var lineName = [];
  var lineOff = [];
  var lineCount = 0;
  var checked = 0;
  var totalDiscount = 0;

  if (on) {
    for (var k = 0; k < cartCount; k++) {
      checked = checked + 1;
      var idx = cartItem[k];
      if (isEligible(catCategory[idx])) {
        lineName[lineCount] = catName[idx];
        lineOff[lineCount] = catPrice[idx] / 10;
        totalDiscount = totalDiscount + lineOff[lineCount];
        lineCount = lineCount + 1;
      }
    }
  }

  var updatedTotal = subtotal - totalDiscount;

  // Process steps
  var toggleText = "OFF, skip calculation";
  var loopText = "";
  var recalcText = "";
  if (on) {
    toggleText = "ON";
    loopText = ": " + lineCount + " of " + checked + " match";
    recalcText = ": " + peso(updatedTotal);
  }

  el("steps").innerHTML =
    stepItem("1. Read toggle state: <b>" + toggleText + "</b>", true) +
    stepItem("2. Loop items, check item.category in Eligible_Categories_Set" + loopText, on) +
    stepItem("3. Apply flat 10% only to matching items; shoe prices unchanged", on) +
    stepItem("4. Recalculate cart total" + recalcText, on);

  // Receipt
  var receipt = "";
  if (cartCount === 0) {
    receipt = receiptRow("(no items)", "", "");
  } else {
    for (var r = 0; r < cartCount; r++) {
      receipt = receipt + receiptRow(catName[cartItem[r]], peso(catPrice[cartItem[r]]), "");
    }
  }
  receipt = receipt + "<hr>" + receiptRow("Subtotal", peso(subtotal), "");

  if (on) {
    receipt = receipt +
      "<hr>" +
      "<div>[POS DISPLAY] PWDs and Senior Citizen ID verified physically by the cashier.</div>" +
      "<div>[PWDs and Senior Citizen Discount APPLIED]</div>";

    if (lineCount > 0) {
      for (var d = 0; d < lineCount; d++) {
        receipt = receipt + receiptRow("- " + lineName[d] + " (10% off):", "-" + peso(lineOff[d]), "d");
      }
      receipt = receipt + receiptRow("Total Discount Applied:", "-" + peso(totalDiscount), "d");
    } else {
      receipt = receipt + "<div>No eligible items in cart.</div>";
    }
  }

  var totalLabel = "Order Total:";
  if (on) {
    totalLabel = "Updated Order Total:";
  }
  receipt = receipt + "<hr>" + receiptRow(totalLabel, peso(updatedTotal), "t");

  el("rcpt").innerHTML = receipt;

  console.log(totalLabel + " " + peso(updatedTotal) + " | Discount: " + peso(totalDiscount));
}

// ------------------------------------------
// 5. Events and first render
// ------------------------------------------
document.onclick = function (e) {
  var t = e.target;
  var addAttr = t.getAttribute("data-add");
  var rmAttr = t.getAttribute("data-rm");

  if (addAttr !== null) {
    addToCart(Number(addAttr));
  } else if (rmAttr !== null) {
    removeFromCart(Number(rmAttr));
  } else if (t.id === "pwd") {
    if (on) {
      on = false;
    } else {
      on = true;
    }
  } else {
    return;
  }

  render();
};

render();
