$(document).ready(function () {
  // Korean BBQ food items with cooking times
  const foods = [
    { emoji: '🥩', name: '한우 스테이크', time: 120 },
    { emoji: '🍖', name: '삼겹살', time: 90 },
    { emoji: '🌭', name: '소시지', time: 60 },
    { emoji: '🦐', name: '새우', time: 45 },
    { emoji: '🥬', name: '양배추', time: 30 },
    { emoji: '🧅', name: '양파', time: 45 },
    { emoji: '🦑', name: '오징어', time: 60 }
  ];

  let isIgnited = false;
  let labelsVisible = true;
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;
  let cookingTimers = {};

  // Initialize with fewer food items
  $('.food-container').empty();
  const initialFoods = [
    { emoji: '🥩', name: '한우 스테이크', time: 120 },
    { emoji: '🍖', name: '삼겹살', time: 90 },
    { emoji: '🦐', name: '새우', time: 45 }
  ];

  initialFoods.forEach(food => {
    $('.food-container').append(createFoodElement(food));
  });

  function createFoodElement(foodData) {
    const food = $('<span>')
      .addClass('food')
      .attr('data-name', foodData.name)
      .attr('data-cooking-time', foodData.time)
      .attr('data-cooked', '0')
      .text(foodData.emoji);

    // Add smoke effect
    const smoke = $('<div>').addClass('smoke');
    for (let i = 0; i < 5; i++) {
      smoke.append($('<div>'));
    }
    food.append(smoke);

    // Add timer display
    const timer = $('<span>').addClass('food-timer').text(formatTime(foodData.time));
    food.append(timer);

    return food;
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  }

  initialFoods.forEach((emoji, index) => {
    $('.food-container').append(createFoodElement({ emoji, name: initialNames[index], time: foods[index].time }));
  });

  // Ignite button functionality
  $('#ignite-btn').on('click', function () {
    isIgnited = !isIgnited;
    const layers = $('.grill .panel');

    if (isIgnited) {
      $(this).text('💧 Extinguish');
      layers.eq(2).addClass('lift1');
      setTimeout(() => layers.eq(3).addClass('lift2'), 200);
      setTimeout(() => layers.eq(4).addClass('lift3'), 400);
    } else {
      $(this).text('🔥 Ignite');
      layers.removeClass('lift1 lift2 lift3');
    }
  });

  // Toggle labels
  $('#toggle-labels').on('click', function () {
    labelsVisible = !labelsVisible;
    $('.food').css('--label-opacity', labelsVisible ? '1' : '0');
    $(this).text(labelsVisible ? '👁️ Hide Labels' : '👁️ Show Labels');
  });

  // Add random food
  $('#add-food').on('click', function () {
    const randomFood = foods[Math.floor(Math.random() * foods.length)];
    const newFood = createFoodElement(randomFood);

    $('.food-container').append(newFood);

    // Animate the new food
    setTimeout(() => {
      newFood.addClass('flip');
      setTimeout(() => newFood.removeClass('flip'), 800);
    }, 100);
  });

  // 3D Panning functionality
  let isPanning = false;
  let startMouseX = 0;
  let startMouseY = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;

  function handleMouseMove(e) {
    if (!isPanning) return;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const deltaX = mouseX - startMouseX;
    const deltaY = mouseY - startMouseY;
    
    currentRotationY = Math.max(-90, Math.min(90, currentRotationY - deltaX * 0.5));
    currentRotationX = Math.max(-90, Math.min(90, currentRotationX + deltaY * 0.5));
    
    $('.food-container').css({
      transform: `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg) translateZ(calc(var(--base-depth) + var(--layer-gap) * 4))`
    });
  }

  function handleMouseDown(e) {
    if (!isIgnited) return;
    
    isPanning = true;
    startMouseX = e.clientX;
    startMouseY = e.clientY;
  }

  function handleMouseUp() {
    isPanning = false;
  }

  // Add event listeners for 3D panning
  $(document).on('mousedown', '.food-container', handleMouseDown);
  $(document).on('mousemove', '.food-container', handleMouseMove);
  $(document).on('mouseup', handleMouseUp);

  // Touch support for 3D panning
  $(document).on('touchstart', '.food-container', function(e) {
    if (!isIgnited) return;
    
    e.preventDefault();
    isPanning = true;
    startMouseX = e.touches[0].clientX;
    startMouseY = e.touches[0].clientY;
  });

  $(document).on('touchmove', '.food-container', function(e) {
    if (!isPanning) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  });

  $(document).on('touchend', '.food-container', function() {
    isPanning = false;
  });

  function drag(e) {
    if (!isDragging) return;

    e.preventDefault();

    const food = $(e.target).closest('.food');
    if (!food.length) return;

    currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    xOffset = currentX - initialX;
    yOffset = currentY - initialY;

    setTranslate(xOffset, yOffset, food);
  }

  function dragEnd(e) {
    if (!isDragging) return;

    const food = $(e.target).closest('.food');
    if (!food.length) return;

    initialX = currentX;
    initialY = currentY;

    isDragging = false;
  }

  function setTranslate(xPos, yPos, el) {
    el.css('transform', `translate3d(${xPos}px, ${yPos}px, 0)`);
  }

  // Click on food to start cooking
  $(document).on('click', '.food', function (e) {
    if (isDragging) return;
    if (!isIgnited) return;

    const $food = $(this);
    const foodName = $food.attr('data-name');
    const cookingTime = parseInt($food.attr('data-cooking-time'));

    // Clear existing timer if any
    if (cookingTimers[foodName]) {
      clearInterval(cookingTimers[foodName]);
      delete cookingTimers[foodName];
      $food.find('.food-timer').text(formatTime(cookingTime));
      return;
    }

    let remainingTime = cookingTime;
    const timer = setInterval(() => {
      remainingTime--;
      $food.find('.food-timer').text(formatTime(remainingTime));

      if (remainingTime <= 0) {
        clearInterval(timer);
        delete cookingTimers[foodName];
        $food.find('.food-timer').remove();
        $food.append($('<span>').addClass('food-cooked').text('완성!'));
        $food.css('--cooked-level', 1);
      }
    }, 1000);

    cookingTimers[foodName] = timer;
  });

  // Touch and mouse events for dragging
  $(document).on('mousedown touchstart', '.food', dragStart);
  $(document).on('mousemove touchmove', drag);
  $(document).on('mouseup touchend', dragEnd);

  // Hover effect on food
  $(document).on('mouseenter', '.food', function () {
    if (!isDragging) {
      $(this).css('transform', 'scale(1.2)');
    }
  }).on('mouseleave', '.food', function () {
    if (!isDragging) {
      $(this).css('transform', 'scale(1)');
    }
  });
});