document.addEventListener('DOMContentLoaded', init, false);

let slideData = {
  title: 'What Makes a Good Presentation',
  author: 'Slide Show Demo',
  slides: [],
};

let selectedSlideIndex = -1;
let currentViewMode = 'grid';

// Sample presentation data about what makes a good presentation
const samplePresentationData = {
  title: 'What Makes a Good Presentation',
  author: 'Slide Show Demo',
  slides: [
    {
      type: 'title',
      data: {
        title: 'What Makes a Good Presentation',
        author: 'Effective Presentation Tips',
      },
    },
    {
      type: 'text',
      data: {
        title: 'Clear Structure',
        content:
          'Every good presentation follows a logical structure that guides the audience through your content.',
        bullets: [
          'Start with a compelling introduction',
          'Present your main points in a logical order',
          'End with a memorable conclusion',
          "Follow the rule: Tell them what you'll tell them, tell them, then tell them what you told them",
        ],
      },
    },
    {
      type: 'image',
      data: {
        src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        alt: 'Person giving a presentation',
        caption: 'Engaging your audience is key to a successful presentation',
      },
    },
    {
      type: 'text',
      data: {
        title: 'Visual Design',
        content:
          'The visual aspect of your presentation greatly impacts how your message is received.',
        bullets: [
          'Use consistent, clean design',
          'Limit text on each slide',
          'Choose readable fonts and contrasting colors',
          'Include relevant images and graphics',
        ],
      },
    },
    {
      type: 'question',
      data: {
        question:
          'What is the recommended maximum number of bullet points per slide?',
        options: ['3-5', '6-8', '10-12', 'As many as needed'],
        answer:
          '3-5 bullet points is generally recommended to avoid overwhelming your audience.',
      },
    },
    {
      type: 'code',
      data: {
        language: 'javascript',
        code: '// Example of how NOT to present code\nfunction createPresentation() {\n  const slides = [];\n  for (let i = 0; i < 100; i++) {\n    // Adding way too many slides with too much content\n    slides.push({\n      title: `Slide ${i}`,\n      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."\n    });\n  }\n  return slides;\n}',
        caption:
          'When presenting code, keep it simple and highlight the important parts',
      },
    },
    {
      type: 'text',
      data: {
        title: 'Delivery Matters',
        content:
          'How you deliver your presentation is just as important as the content itself.',
        bullets: [
          'Speak clearly and at an appropriate pace',
          'Make eye contact with your audience',
          'Use gestures to emphasize key points',
          'Practice beforehand to build confidence',
        ],
      },
    },
    {
      type: 'title',
      data: {
        title: 'Thank You!',
        author: 'Any Questions?',
      },
    },
  ],
};

class Slide {
  constructor(type = 'title', data) {
    this.type = type;
    this.data = data || {};
  }

  getHTML() {
    const methods = {
      title: this.getTitleSlide.bind(this),
      image: this.getImageSlide.bind(this),
      text: this.getTextSlide.bind(this),
      question: this.getQuestionSlide.bind(this),
      code: this.getCodeSlide.bind(this),
    };
    return (
      methods[this.type]?.() || '<div class="error">Invalid slide type</div>'
    );
  }

  getTitleSlide() {
    return `<div class="title-slide"><h1>${this.data.title}</h1><h2>${this.data.author}</h2></div>`;
  }

  getImageSlide() {
    return `<div class="image-slide"><img src="${this.data.src}" alt="${this.data.alt}" />${this.data.caption ? `<p class="caption">${this.data.caption}</p>` : ''}</div>`;
  }

  getTextSlide() {
    return `<div class="text-slide"><h2>${this.data.title}</h2><p>${this.data.content}</p>${this.data.bullets ? `<ul>${this.data.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}</div>`;
  }

  getQuestionSlide() {
    return `<div class="question-slide"><h2>${this.data.question}</h2>${this.data.options ? `<div class="options">${this.data.options.map(opt => `<button class="option">${opt}</button>`).join('')}</div>` : ''}<div class="answer hidden">${this.data.answer}</div></div>`;
  }

  getCodeSlide() {
    return `<div class="code-slide"><pre><code class="language-${this.data.language}">${this.data.code}</code></pre>${this.data.caption ? `<p class="caption">${this.data.caption}</p>` : ''}</div>`;
  }

  getSlide() {
    return this.getHTML();
  }
}

// Modal Management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    // Focus management
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
}

function setupModalHandlers() {
  // Help modal
  document.getElementById('help-btn')?.addEventListener('click', () => openModal('help-modal'));

  // Shortcuts modal
  document.getElementById('shortcuts-btn')?.addEventListener('click', () => openModal('shortcuts-modal'));

  // Close modal handlers
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
    element.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  // Prevent modal content clicks from closing modal
  document.querySelectorAll('.modal-content').forEach(content => {
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // ESC key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal:not(.hidden)');
      if (openModal) {
        closeModal(openModal.id);
      }
    }
  });
}

// Help Tab System
function setupHelpTabs() {
  const tabs = document.querySelectorAll('.help-tab');
  const panels = document.querySelectorAll('.help-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active panel
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `${targetTab}-content`) {
          panel.classList.add('active');
        }
      });
    });
  });
}

// View Mode Management
function setupViewModes() {
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const slidesContainer = document.getElementById('presentation');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.id.replace('-view', '');
      setViewMode(mode);

      // Update active button
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function setViewMode(mode) {
  currentViewMode = mode;
  const slidesContainer = document.querySelector('.slides-container');

  // Remove existing mode classes
  slidesContainer.classList.remove('grid-mode', 'list-mode', 'thumbnail-mode');

  // Add new mode class
  slidesContainer.classList.add(`${mode}-mode`);

  // Update grid layout based on mode
  switch (mode) {
    case 'list':
      slidesContainer.style.gridTemplateColumns = '1fr';
      break;
    case 'thumbnail':
      slidesContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
      break;
    case 'grid':
    default:
      slidesContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(var(--slide-max-width), 1fr))';
      break;
  }
}

// Enhanced Slide Management
function selectSlide(index) {
  selectedSlideIndex = index;

  // Update visual selection
  document.querySelectorAll('.slide-wrapper').forEach((wrapper, i) => {
    wrapper.classList.toggle('selected', i === index);
  });

  // Update duplicate button state
  const duplicateBtn = document.getElementById('duplicate-slide');
  if (duplicateBtn) {
    duplicateBtn.disabled = index === -1;
  }
}

function duplicateSlide() {
  if (selectedSlideIndex >= 0 && selectedSlideIndex < slideData.slides.length) {
    const slideToDuplicate = JSON.parse(JSON.stringify(slideData.slides[selectedSlideIndex]));
    slideData.slides.splice(selectedSlideIndex + 1, 0, slideToDuplicate);
    renderSlides();
  }
}

function clearAllSlides() {
  if (confirm('Are you sure you want to clear all slides? This action cannot be undone.')) {
    slideData.slides = [];
    selectedSlideIndex = -1;
    renderSlides();
  }
}

// Enhanced Slide Counter
function updateSlideCounter() {
  const counter = document.getElementById('slide-counter');
  if (counter) {
    const count = slideData.slides.length;
    counter.textContent = `${count} slide${count !== 1 ? 's' : ''}`;
  }
}

function renderSlides() {
  const presentation = document.querySelector('.slides-container');
  presentation.innerHTML = '';

  slideData.slides.forEach((slide, index) => {
    const slideObj = new Slide(slide.type, slide.data);
    const wrapper = document.createElement('div');
    wrapper.classList.add('slide-wrapper');
    wrapper.dataset.index = index;

    // Add click handler for selection
    wrapper.addEventListener('click', (e) => {
      if (!e.target.closest('.slide-actions')) {
        selectSlide(index);
      }
    });

    // Create slide content
    const slideContent = document.createElement('div');
    slideContent.innerHTML = slideObj.getSlide();

    // Create slide actions container
    const slideActions = document.createElement('div');
    slideActions.classList.add('slide-actions');
    slideActions.innerHTML = `
      <button class='edit-slide' data-index='${index}' aria-label='Edit slide ${index + 1}'>Edit</button>
      <button class='delete-slide' data-index='${index}' aria-label='Delete slide ${index + 1}'>Delete</button>
    `;

    // Append content and actions to wrapper
    wrapper.appendChild(slideContent);
    wrapper.appendChild(slideActions);

    presentation.appendChild(wrapper);
  });

  attachEventHandlers();
  updateSlideCounter();

  // Clear selection if selected slide no longer exists
  if (selectedSlideIndex >= slideData.slides.length) {
    selectSlide(-1);
  }
}

function attachEventHandlers() {
  // Delete handlers
  document.querySelectorAll('.delete-slide').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const index = parseInt(e.target.dataset.index);

      if (confirm('Are you sure you want to delete this slide?')) {
        slideData.slides.splice(index, 1);

        // Adjust selected index if needed
        if (selectedSlideIndex === index) {
          selectSlide(-1);
        } else if (selectedSlideIndex > index) {
          selectedSlideIndex--;
        }

        renderSlides();
      }
    });
  });

  // Edit handlers
  document.querySelectorAll('.edit-slide').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const index = parseInt(e.target.dataset.index);
      showEditForm(index);
    });
  });
}

function addSlide(type, data) {
  slideData.slides.push({ type, data });
  renderSlides();

  // Auto-select the new slide
  selectSlide(slideData.slides.length - 1);
}

function updateSlide(index, newData) {
  if (slideData.slides[index]) {
    slideData.slides[index].data = {
      ...slideData.slides[index].data,
      ...newData,
    };
    renderSlides();
  }
}

function showAddForm(type) {
  const formContainer = document.getElementById('slide-form-container');
  formContainer.classList.remove('hidden');

  const formHTML = getFormForType(type);
  formContainer.innerHTML = `
    <h2>Add ${type.charAt(0).toUpperCase() + type.slice(1)} Slide</h2>
    <form id="slide-form" class="enhanced-form">
      ${formHTML}
      <div class="form-actions">
        <button type="button" id="cancel-form">Cancel</button>
        <button type="submit">Add Slide</button>
      </div>
    </form>
  `;

  // Focus on first input
  const firstInput = formContainer.querySelector('input, textarea, select');
  if (firstInput) firstInput.focus();

  document.getElementById('cancel-form').addEventListener('click', () => {
    formContainer.classList.add('hidden');
  });

  document.getElementById('slide-form').addEventListener('submit', e => {
    e.preventDefault();
    const formData = getFormData(type);

    // Validate form data
    if (validateFormData(type, formData)) {
      addSlide(type, formData);
      formContainer.classList.add('hidden');
    }
  });
}

function showEditForm(index) {
  const slide = slideData.slides[index];
  const formContainer = document.getElementById('slide-form-container');
  formContainer.classList.remove('hidden');

  const formHTML = getFormForType(slide.type, slide.data);
  formContainer.innerHTML = `
    <h2>Edit ${slide.type.charAt(0).toUpperCase() + slide.type.slice(1)} Slide</h2>
    <form id="slide-form" class="enhanced-form">
      ${formHTML}
      <div class="form-actions">
        <button type="button" id="cancel-form">Cancel</button>
        <button type="submit">Update Slide</button>
      </div>
    </form>
  `;

  // Focus on first input
  const firstInput = formContainer.querySelector('input, textarea, select');
  if (firstInput) firstInput.focus();

  document.getElementById('cancel-form').addEventListener('click', () => {
    formContainer.classList.add('hidden');
  });

  document.getElementById('slide-form').addEventListener('submit', e => {
    e.preventDefault();
    const formData = getFormData(slide.type);

    // Validate form data
    if (validateFormData(slide.type, formData)) {
      updateSlide(index, formData);
      formContainer.classList.add('hidden');
    }
  });
}

function validateFormData(type, data) {
  switch (type) {
    case 'title':
      if (!data.title.trim()) {
        alert('Title is required');
        return false;
      }
      break;
    case 'text':
      if (!data.title.trim() || !data.content.trim()) {
        alert('Title and content are required');
        return false;
      }
      break;
    case 'image':
      if (!data.src.trim() || !data.alt.trim()) {
        alert('Image URL and alt text are required');
        return false;
      }
      // Basic URL validation
      try {
        new URL(data.src);
      } catch {
        alert('Please enter a valid image URL');
        return false;
      }
      break;
    case 'question':
      if (!data.question.trim() || !data.answer.trim()) {
        alert('Question and answer are required');
        return false;
      }
      if (!data.options || data.options.length < 2) {
        alert('At least 2 options are required');
        return false;
      }
      break;
    case 'code':
      if (!data.code.trim()) {
        alert('Code content is required');
        return false;
      }
      break;
  }
  return true;
}

function getFormForType(type, data = {}) {
  const forms = {
    title: `
      <div class="form-group">
        <label for="title">Title *</label>
        <input type="text" id="title" value="${data.title || ''}" required placeholder="Enter slide title">
      </div>
      <div class="form-group">
        <label for="author">Subtitle/Author</label>
        <input type="text" id="author" value="${data.author || ''}" placeholder="Enter subtitle or author name">
      </div>
    `,
    text: `
      <div class="form-group">
        <label for="title">Title *</label>
        <input type="text" id="title" value="${data.title || ''}" required placeholder="Enter slide title">
      </div>
      <div class="form-group">
        <label for="content">Content *</label>
        <textarea id="content" rows="4" required placeholder="Enter main content">${data.content || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="bullets">Bullet Points</label>
        <textarea id="bullets" rows="3" placeholder="Enter bullet points, one per line">${data.bullets ? data.bullets.join('\n') : ''}</textarea>
        <small>Enter each bullet point on a new line</small>
      </div>
    `,
    image: `
      <div class="form-group">
        <label for="src">Image URL *</label>
        <input type="url" id="src" value="${data.src || ''}" required placeholder="https://example.com/image.jpg">
      </div>
      <div class="form-group">
        <label for="alt">Alt Text *</label>
        <input type="text" id="alt" value="${data.alt || ''}" required placeholder="Describe the image for accessibility">
      </div>
      <div class="form-group">
        <label for="caption">Caption</label>
        <input type="text" id="caption" value="${data.caption || ''}" placeholder="Optional image caption">
      </div>
    `,
    question: `
      <div class="form-group">
        <label for="question">Question *</label>
        <textarea id="question" rows="2" required placeholder="Enter your question">${data.question || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="options">Options *</label>
        <textarea id="options" rows="4" required placeholder="Enter options, one per line">${data.options ? data.options.join('\n') : ''}</textarea>
        <small>Enter each option on a new line (minimum 2 required)</small>
      </div>
      <div class="form-group">
        <label for="answer">Answer/Explanation *</label>
        <textarea id="answer" rows="2" required placeholder="Enter the correct answer or explanation">${data.answer || ''}</textarea>
      </div>
    `,
    code: `
      <div class="form-group">
        <label for="language">Programming Language</label>
        <select id="language">
          <option value="javascript" ${data.language === 'javascript' ? 'selected' : ''}>JavaScript</option>
          <option value="python" ${data.language === 'python' ? 'selected' : ''}>Python</option>
          <option value="html" ${data.language === 'html' ? 'selected' : ''}>HTML</option>
          <option value="css" ${data.language === 'css' ? 'selected' : ''}>CSS</option>
          <option value="java" ${data.language === 'java' ? 'selected' : ''}>Java</option>
          <option value="cpp" ${data.language === 'cpp' ? 'selected' : ''}>C++</option>
          <option value="json" ${data.language === 'json' ? 'selected' : ''}>JSON</option>
          <option value="bash" ${data.language === 'bash' ? 'selected' : ''}>Bash</option>
        </select>
      </div>
      <div class="form-group">
        <label for="code">Code *</label>
        <textarea id="code" rows="8" required placeholder="Enter your code here" style="font-family: monospace;">${data.code || ''}</textarea>
      </div>
      <div class="form-group">
        <label for="caption">Caption</label>
        <input type="text" id="caption" value="${data.caption || ''}" placeholder="Optional code explanation">
      </div>
    `,
  };

  return forms[type] || '';
}

function getFormData(type) {
  const data = {};

  switch (type) {
    case 'title':
      data.title = document.getElementById('title').value;
      data.author = document.getElementById('author').value;
      break;
    case 'text':
      data.title = document.getElementById('title').value;
      data.content = document.getElementById('content').value;
      const bulletsValue = document.getElementById('bullets').value.trim();
      data.bullets = bulletsValue ? bulletsValue.split('\n').map(b => b.trim()).filter(b => b) : [];
      break;
    case 'image':
      data.src = document.getElementById('src').value;
      data.alt = document.getElementById('alt').value;
      data.caption = document.getElementById('caption').value || null;
      break;
    case 'question':
      data.question = document.getElementById('question').value;
      const optionsValue = document.getElementById('options').value.trim();
      data.options = optionsValue ? optionsValue.split('\n').map(opt => opt.trim()).filter(opt => opt) : [];
      data.answer = document.getElementById('answer').value;
      break;
    case 'code':
      data.language = document.getElementById('language').value;
      data.code = document.getElementById('code').value;
      data.caption = document.getElementById('caption').value || null;
      break;
  }

  return data;
}

function savePresentation() {
  try {
    localStorage.setItem('slideData', JSON.stringify(slideData));
    showToast('Presentation saved successfully!', 'success');
  } catch (error) {
    showToast('Failed to save presentation', 'error');
  }
}

function loadPresentation() {
  try {
    const saved = localStorage.getItem('slideData');
    if (saved) {
      slideData = JSON.parse(saved);
      selectedSlideIndex = -1;
      renderSlides();
      showToast('Presentation loaded successfully!', 'success');
    } else {
      showToast('No saved presentation found', 'warning');
    }
  } catch (error) {
    showToast('Failed to load presentation', 'error');
  }
}

function showToast(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: var(--space-lg);
    right: var(--space-lg);
    background: var(--surface);
    color: var(--text);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-toast);
    animation: slideIn var(--transition-normal) ease-out;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut var(--transition-normal) ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Enhanced keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in form fields
    if (e.target.matches('input, textarea, select')) return;

    // Don't trigger shortcuts when modals are open
    if (document.querySelector('.modal:not(.hidden)')) return;

    switch (e.key) {
      case '?':
        e.preventDefault();
        openModal('help-modal');
        break;
      case '1':
        e.preventDefault();
        showAddForm('title');
        break;
      case '2':
        e.preventDefault();
        showAddForm('text');
        break;
      case '3':
        e.preventDefault();
        showAddForm('image');
        break;
      case '4':
        e.preventDefault();
        showAddForm('question');
        break;
      case '5':
        e.preventDefault();
        showAddForm('code');
        break;
      case 'F5':
        e.preventDefault();
        startPresentation(false);
        break;
      case 'Delete':
        if (selectedSlideIndex >= 0) {
          e.preventDefault();
          document.querySelector(`[data-index="${selectedSlideIndex}"] .delete-slide`)?.click();
        }
        break;
    }

    // Ctrl/Cmd combinations
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          savePresentation();
          break;
        case 'o':
          e.preventDefault();
          loadPresentation();
          break;
        case 'd':
          if (selectedSlideIndex >= 0) {
            e.preventDefault();
            duplicateSlide();
          }
          break;
      }
    }
  });
}

let currentSlideIndex = 0;
let autoPlayInterval = null;

function startPresentation(autoPlay = false) {
  if (slideData.slides.length === 0) {
    showToast('No slides to present!', 'warning');
    return;
  }

  currentSlideIndex = 0;

  // Create presentation container
  const presentationMode = document.createElement('div');
  presentationMode.classList.add('presentation-mode');
  presentationMode.id = 'presentation-mode';

  // Create slide container
  const slideContainer = document.createElement('div');
  slideContainer.classList.add('presentation-slide');
  slideContainer.id = 'presentation-slide';

  // Create controls with improved styling
  const controls = document.createElement('div');
  controls.classList.add('presentation-controls');
  controls.innerHTML = `
    <button id="prev-slide" aria-label="Previous slide">← Prev</button>
    <button id="next-slide" aria-label="Next slide">Next →</button>
    <button id="auto-play" aria-label="Toggle auto play">Auto Play</button>
    <button id="exit-presentation" aria-label="Exit presentation">Exit</button>
  `;

  // Add to DOM
  presentationMode.appendChild(slideContainer);
  document.body.appendChild(presentationMode);
  document.body.appendChild(controls);

  // Show first slide
  showPresentationSlide(currentSlideIndex);

  // Add event listeners
  document
    .getElementById('prev-slide')
    .addEventListener('click', previousSlide);
  document.getElementById('next-slide').addEventListener('click', nextSlide);
  document
    .getElementById('auto-play')
    .addEventListener('click', toggleAutoPlay);
  document
    .getElementById('exit-presentation')
    .addEventListener('click', exitPresentation);

  // Add keyboard navigation
  document.addEventListener('keydown', handlePresentationKeydown);

  // Start auto-play if requested
  if (autoPlay) {
    toggleAutoPlay();
  }

  // Add escape on click outside
  presentationMode.addEventListener('click', (e) => {
    if (e.target === presentationMode) {
      exitPresentation();
    }
  });
}

function toggleAutoPlay() {
  const autoPlayBtn = document.getElementById('auto-play');

  if (autoPlayInterval) {
    // Stop auto-play
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
    autoPlayBtn.textContent = 'Auto Play';
  } else {
    // Start auto-play
    autoPlayBtn.textContent = 'Stop Auto Play';
    autoPlayInterval = setInterval(() => {
      if (currentSlideIndex < slideData.slides.length - 1) {
        nextSlide();
      } else {
        // Stop at the end
        toggleAutoPlay();
      }
    }, 3000); // Change slide every 3 seconds
  }
}

function showPresentationSlide(index) {
  const slideContainer = document.getElementById('presentation-slide');
  const slide = slideData.slides[index];
  const slideObj = new Slide(slide.type, slide.data);

  // Add exit animation to current slide if it exists
  if (slideContainer.innerHTML.trim()) {
    slideContainer.classList.add('slide-exit');
    setTimeout(() => {
      slideContainer.innerHTML = slideObj.getSlide();
      slideContainer.classList.remove('slide-exit');
      slideContainer.classList.add('slide-enter');
      setTimeout(() => {
        slideContainer.classList.remove('slide-enter');
      }, 300);
    }, 300);
  } else {
    slideContainer.innerHTML = slideObj.getSlide();
    slideContainer.classList.add('slide-enter');
    setTimeout(() => {
      slideContainer.classList.remove('slide-enter');
    }, 300);
  }

  // Update buttons state
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) nextBtn.disabled = index === slideData.slides.length - 1;

  // Update slide counter if it exists
  updatePresentationSlideCounter(index);
}

function updatePresentationSlideCounter(currentIndex) {
  const existingCounter = document.querySelector('.slide-counter');
  if (existingCounter) {
    existingCounter.textContent = `${currentIndex + 1} / ${slideData.slides.length}`;
  } else {
    // Add slide counter to presentation controls
    const controls = document.querySelector('.presentation-controls');
    if (controls) {
      const counter = document.createElement('div');
      counter.className = 'slide-counter';
      counter.textContent = `${currentIndex + 1} / ${slideData.slides.length}`;
      controls.appendChild(counter);
    }
  }
}

function nextSlide() {
  if (currentSlideIndex < slideData.slides.length - 1) {
    currentSlideIndex++;
    showPresentationSlide(currentSlideIndex);
  }
}

function previousSlide() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    showPresentationSlide(currentSlideIndex);
  }
}

function exitPresentation() {
  document.getElementById('presentation-mode')?.remove();
  document.querySelector('.presentation-controls')?.remove();
  document.removeEventListener('keydown', handlePresentationKeydown);

  // Clear auto-play if active
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

function handlePresentationKeydown(e) {
  switch (e.key) {
    case 'ArrowRight':
    case ' ':
      e.preventDefault();
      nextSlide();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      previousSlide();
      break;
    case 'Escape':
      exitPresentation();
      break;
    case 'f':
    case 'F':
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      break;
  }
}

function updateAspectRatio() {
  const ratio = document.getElementById('aspect-ratio').value;
  document.documentElement.style.setProperty('--aspect-ratio', ratio);
}

function loadSamplePresentation() {
  // Load the sample presentation data
  slideData = JSON.parse(JSON.stringify(samplePresentationData));
  selectedSlideIndex = -1;
  renderSlides();

  // Start presentation with auto-play after a short delay
  setTimeout(() => {
    startPresentation(true);
  }, 500);
}

function init() {
  const presentation = document.querySelector('.slides-container');
  if (!presentation) return;

  // Setup all the enhanced features
  setupModalHandlers();
  setupHelpTabs();
  setupViewModes();
  setupKeyboardShortcuts();

  // Auto-start the demo presentation immediately
  loadSamplePresentation();

  // Attach event listeners to control buttons
  document
    .getElementById('add-title-slide')
    ?.addEventListener('click', () => showAddForm('title'));
  document
    .getElementById('add-text-slide')
    ?.addEventListener('click', () => showAddForm('text'));
  document
    .getElementById('add-image-slide')
    ?.addEventListener('click', () => showAddForm('image'));
  document
    .getElementById('add-question-slide')
    ?.addEventListener('click', () => showAddForm('question'));
  document
    .getElementById('add-code-slide')
    ?.addEventListener('click', () => showAddForm('code'));
  document
    .getElementById('save-presentation')
    ?.addEventListener('click', savePresentation);
  document
    .getElementById('load-presentation')
    ?.addEventListener('click', loadPresentation);
  document
    .getElementById('start-presentation')
    ?.addEventListener('click', () => startPresentation(false));

  // Enhanced action buttons
  document
    .getElementById('clear-all')
    ?.addEventListener('click', clearAllSlides);
  document
    .getElementById('duplicate-slide')
    ?.addEventListener('click', duplicateSlide);

  // Add demo button functionality  
  const controls = document.querySelector('.controls');
  if (controls) {
    const demoButton = document.createElement('button');
    demoButton.className = 'control-btn';
    demoButton.innerHTML = `
      <span class="btn-icon">🎬</span>
      <span class="btn-text">Demo</span>
    `;
    demoButton.addEventListener('click', loadSamplePresentation);
    controls.appendChild(demoButton);
  }

  // Aspect ratio control
  document
    .getElementById('aspect-ratio')
    ?.addEventListener('change', updateAspectRatio);

  renderSlides();

  // Auto-start demo if URL has ?demo parameter
  if (window.location.search.includes('demo')) {
    loadSamplePresentation();
  }
}
