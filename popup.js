const storageKey = 'coronalgium';
const container = document.querySelector('.container');
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.results');

const cases = document.querySelector('.cases');
const recovered = document.querySelector('.recovered');
const deaths = document.querySelector('.deaths');
const tests = document.querySelector('.tests');
const previousCases = document.querySelector('.previousCases');
const previousDeaths = document.querySelector('.previousDeaths');
const todayCases = document.querySelector('.todayCases');
const todayDeaths = document.querySelector('.todayDeaths');

results.style.display = 'none';
loading.style.display = 'none';
errors.textContent = '';
previousCases.textContent = 'N/A';
previousDeaths.textContent = 'N/A';

window.onload = () => {
  loading.style.display = 'block';
  errors.textContent = '';

  const stored = localStorage.getItem(storageKey);
  let data = null;
  if (stored) {
    data = JSON.parse(stored);
  }
  loading.style.display = 'none';

  if (data === null || data.error) {
    loading.style.display = 'none';
    results.style.display = 'none';
    errors.textContent = data.error || 'No data found';
  } else {
    previousCases.textContent = format(parseInt(data.previousCases)) ?? 'N/A';
    previousDeaths.textContent = format(parseInt(data.previousDeaths)) ?? 'N/A';

    todayCases.textContent = format(data.todayCases);
    todayDeaths.textContent = format(data.todayDeaths);
    cases.textContent = format(data.cases);
    recovered.textContent = format(data.recovered);
    deaths.textContent = format(data.deaths);
    tests.textContent = format(data.totalTests);

    results.style.display = 'block';
    container.style.borderColor = data.isPositiveChange ? 'green' : 'red';
    
    todayCases.style.color = data.isPositiveChange ? 'green' : 'red';
    todayCases.style.fontWeight = 'bold';
    
    todayDeaths.style.color = data.isPositiveChange ? 'green' : 'red';
    todayDeaths.style.fontWeight = 'bold';
  }
};

function format(x) {
  if (isNaN(x)) return null;
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}