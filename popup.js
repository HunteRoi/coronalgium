const storageKey = 'coronalgium';
const container = document.querySelector('.container');
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.results');

const cases = document.querySelector('.cases');
const recovered = document.querySelector('.recovered');
const deaths = document.querySelector('.deaths');
const tests = document.querySelector('.tests');
const yesterdayCases = document.querySelector('.yesterdayCases');
const yesterdayDeaths = document.querySelector('.yesterdayDeaths');
const todayCases = document.querySelector('.todayCases');
const todayDeaths = document.querySelector('.todayDeaths');
const updatedOn = document.querySelector('.updatedOn');

results.style.display = 'none';
loading.style.display = 'none';
errors.textContent = '';
yesterdayCases.textContent = 'N/A';
yesterdayDeaths.textContent = 'N/A';
updatedOn.textContent = new Date().toISOString().split("T")[0];

window.onload = () => {
  loading.style.display = 'block';
  errors.textContent = '';

  const stored = localStorage.getItem(storageKey);
  let data = null;
  if (stored) data = JSON.parse(stored);
  loading.style.display = 'none';

  if (data === null || data.error) {
    loading.style.display = 'none';
    results.style.display = 'none';
    errors.textContent = data.error || 'No data found';
  } else {
    yesterdayCases.textContent = format(data.yesterday.newCases) ?? 'N/A';
    yesterdayDeaths.textContent = format(data.yesterday.newDeaths) ?? 'N/A';
    todayCases.textContent = format(data.today.newCases) ?? "N/A";
    todayDeaths.textContent = format(data.today.newDeaths) ?? "N/A";
    
    cases.textContent = format(data.today.totalCases);
    recovered.textContent = format(data.today.totalRecovered);
    deaths.textContent = format(data.today.totalDeaths);
    tests.textContent = format(data.today.totalTests);

    updatedOn.textContent = new Date(data.lastUpdate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    results.style.display = 'block';
    container.style.borderColor = data.isTodayCasesDecreasing && data.isTodayDeathsDecreasing ? 'green' : 'red';
    
    todayCases.style.color = data.isTodayCasesDecreasing ? 'green' : 'red';
    todayCases.style.fontWeight = 'bold';
    
    todayDeaths.style.color = data.isTodayDeathsDecreasing ? 'green' : 'red';
    todayDeaths.style.fontWeight = 'bold';
  }
};

function format(x) {
  if (isNaN(x)) return null;
  
  var str = `+${x}`;
  if (str.startsWith("+-")) str = str.substring(1);
  
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}