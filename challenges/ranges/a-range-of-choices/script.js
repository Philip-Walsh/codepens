const options = [
  {
    label: 'Noodles',
    choices: [
      ['ramen', 1.25],
      ['harusame', 1.25],
      ['udon', 1.25],
      ['shirataki', 1.7],
    ],
    multi: () => (Math.random() < 0.3 ? 2 : 1),
  },
  {
    label: 'Protein',
    choices: [
      ['chicken', 2.0],
      ['beef', 2.5],
      ['tofu', 1.75],
      ['shrimp', 3.0],
    ],
    multi: () => 1,
  },
  {
    label: 'Veggies',
    choices: [
      ['bok choy', 1.0],
      ['mushrooms', 1.25],
      ['bean sprouts', 0.75],
      ['carrots', 0.5],
    ],
    multi: () => Math.floor(Math.random() * 3),
  },
  {
    label: 'Soup/Broth',
    choices: [
      ['miso broth', 1.5],
      ['tonkotsu broth', 2.0],
      ['shoyu broth', 1.75],
      ['spicy miso', 2.25],
    ],
    multi: () => 1,
  },
  {
    label: 'Garnish',
    choices: [
      ['green onions', 0.5],
      ['sesame seeds', 0.5],
      ['seaweed', 1.0],
      ['soft-boiled egg', 1.5],
    ],
    multi: () => Math.floor(Math.random() * 3),
  },
];
let totalPrice = 0;
function getReactionEmoji(tipPercentage) {
  if (tipPercentage === 0) return '😕';
  if (tipPercentage <= 5) return '😐';
  if (tipPercentage <= 10) return '🙂';
  if (tipPercentage <= 15) return '😊';
  if (tipPercentage <= 20) return '😃';
  if (tipPercentage <= 40) return '🤩';
  if (tipPercentage <= 60) return '🥳';
  return '🤯';
}
function getRandomSelection(choices, maxSelections) {
  let numChoices = Math.min(Math.floor(Math.random() * maxSelections()) + 1, choices.length);
  return choices.sort(() => 0.5 - Math.random()).slice(0, numChoices);
}

function generateOrder(orderNum) {
  let orderHtml = `<div class='order'><h3>Order ${orderNum}</h3>`;
  let orderTotal = 0;

  options.forEach(category => {
    let selectedItems = getRandomSelection(category.choices, category.multi);
    if (selectedItems.length > 0) {
      orderHtml += `<div class='section'>${category.label}</div>`;
      selectedItems.forEach(([name, price]) => {
        orderTotal += price;
        orderHtml += `<div class='bill-item'><span>${name}</span> <span>$${price.toFixed(
          2
        )}</span></div>`;
      });
    }
  });

  orderHtml += '</div>';
  return { orderHtml, orderTotal };
}

function generateBill() {
  let billHtml = '';
  totalPrice = 0;
  let numOrders = Math.floor(Math.random() * 3) + 1;

  for (let i = 1; i <= numOrders; i++) {
    let { orderHtml, orderTotal } = generateOrder(i);
    billHtml += orderHtml;
    totalPrice += orderTotal;
  }

  $('#bill').html(billHtml);
  $('#total-price').text(`$${totalPrice.toFixed(2)}`);
  updateTip();
}

function updateTip() {
  let tipPercentage = parseInt($('#tip-slider').val(), 10);
  let tipAmount = (totalPrice * tipPercentage) / 100;
  let grandTotal = totalPrice + tipAmount;

  $('#tip-percentage').text(`${tipPercentage}%`);
  $('#tip-amount').text(`$${tipAmount.toFixed(2)}`);
  $('#grand-total').text(`$${grandTotal.toFixed(2)}`);
  $('#reaction').text(getReactionEmoji(tipPercentage));
  updateSplit();
}

function updateSplit() {
  let numPeople = parseInt($('#split-slider').val(), 10);
  let tipPercentage = parseInt($('#tip-slider').val(), 10);
  let tipAmount = (totalPrice * tipPercentage) / 100;
  let grandTotal = totalPrice + tipAmount;

  let splitAmount = grandTotal / numPeople;
  $('#split-number').text(numPeople);
  $('#split-amount').text(`$${splitAmount.toFixed(2)}`);
}

$(document).ready(() => {
  generateBill();

  $('#tip-slider').on('input', updateTip);
  $('#split-slider').on('input', updateSplit);

  animateSlidersAndScroll();
});

function animateSlidersAndScroll() {
  $('html, body').animate(
    {
      scrollTop: $(document).height() - $(window).height(),
    },
    1000,
    function () {
      let incrementInterval = 150;
      let tipSliderValue = $('#tip-slider').val();
      let splitSliderValue = $('#split-slider').val();

      let tipInterval = setInterval(() => {
        if (tipSliderValue < 20) {
          tipSliderValue++;
          $('#tip-slider').val(tipSliderValue).trigger('input');
        }
        if (tipSliderValue >= 20) {
          clearInterval(tipInterval);
        }
      }, incrementInterval);

      setTimeout(() => {
        let splitInterval = setInterval(() => {
          if (splitSliderValue < 10) {
            splitSliderValue++;
            $('#split-slider').val(splitSliderValue).trigger('input');
          }
          if (splitSliderValue >= 10) {
            clearInterval(splitInterval);
          }
        }, incrementInterval);
      }, 1500);

      setTimeout(() => {
        let decrementInterval = setInterval(() => {
          if (tipSliderValue > 15) {
            tipSliderValue--;
            $('#tip-slider').val(tipSliderValue).trigger('input');
          }
          if (splitSliderValue > 15) {
            splitSliderValue--;
            $('#split-slider').val(splitSliderValue).trigger('input');
          }
          if (tipSliderValue <= 15 && splitSliderValue <= 15) {
            clearInterval(decrementInterval);
            updateSplit();
          }
        }, incrementInterval);
      }, 2000);

      setTimeout(() => {
        $('html, body').animate(
          {
            scrollTop: 0,
          },
          1000,
          function () {
            $('#split-slider').val(1).trigger('input');
            updateSplit();
            $('#tip-slider').trigger('input');
            $('#split-slider').trigger('input');
          }
        );
      }, 2900);
    }
  );
}
