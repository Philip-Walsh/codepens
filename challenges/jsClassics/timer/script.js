class Timer {
  constructor() {
    this.time = 0;
  }

  start() {
    if (!intervalId) {
      intervalId = setInterval(() => {
        this.time++;
        this.updateDisplay();
      }, 1000);
    }
  }

  stop() {
    clearInterval(intervalId);
    intervalId = null;
  }

  reset() {
    this.time = 0;
    this.updateDisplay();
    this.stop();
  }

  updateDisplay() {
    const minutes = Math.floor(this.time / 60);
    const seconds = this.time % 60;

    this.animateFlip('H0', Math.floor(minutes / 10));
    this.animateFlip('H1', minutes % 10);
    this.animateFlip('M0', Math.floor(seconds / 10));
    this.animateFlip('M1', seconds % 10);
  }

  animateFlip(id, newVal) {
    const element = document.getElementById(id);
    const topHalf = element.querySelector('.digit-top');
    const bottomHalf = element.querySelector('.digit-bottom');

    if (topHalf.innerText !== newVal.toString()) {
      topHalf.innerText = newVal;
      bottomHalf.innerText = newVal;
      element.classList.remove('flip-change');
      void element.offsetWidth;
      element.classList.add('flip-change');
    }
  }
}

let intervalId;
let timer = new Timer();

document.addEventListener('DOMContentLoaded', init, false);

function init() {
  document.getElementById('start').addEventListener('click', () => timer.start());
  document.getElementById('stop').addEventListener('click', () => timer.stop());
  document.getElementById('reset').addEventListener('click', () => timer.reset());
  timer.start();
  const button = document.getElementById('start');

  setTimeout(() => {
    button.classList.add('active');
  }, 100);
  setTimeout(() => {
    button.classList.remove('active');
  }, 1000);
}
