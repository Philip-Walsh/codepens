$(function () {
  // State management
  let state = {
    currentLanguage: 'en',
    showLabels: true,
    isGrillOn: false,
    menuData: null,
    speedMultiplier: 1,
    counters: {
      meat: 0,
      vegan: 0,
      seafood: 0,
      drinks: 0,
      sauces: 0
    },
    totalBill: {
      krw: 0,
      usd: 0
    },
    maxCollectionItems: 4,
    translations: {
      en: {
        ignite: 'Ignite Grill',
        extinguish: 'Extinguish',
        toggleLabels: 'Toggle Labels',
        switchLang: '한국어',
        sauces: 'Sauces',
        drinks: 'Drinks',
        orderHistory: 'Order History',
        sauceOrders: 'Sauce Orders',
        loading: 'Loading menu...',
        error: 'Error loading menu',
        collectionFull: 'Collection area is full!',
        pleaseCollect: 'Please collect items first',
        grillOff: 'Please ignite the grill first!',
        speedControl: 'Speed Control'
      },
      ko: {
        ignite: '불 붙이기',
        extinguish: '불 끄기',
        toggleLabels: '라벨 표시',
        switchLang: 'English',
        sauces: '소스',
        drinks: '음료',
        orderHistory: '주문 내역',
        sauceOrders: '소스 주문',
        loading: '메뉴 로딩 중...',
        error: '메뉴 로딩 오류',
        collectionFull: '수집 영역이 가득 찼습니다!',
        pleaseCollect: '먼저 아이템을 수집해주세요',
        grillOff: '먼저 불을 붙여주세요!',
        speedControl: '속도 조절'
      }
    }
  };

  // Load menu data
  async function loadMenuData() {
    try {
      const response = await fetch('menu.json');
      if (!response.ok) throw new Error('Failed to load menu data');
      state.menuData = await response.json();
      renderMenu(state.menuData);
      initGrillPanels();
      initDraggables();
      initCollectionAreas();
    } catch (error) {
      console.error('Error loading menu:', error);
      showNotification(state.translations[state.currentLanguage].error, 'error');
    }
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const $notification = $('<div>')
      .addClass('notification')
      .addClass(type)
      .text(message)
      .appendTo('body');

    setTimeout(() => {
      $notification.addClass('show');
    }, 100);

    setTimeout(() => {
      $notification.removeClass('show');
      setTimeout(() => $notification.remove(), 300);
    }, 3000);
  }

  // Render menu items
  function renderMenu() {
    const { meat, vegan, sides, sauces, drinks } = state.menuData;

    // Render meat items
    const $meatGrid = $('.meat-section .menu-items').empty();
    meat.forEach(item => createFoodItem(item, $meatGrid));

    // Render vegan items
    const $veganGrid = $('.vegan-section .menu-items').empty();
    vegan.forEach(item => createFoodItem(item, $veganGrid));

    // Render sides
    const $sidesGrid = $('.sides-section .menu-items').empty();
    sides.forEach(item => createFoodItem(item, $sidesGrid));

    // Render sauces
    const $saucesGrid = $('.sauces-section .menu-items').empty();
    sauces.forEach(item => createSauceItem(item, $saucesGrid));

    // Render drinks
    const $drinksGrid = $('.drinks-section .menu-items').empty();
    drinks.forEach(item => createDrinkItem(item, $drinksGrid));
  }

  // Create food item element
  function createFoodItem(item, container) {
    const $item = $(`
      <div class="food-item" 
           data-kr="${item.kr}" 
           data-en="${item.en}" 
           data-time="${item.time}" 
           data-category="${item.category}"
           data-price-krw="${item.price.krw}" 
           data-price-usd="${item.price.usd}">
        <div class="food-icon">${item.icon}</div>
        <div class="food-info">
          <span class="food-name">${item[state.currentLanguage]}</span>
          <span class="food-time">${formatTime(item.time)}</span>
          <span class="food-price">${formatPrice(item.price, state.currentLanguage)}</span>
        </div>
      </div>
    `);
    container.append($item);
  }

  // Create sauce item element
  function createSauceItem(item, container) {
    const $item = $(`
      <div class="sauce-item" 
           data-kr="${item.kr}" 
           data-en="${item.en}"
           data-category="sauces"
           data-price-krw="${item.price.krw}" 
           data-price-usd="${item.price.usd}">
        <div class="sauce-icon">${item.icon}</div>
        <span class="sauce-name">${item[state.currentLanguage]}</span>
        <span class="sauce-price">${formatPrice(item.price, state.currentLanguage)}</span>
      </div>
    `);
    container.append($item);
  }

  // Create drink item element
  function createDrinkItem(item, container) {
    const $item = $(`
      <div class="drink-item" 
           data-kr="${item.kr}" 
           data-en="${item.en}"
           data-category="drinks"
           data-price-krw="${item.price.krw}" 
           data-price-usd="${item.price.usd}">
        <div class="drink-icon">${item.icon}</div>
        <span class="drink-name">${item[state.currentLanguage]}</span>
        <span class="drink-price">${formatPrice(item.price, state.currentLanguage)}</span>
      </div>
    `);
    container.append($item);
  }

  // Format time in minutes:seconds
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Format price based on language
  function formatPrice(price, language) {
    if (price.krw === 0 && price.usd === 0) return '';
    return language === 'en' ?
      `$${price.usd}` :
      `${price.krw.toLocaleString()}원`;
  }

  // Initialize grill panels
  function initGrillPanels() {
    const $grill = $('.grill').empty();
    for (let i = 0; i < 9; i++) {
      const $panel = $('<div>')
        .addClass('panel')
        .attr('data-position', i + 1);

      // Add circular grill marks
      if (i % 2 === 0) {
        $panel.append('<div class="grill-mark"></div>');
      }

      $grill.append($panel);
    }
    initGrillDroppables();
  }

  // Initialize draggables for grill items only
  function initDraggables() {
    $('.meat-section .food-item, .vegan-section .food-item').draggable({
      helper: 'clone',
      appendTo: 'body',
      zIndex: 1000,
      start: function (event, ui) {
        $(this).addClass('dragging');
        ui.helper.css({
          'width': $(this).width(),
          'height': $(this).height(),
          'opacity': 0.9,
          'transform': 'scale(1.2)',
          'box-shadow': '0 4px 20px rgba(0, 0, 0, 0.3)'
        });
      },
      stop: function (event, ui) {
        $(this).removeClass('dragging');
        // Remove helper if not dropped on panel
        if (!$(ui.helper).closest('.panel').length) {
          $(ui.helper).remove();
        }
      }
    });
  }

  // Initialize droppables for grill
  function initGrillDroppables() {
    $('.panel').droppable({
      accept: '.food-item',
      drop: function (event, ui) {
        if (!state.isGrillOn) {
          showNotification(state.translations[state.currentLanguage].grillOff, 'error');
          return;
        }

        const $panel = $(this);
        if ($panel.find('.grilled').length >= 4) {
          showNotification(state.translations[state.currentLanguage].collectionFull, 'error');
          return;
        }

        if ($panel.find('.cooking-timer').length > 0) {
          showNotification('Wait for current item to finish cooking!', 'warning');
          return;
        }

        const $foodItem = ui.draggable;
        const cookingTime = parseInt($foodItem.data('time'));
        const foodName = $foodItem.find('.food-name').text();
        const category = $foodItem.data('category');
        const priceKrw = parseInt($foodItem.data('price-krw'));
        const priceUsd = parseInt($foodItem.data('price-usd'));
        const icon = $foodItem.find('.food-icon').html();
        const kr = $foodItem.data('kr');
        const en = $foodItem.data('en');

        // Create grilled item
        const $grilledItem = $('<div>')
          .addClass('grilled')
          .data('category', category)
          .data('price-krw', priceKrw)
          .data('price-usd', priceUsd)
          .html(`
            <div class="food-icon">${icon}</div>
            <div class="food-info">
              <div class="food-name">${foodName}</div>
              <div class="timer-display">${formatTime(cookingTime)}</div>
            </div>
          `);

        // Add to panel and start cooking
        $panel.append($grilledItem);
        startCookingTimer($grilledItem, cookingTime);

        // Remove original item and create a new one
        $foodItem.fadeOut(300, function () {
          $(this).remove();

          // Create new item with same data
          const newItem = {
            kr: kr,
            en: en,
            icon: icon,
            time: cookingTime,
            category: category,
            price: {
              krw: priceKrw,
              usd: priceUsd
            }
          };

          // Add to appropriate section
          const $section = category === 'meat' ? '.meat-section' : '.vegan-section';
          createFoodItem(newItem, $($section + ' .menu-items'));

          // Reinitialize draggable for the new item
          $($section + ' .menu-items .food-item:last').draggable({
            helper: 'clone',
            appendTo: 'body',
            zIndex: 1000,
            start: function (event, ui) {
              $(this).addClass('dragging');
              ui.helper.css({
                'width': $(this).width(),
                'height': $(this).height(),
                'opacity': 0.9,
                'transform': 'scale(1.2)',
                'box-shadow': '0 4px 20px rgba(0, 0, 0, 0.3)'
              });
            },
            stop: function (event, ui) {
              $(this).removeClass('dragging');
              if (!$(ui.helper).closest('.panel').length) {
                $(ui.helper).remove();
              }
            }
          });
        });
      }
    });
  }

  // Initialize collection areas
  function initCollectionAreas() {
    // Add click handlers for sauce items
    $('.sauce-item').on('click', function () {
      if (!$(this).hasClass('collecting')) {
        const $collectionArea = $('.sauces-section .collection-area');
        if ($collectionArea.find('.collection-item').length >= state.maxCollectionItems) {
          showNotification(state.translations[state.currentLanguage].collectionFull, 'error');
          return;
        }
        startCollection($(this), $collectionArea, 2);
      }
    });

    // Add click handlers for drink items
    $('.drink-item').on('click', function () {
      if (!$(this).hasClass('collecting')) {
        const $collectionArea = $('.drinks-section .collection-area');
        if ($collectionArea.find('.collection-item').length >= state.maxCollectionItems) {
          showNotification(state.translations[state.currentLanguage].collectionFull, 'error');
          return;
        }
        startCollection($(this), $collectionArea, 3);
      }
    });

    // Add click handlers for side items
    $('.sides-section .food-item').on('click', function () {
      if (!$(this).hasClass('collecting')) {
        const $collectionArea = $('.sides-section .collection-area');
        if ($collectionArea.find('.collection-item').length >= state.maxCollectionItems) {
          showNotification(state.translations[state.currentLanguage].collectionFull, 'error');
          return;
        }
        startCollection($(this), $collectionArea, 1);
      }
    });
  }

  // Initialize speed control
  function initSpeedControl() {
    const $speedControl = $('<div>')
      .addClass('speed-control')
      .html(`
        <span class="speed-control-label">${state.translations[state.currentLanguage].speedControl}</span>
        <input type="range" class="speed-slider" min="1" max="10" value="1" step="1">
        <span class="speed-value">1x</span>
      `)
      .appendTo('body');

    $speedControl.find('.speed-slider').on('input', function () {
      state.speedMultiplier = parseInt($(this).val());
      $speedControl.find('.speed-value').text(state.speedMultiplier + 'x');
    });
  }

  // Initialize grill timer
  function initGrill() {
    const $grill = $('.grill');
    const $igniteBtn = $('.ignite-btn');

    $igniteBtn.on('click', function () {
      const isActive = $grill.hasClass('active');
      if (isActive) {
        $grill.removeClass('active');
        $igniteBtn.removeClass('active');
        $igniteBtn.find('.ignite-text').text('Ignite Grill');
        state.isGrillOn = false;
        showNotification('Grill turned off', 'info');
      } else {
        $grill.addClass('active');
        $igniteBtn.addClass('active');
        $igniteBtn.find('.ignite-text').text('Turn Off');
        state.isGrillOn = true;
        showNotification('Grill ignited! Ready to cook', 'success');
      }
    });
  }

  // Start cooking timer for a single item
  function startCookingTimer($item, duration) {
    let timeLeft = duration;
    const totalTime = duration;

    // Create timer display with countdown
    const $timer = $('<div>')
      .addClass('cooking-timer')
      .html(`
            <div class="timer-content">
                <span class="timer-emoji">🔥</span>
                <span class="timer-countdown">${formatTime(timeLeft)}</span>
            </div>
        `);

    // Create cooking effects
    const $flame = $('<div>').addClass('flame-effect');
    const $sizzle = $('<div>').addClass('sizzle-effect');
    const $smoke = $('<div>').addClass('smoke');

    // Add effects to item
    $item.addClass('cooking')
      .append($timer)
      .append($flame)
      .append($sizzle)
      .append($smoke);

    // Start the timer
    const timer = setInterval(() => {
      timeLeft -= state.speedMultiplier;

      // Update timer display
      $timer.find('.timer-countdown').text(formatTime(timeLeft));
      $item.find('.timer-display').text(formatTime(timeLeft));

      // Update cooking progress
      const progress = 1 - (timeLeft / totalTime);
      const brightness = Math.max(0.3, 1 - (progress * 0.7));
      $item.find('.food-icon').css('filter', `brightness(${brightness})`);

      // Update flame intensity
      $flame.css('opacity', 0.3 + (progress * 0.4));

      if (timeLeft <= 0) {
        clearInterval(timer);
        finishCooking($item);
      }
    }, 1000);
  }

  // Finish cooking process
  function finishCooking($item) {
    $item.removeClass('cooking')
      .find('.cooking-timer, .flame-effect, .sizzle-effect, .smoke').remove();

    // Add done indicator and collect button
    $item.append(`
      <div class="done-indicator">✓</div>
      <button class="collect-btn">Collect</button>
    `);

    // Add sizzle effect when done
    $item.append('<div class="sizzle-effect done"></div>');

    // Handle collection
    $item.find('.collect-btn').on('click', function () {
      const name = $item.find('.food-name').text();
      const icon = $item.find('.food-icon').html();
      const category = $item.data('category');
      const priceKrw = parseInt($item.data('price-krw'));
      const priceUsd = parseInt($item.data('price-usd'));

      $item.fadeOut(300, function () {
        $(this).remove();
        addToOrder(name, icon, priceKrw, priceUsd, category);
      });
    });
  }

  // Start collection process
  function startCollection($item, $collectionArea, duration) {
    $item.addClass('collecting');

    const collectionEmojis = ['🔄', '⏳', '⌛', '✨'];
    let timeLeft = duration;
    let emojiIndex = 0;

    const $timer = $('<div>')
      .addClass('collection-timer')
      .html(`<span class="timer-emoji">${collectionEmojis[emojiIndex]}</span>`);

    $item.append($timer);

    const timer = setInterval(() => {
      timeLeft -= state.speedMultiplier;
      emojiIndex = (emojiIndex + 1) % collectionEmojis.length;
      $timer.find('.timer-emoji').text(collectionEmojis[emojiIndex]);

      if (timeLeft <= 0) {
        clearInterval(timer);
        finishCollection($item, $collectionArea);
      }
    }, 1000);
  }

  // Finish collection process
  function finishCollection($item, $collectionArea) {
    $item.removeClass('collecting')
      .find('.collection-timer').remove();

    const name = $item.find('.food-name, .sauce-name, .drink-name').text();
    const icon = $item.find('.food-icon, .sauce-icon, .drink-icon').html();
    const category = $item.data('category');
    const priceKrw = parseInt($item.data('price-krw'));
    const priceUsd = parseInt($item.data('price-usd'));

    const $collectionItem = $('<div>')
      .addClass('collection-item')
      .html(`
        <span class="item-icon">${icon}</span>
        <span class="item-name">${name}</span>
        <span class="item-price">${formatPrice({ krw: priceKrw, usd: priceUsd }, state.currentLanguage)}</span>
        <button class="collect-btn">Collect</button>
      `);

    $collectionArea.append($collectionItem);

    // Add collect button handler
    $collectionItem.find('.collect-btn').on('click', function () {
      const $item = $(this).closest('.collection-item');
      $item.addClass('removing');
      setTimeout(() => {
        addToOrder(name, icon, priceKrw, priceUsd, category);
        $item.remove();
      }, 300); // Match the animation duration
    });
  }

  // Add item to order
  function addToOrder(name, icon, priceKrw, priceUsd, category) {
    const $orderItem = $('<div>')
      .addClass('order-item')
      .html(`
        <span class="item-icon">${icon}</span>
        <span class="item-name">${name}</span>
        <span class="item-price">${formatPrice({ krw: priceKrw, usd: priceUsd }, state.currentLanguage)}</span>
      `);

    $('.order-history').prepend($orderItem);

    // Update counters and total
    updateCounter(category);
    updateTotal(priceKrw, priceUsd);
  }

  // Update total bill
  function updateTotal(priceKrw, priceUsd) {
    state.totalBill.krw += priceKrw;
    state.totalBill.usd += priceUsd;

    $('.total-amount').text(formatPrice(state.totalBill, state.currentLanguage));
  }

  // Language switch
  $('.language-btn').on('click', function () {
    const lang = $(this).data('lang');
    state.currentLanguage = lang;
    $('.language-btn').removeClass('active');
    $(this).addClass('active');
    updateLanguage();
  });

  // Update language
  function updateLanguage() {
    // Update all item names and prices
    $('.food-item, .sauce-item, .drink-item, .grilled, .collection-item, .order-item').each(function () {
      const $item = $(this);
      const name = $item.data(state.currentLanguage);
      const priceKrw = parseInt($item.data('price-krw'));
      const priceUsd = parseInt($item.data('price-usd'));

      $item.find('.food-name, .sauce-name, .drink-name, .item-name').text(name);
      $item.find('.food-price, .sauce-price, .drink-price, .item-price')
        .text(formatPrice({ krw: priceKrw, usd: priceUsd }, state.currentLanguage));
    });

    // Update total
    $('.total-amount').text(formatPrice(state.totalBill, state.currentLanguage));
  }

  // Initialize the application
  $(document).ready(function () {
    loadMenuData();
    initGrill();
    initSpeedControl();
  });
});
