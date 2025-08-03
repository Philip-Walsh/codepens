$(function () {
  // Scientific specimen data - 3 best slides with concise text
  const specimens = [
    {
      name: "Plant Cell",
      scientificName: "Eukaryotic",
      magnification: "400x",
      structure: "Cell wall, chloroplasts",
      color: "#4CAF50",
      description: "Basic plant structure"
    },
    {
      name: "Blood Cell",
      scientificName: "Erythrocyte",
      magnification: "1000x",
      structure: "Hemoglobin, biconcave",
      color: "#F44336",
      description: "Oxygen carrier"
    },
    {
      name: "Bacteria",
      scientificName: "Prokaryotic",
      magnification: "2000x",
      structure: "Cell membrane, flagella",
      color: "#2196F3",
      description: "Single-celled organism"
    }
  ];

  let currentSlideIndex = 0;
  let isInMicroscopeView = false;

  // Initialize the application
  function init() {
    generateSlides();
    setupEventListeners();
  }

  // Generate slides from specimen data
  function generateSlides() {
    const container = $('.slides-container');
    container.empty();

    specimens.forEach((specimen, index) => {
      const slide = createSlide(specimen, index);
      container.append(slide);
    });
  }

  // Create individual slide
  function createSlide(specimen, index) {
    const slide = $(`
      <section class="slide" data-index="${index}">
        <span class="bg glass"></span>
        <p class="label" 
           data-text="${specimen.name}" 
           data-scientific="${specimen.scientificName}" 
           data-magnification="${specimen.magnification}" 
           data-structure="${specimen.structure}"></p>
        <p class="specimen" data-specimen='${JSON.stringify(specimen)}'></p>
        <p class="cover-slip glass"></p>
      </section>
    `);

    // Create SVG blob for specimen with proper color filters
    const specimenElement = slide.find('.specimen');
    createSpecimenBlob(specimenElement, specimen.color);

    return slide;
  }

  // Create SVG blob specimen with color filters
  function createSpecimenBlob(element, color) {
    // Create unique gradient and filter IDs for each specimen
    const specimenId = Math.random().toString(36).substr(2, 9);
    const gradientId = `specimenGradient-${specimenId}`;
    const filterId = `specimenFilter-${specimenId}`;

    const svg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="${gradientId}" cx="40%" cy="40%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="70%" style="stop-color:${color};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.4" />
          </radialGradient>
          <filter id="${filterId}">
            <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/>
            <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="${color}" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path d="M20,50 Q30,20 50,20 Q70,20 80,50 Q70,80 50,80 Q30,80 20,50 Z" 
              fill="url(#${gradientId})" 
              stroke="${color}" 
              stroke-width="2"
              filter="url(#${filterId})"/>
        <circle cx="35" cy="40" r="3" fill="${color}" opacity="0.8"/>
        <circle cx="65" cy="60" r="2" fill="${color}" opacity="0.6"/>
        <circle cx="45" cy="70" r="1.5" fill="${color}" opacity="0.7"/>
        <circle cx="55" cy="35" r="1" fill="${color}" opacity="0.5"/>
        <circle cx="25" cy="65" r="1.2" fill="${color}" opacity="0.6"/>
      </svg>
    `;
    element.html(svg);
  }

  // Setup event listeners
  function setupEventListeners() {
    // Click on slide to enter microscope view
    $(document).on('click', '.slide', function () {
      if (!isInMicroscopeView) {
        const slideIndex = $(this).data('index');
        enterMicroscopeView(slideIndex);
      }
    });

    // Click anywhere on microscope overlay to exit
    $(document).on('click', '.microscope-overlay', function (e) {
      if (isInMicroscopeView) {
        exitMicroscopeView();
      }
    });

    // ESC key to exit microscope view
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape' && isInMicroscopeView) {
        exitMicroscopeView();
      }
    });

    // Click on microscope circle to exit (alternative)
    $(document).on('click', '.microscope-circle', function (e) {
      if (isInMicroscopeView) {
        e.stopPropagation();
        exitMicroscopeView();
      }
    });
  }

  // Enter microscope view
  function enterMicroscopeView(slideIndex) {
    currentSlideIndex = slideIndex;
    const specimen = specimens[slideIndex];

    // Start circular fade to black
    $('.fade-overlay').addClass('active');
    setTimeout(() => {
      $('.fade-circle').addClass('expand');
    }, 50);

    setTimeout(() => {
      // Show microscope overlay
      $('.microscope-overlay').addClass('active');

      // Update microscope view with specimen data
      updateMicroscopeView(specimen);

      // Start microscope effect
      startMicroscopeEffect();

      // Contract the fade circle
      $('.fade-circle').removeClass('expand').addClass('contract');
      setTimeout(() => {
        $('.fade-overlay').removeClass('active');
        $('.fade-circle').removeClass('contract');
      }, 800);

      isInMicroscopeView = true;
    }, 800);
  }

  // Exit microscope view
  function exitMicroscopeView() {
    // Start circular fade to black
    $('.fade-overlay').addClass('active');
    setTimeout(() => {
      $('.fade-circle').addClass('expand');
    }, 50);

    setTimeout(() => {
      // Hide microscope overlay
      $('.microscope-overlay').removeClass('active');

      // Stop microscope effect
      stopMicroscopeEffect();

      // Contract the fade circle
      $('.fade-circle').removeClass('expand').addClass('contract');
      setTimeout(() => {
        $('.fade-overlay').removeClass('active');
        $('.fade-circle').removeClass('contract');
      }, 800);

      isInMicroscopeView = false;
    }, 800);
  }

  // Update microscope view with specimen data
  function updateMicroscopeView(specimen) {
    const specimenView = $('.specimen-view');

    // Create detailed specimen SVG for microscope view
    const detailedSvg = createDetailedSpecimenSvg(specimen);
    specimenView.html(detailedSvg);

    // Update microscope info
    $('.microscope-view').attr('data-specimen', JSON.stringify(specimen));
  }

  // Create detailed specimen SVG for microscope view
  function createDetailedSpecimenSvg(specimen) {
    const specimenId = Math.random().toString(36).substr(2, 9);
    const gradientId = `microscopeGradient-${specimenId}`;
    const filterId = `microscopeFilter-${specimenId}`;

    return `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="${gradientId}" cx="40%" cy="40%">
            <stop offset="0%" style="stop-color:${specimen.color};stop-opacity:1" />
            <stop offset="60%" style="stop-color:${specimen.color};stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:${specimen.color};stop-opacity:0.3" />
          </radialGradient>
          <filter id="${filterId}">
            <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/>
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="${specimen.color}" flood-opacity="0.4"/>
            <feGaussianBlur stdDeviation="0.5"/>
          </filter>
        </defs>
        
        <!-- Main specimen blob -->
        <path d="M40,100 Q60,30 100,30 Q140,30 160,100 Q140,170 100,170 Q60,170 40,100 Z" 
              fill="url(#${gradientId})" 
              stroke="${specimen.color}" 
              stroke-width="3"
              filter="url(#${filterId})"/>
        
        <!-- Internal structures -->
        <circle cx="70" cy="80" r="8" fill="${specimen.color}" opacity="0.9"/>
        <circle cx="130" cy="120" r="6" fill="${specimen.color}" opacity="0.8"/>
        <circle cx="90" cy="140" r="4" fill="${specimen.color}" opacity="0.7"/>
        <circle cx="110" cy="60" r="5" fill="${specimen.color}" opacity="0.8"/>
        
        <!-- Smaller details -->
        <circle cx="50" cy="110" r="2" fill="${specimen.color}" opacity="0.6"/>
        <circle cx="150" cy="90" r="2.5" fill="${specimen.color}" opacity="0.7"/>
        <circle cx="80" cy="50" r="3" fill="${specimen.color}" opacity="0.8"/>
        <circle cx="120" cy="150" r="2" fill="${specimen.color}" opacity="0.6"/>
        
        <!-- Additional detail circles -->
        <circle cx="60" cy="70" r="1.5" fill="${specimen.color}" opacity="0.5"/>
        <circle cx="140" cy="110" r="1.8" fill="${specimen.color}" opacity="0.6"/>
        <circle cx="100" cy="40" r="2.2" fill="${specimen.color}" opacity="0.7"/>
        <circle cx="40" cy="130" r="1.3" fill="${specimen.color}" opacity="0.4"/>
        
        <!-- Surface texture lines -->
        <path d="M60,70 Q70,65 80,70" stroke="${specimen.color}" stroke-width="1" opacity="0.5" fill="none"/>
        <path d="M120,130 Q130,125 140,130" stroke="${specimen.color}" stroke-width="1" opacity="0.5" fill="none"/>
        <path d="M80,100 Q90,95 100,100" stroke="${specimen.color}" stroke-width="0.8" opacity="0.4" fill="none"/>
        <path d="M100,120 Q110,115 120,120" stroke="${specimen.color}" stroke-width="0.8" opacity="0.4" fill="none"/>
      </svg>
    `;
  }

  // Start microscope effect (blur to clear circle)
  function startMicroscopeEffect() {
    const microscopeCircle = $('.microscope-circle');
    const specimenView = $('.specimen-view');

    // Start with blur and small circle
    microscopeCircle.css({
      'filter': 'blur(10px)',
      'transform': 'scale(0.3)'
    });

    // Animate to clear and full size
    setTimeout(() => {
      microscopeCircle.css({
        'filter': 'blur(0px)',
        'transform': 'scale(1)'
      });
    }, 300);
  }

  // Stop microscope effect
  function stopMicroscopeEffect() {
    const microscopeCircle = $('.microscope-circle');
    microscopeCircle.css({
      'filter': '',
      'transform': ''
    });
  }

  // Initialize when document is ready
  init();
});
