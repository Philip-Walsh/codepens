$(document).ready(function () {
  // Korean BBQ food items with cooking times and bilingual names
  const foods = [
    { emoji: '🥩', name: { ko: '한우 스테이크', en: 'Hanwoo Steak' }, time: 120 },
    { emoji: '🍖', name: { ko: '삼겹살', en: 'Samgyeopsal' }, time: 90 },
    { emoji: '🌭', name: { ko: '소시지', en: 'Sausage' }, time: 60 },
    { emoji: '🦐', name: { ko: '새우', en: 'Shrimp' }, time: 45 },
    { emoji: '🥬', name: { ko: '양배추', en: 'Cabbage' }, time: 30 },
    { emoji: '🧅', name: { ko: '양파', en: 'Onion' }, time: 45 },
    { emoji: '🦑', name: { ko: '오징어', en: 'Squid' }, time: 60 }
  ];

  // UI text translations
  const translations = {
    ko: {
      ignite: '🔥 불붙이기',
      extinguish: '💧 끄기',
      hideLabels: '👁️ 라벨 숨기기',
      showLabels: '👁️ 라벨 보기',
      addFood: '➕ 음식 추가',
      cooking: '조리 중',
      done: '완성!',
      minutes: '분',
      seconds: '초',
      dragToGrill: '그릴로 드래그하세요'
    },
    en: {
      ignite: '🔥 Ignite',
      extinguish: '💧 Extinguish',
      hideLabels: '👁️ Hide Labels',
      showLabels: '👁️ Show Labels',
      addFood: '➕ Add Food',
      cooking: 'Cooking',
      done: 'Done!',
      minutes: 'm',
      seconds: 's',
      dragToGrill: 'Drag to grill'
    }
  };

  let isIgnited = false;
  let labelsVisible = true;
  let currentLanguage = 'ko';
  let cookingTimers = {};
  let draggedFood = null;
  let dragOffset = { x: 0, y: 0 };

  // Initialize UI
  function initializeUI() {
    // Add language toggle
    $('.controls').prepend(`
      <button id="toggle-language" class="btn">
        🌐 ${currentLanguage === 'ko' ? 'English' : '한국어'}
      </button>
    `);

    // Initialize menu
    const menuContainer = $('<div>').addClass('menu-container');
    foods.forEach(food => {
      menuContainer.append(createFoodElement(food));
    });
    $('.bbq-table').prepend(menuContainer);

    // Set initial button text
    updateButtonText();
  }

  function createFoodElement(foodData) {
    const food = $('<div>')
      .addClass('food-item')
      .attr('data-name-ko', foodData.name.ko)
      .attr('data-name-en', foodData.name.en)
      .attr('data-cooking-time', foodData.time)
      .attr('data-cooked', '0')
      .attr('draggable', 'true');

    const emoji = $('<span>').addClass('food-emoji').text(foodData.emoji);
    const name = $('<span>').addClass('food-name').text(foodData.name[currentLanguage]);

    food.append(emoji, name);
    return food;
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return currentLanguage === 'ko'
      ? `${minutes}${translations.ko.minutes} ${remainingSeconds}${translations.ko.seconds}`
      : `${minutes}${translations.en.minutes} ${remainingSeconds}${translations.en.seconds}`;
  }

  function updateButtonText() {
    $('#ignite-btn').text(isIgnited ? translations[currentLanguage].extinguish : translations[currentLanguage].ignite);
    $('#toggle-labels').text(labelsVisible ? translations[currentLanguage].hideLabels : translations[currentLanguage].showLabels);
    $('#add-food').text(translations[currentLanguage].addFood);
  }

  // Language toggle
  $('#toggle-language').on('click', function () {
    currentLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
    $(this).text(`🌐 ${currentLanguage === 'ko' ? 'English' : '한국어'}`);
    updateButtonText();
    $('.food-name').each(function () {
      const $food = $(this).parent();
      $(this).text($food.attr(`data-name-${currentLanguage}`));
    });
  });

  // Ignite button
  $('#ignite-btn').on('click', function () {
    isIgnited = !isIgnited;
    const layers = $('.grill .panel');

    if (isIgnited) {
      layers.eq(2).addClass('lift1');
      setTimeout(() => layers.eq(3).addClass('lift2'), 200);
      setTimeout(() => layers.eq(4).addClass('lift3'), 400);
      const fireSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fire-crackling-ambience-168.mp3');
      fireSound.loop = true;
      fireSound.play();
    } else {
      layers.removeClass('lift1 lift2 lift3');
      const fireSound = document.querySelector('audio');
      if (fireSound) fireSound.pause();
    }

    updateButtonText();
  });

  // Toggle labels
  $('#toggle-labels').on('click', function () {
    labelsVisible = !labelsVisible;
    $('.food-name').css('opacity', labelsVisible ? '1' : '0');
    updateButtonText();
  });

  // Drag and drop functionality
  $(document).on('mousedown touchstart', '.food-item', function (e) {
    if (!isIgnited) return;

    draggedFood = $(this);
    draggedFood.addClass('dragging');

    const rect = draggedFood[0].getBoundingClientRect();
    dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Add drag hint
    const hint = $('<div>').addClass('drag-hint').text(translations[currentLanguage].dragToGrill);
    draggedFood.append(hint);

    // Add sizzle sound
    const sizzleSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cooking-sizzle-168.mp3');
    sizzleSound.play();
  });

  $(document).on('mousemove touchmove', function (e) {
    if (!draggedFood) return;
    e.preventDefault();

    const x = (e.clientX || e.touches[0].clientX) - dragOffset.x;
    const y = (e.clientY || e.touches[0].clientY) - dragOffset.y;

    draggedFood.css({
      position: 'fixed',
      left: x + 'px',
      top: y + 'px',
      zIndex: 1000
    });
  });

  $(document).on('mouseup touchend', function (e) {
    if (!draggedFood) return;

    const grillRect = $('.grill-container')[0].getBoundingClientRect();
    const foodRect = draggedFood[0].getBoundingClientRect();

    // Check if food is dropped on the grill
    if (isIgnited &&
      foodRect.left >= grillRect.left &&
      foodRect.right <= grillRect.right &&
      foodRect.top >= grillRect.top &&
      foodRect.bottom <= grillRect.bottom) {

      // Add to grill with animation
      draggedFood.css({
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      });

      $('.grill-container').append(draggedFood);
      startCooking(draggedFood);
    } else {
      // Return to menu with animation
      draggedFood.css({
        position: 'relative',
        left: 'auto',
        top: 'auto',
        transform: 'none'
      });
      $('.menu-container').append(draggedFood);
    }

    draggedFood.removeClass('dragging');
    draggedFood.find('.drag-hint').remove();
    draggedFood = null;
  });

  function startCooking($food) {
    const foodId = $food.attr('data-name-ko');
    const cookingTime = parseInt($food.attr('data-cooking-time'));
    const cookedLevel = parseInt($food.attr('data-cooked') || '0');

    // If already cooking, stop it
    if (cookingTimers[foodId]) {
      clearInterval(cookingTimers[foodId]);
      delete cookingTimers[foodId];
      $food.find('.cooking-timer').remove();
      $food.removeClass('cooking');
      return;
    }

    // Start cooking
    const newCookedLevel = Math.min(cookedLevel + 1, 3);
    $food.attr('data-cooked', newCookedLevel);
    $food.addClass('cooking');

    // Add timer
    const timer = $('<span>').addClass('cooking-timer').text(formatTime(cookingTime));
    $food.append(timer);

    let remainingTime = cookingTime;
    cookingTimers[foodId] = setInterval(() => {
      remainingTime--;
      timer.text(formatTime(remainingTime));

      if (remainingTime <= 0) {
        clearInterval(cookingTimers[foodId]);
        delete cookingTimers[foodId];
        timer.remove();
        $food.removeClass('cooking').addClass('done');
        $food.append($('<span>').addClass('done-badge').text(translations[currentLanguage].done));
        const doneSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
        doneSound.play();
      }
    }, 1000);
  }

  // Initialize the UI
  initializeUI();
});