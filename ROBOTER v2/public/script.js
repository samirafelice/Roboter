let currentStep = 0;
let inactivityTimer;

function startInteraction() {
  currentStep++;
  updateProgress(currentStep);
  showStepButton(currentStep);
  resetAfterInactivity();
}

function showStepButton(step) {
  const labels = {
    1: 'Roboter begrüßen',
    2: 'Wie geht es dir heute?',
    3: 'Magst du mich?'
  };

  document.getElementById('step-container').innerHTML = `
    <button onclick="startLoading(${step})">${labels[step]}</button>
  `;
  resetAfterInactivity();
}

function startLoading(step) {
  currentStep = step;
  updateProgress(step);

  document.getElementById('step-container').innerHTML = `
    <p style="font-size: 20px;">🤖 Roboter überlegt ...</p>
    <div class="spinner"></div>
  `;

  setTimeout(() => showOptions(step), 5000);
  resetAfterInactivity();
}

function showOptions(step) {
  const questionText = {
    1: 'Wie interpretierst du die Begrüßung des Roboters?',
    2: 'Wie geht es dem Roboter heute?',
    3: 'Mag der Roboter dich?'
  }[step];

  const html = `
    <h2>${questionText}</h2>
    <div class="option-buttons">
      ${[1, 2, 3, 4, 5].map(i =>
        `<button onclick="selectOption(${i})">Option ${i}</button>`
      ).join('')}
    </div>
    <div class="chart-container">
      <canvas id="chart" width="200" height="200"></canvas>
    </div>
  `;

  document.getElementById('step-container').innerHTML = html;
  resetAfterInactivity();
}

async function selectOption(option) {
  resetAfterInactivity();

  await fetch('/api/response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step: currentStep, option })
  });

  showChart(currentStep);

  let nextHtml = '';
  if (currentStep < 3) {
    nextHtml = `<br><button onclick="startInteraction()">Weiter</button>`;
  } else {
    nextHtml = `<br><button onclick="resetToStart()">Zurück zum Start</button>`;
  }

  document.getElementById('step-container').innerHTML += nextHtml;
}

async function showChart(step) {
  const res = await fetch('/api/responses');
  const data = await res.json();
  const counts = [0, 0, 0, 0, 0];
  data[`step${step}`].forEach(i => counts[i - 1]++);

  const ctx = document.getElementById('chart').getContext('2d');
  if (window.pieChart) window.pieChart.destroy();
  window.pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
      datasets: [{
        data: counts,
        backgroundColor: ['#ccae4d', '#efcaca', '#88a3a9', '#cd422d', '#f6f1e2']
      }]
    }
  });
}

function resetAfterInactivity() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    document.getElementById('reset-overlay').style.display = 'flex';
  }, 60000); // 60 Sekunden
}

function resetToStart() {
  document.getElementById('reset-overlay').style.display = 'none';
  currentStep = 0;
  startInteraction();
}

window.resetToStart = resetToStart;

function updateProgress(step) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`step-${i}`);
    el.classList.remove('done', 'active');
    if (i < step) {
      el.classList.add('done');
    } else if (i === step) {
      el.classList.add('active');
    }
  }
}

window.onload = () => {
  currentStep = 0;
  startInteraction();
};

// Global export
window.startInteraction = startInteraction;
window.selectOption = selectOption;

