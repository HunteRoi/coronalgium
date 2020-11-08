const storageKey = 'coronalgium';
const yesterdayStorageKey = 'coronalgium-yesterday';
const api = 'https://covid-193.p.rapidapi.com/history?country=belgium';
const redColor = '#FF0000';
const greenColor = '#008000';
const apiKey = '';

chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled....');
  scheduleRequest();
  scheduleWatchdog();
  startRequest();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('onStartup....');
  startRequest();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered', alarm);
  if (alarm && alarm.name === 'watchdog') {
    chrome.alarms.get('refresh', (alarm) => {
      if (alarm) {
        console.log('Refresh alarm exists. Yay.');
      } else {
        console.log('Refresh alarm does not exist, starting a new one');
        startRequest();
        scheduleRequest();
      }
    });
  } else {
    startRequest();
  }
});

function scheduleRequest() {
  console.log('schedule refresh alarm to 30 minutes...');
  chrome.alarms.create('refresh', { periodInMinutes: 30 });
}

function scheduleWatchdog() {
  console.log('schedule watchdog alarm to 5 minutes...');
  chrome.alarms.create('watchdog', { periodInMinutes: 5 });
}

async function startRequest() {
  console.group('HTTP Request');
  
  try {
    const today = await getCovidDataAsync();
    const yesterday = await getCovidDataAsync(true);

    const newData = {
      error: today === null || yesterday === null ? "No data found" : null,
      today,
      yesterday,
      isTodayCasesDecreasing: today.newCases <= yesterday.newCases,
      isTodayDeathsDecreasing: today.newDeaths <= yesterday.newDeaths,
      lastUpdate: today.datetime,
    };
    localStorage.setItem(storageKey, JSON.stringify(newData));

    if (newData.isTodayCasesDecreasing) {
      chrome.browserAction.setBadgeBackgroundColor({ color: greenColor });
    } else {
      chrome.browserAction.setBadgeBackgroundColor({ color: redColor });
    }
    chrome.browserAction.setBadgeText({ text: newData.today.newCases.toString() });

  }
  catch (error) {
    console.error(error);
    localStorage.setItem(storageKey, { error: "An error occured while trying to get the data." });
  } 
  finally {
    console.groupEnd();
  }
}

function getCached(date) {
  const stored = localStorage.getItem(yesterdayStorageKey);  
  if (!stored) return null;
  
  console.group('getCached');
  try {  
    const data = JSON.parse(stored);
    console.log(data);
    return (data && data.datetime && data.datetime.split('T')[0] === date) ? data : null;
  } 
  catch {
    return null;
  } 
  finally {
    console.groupEnd();
  }
}

async function getCovidDataAsync(yesterday = false) {
  console.group('getCovidDataAsync');

  const date = new Date();
  if (yesterday) {
    date.setDate(date.getDate() - 1);
    const data = getCached(date);
    if (data) {
      console.groupEnd();
      return data;
    }
  }

  let day;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    console.group('Content of localStorage');
    try {
      const data = JSON.parse(stored);
      day = yesterday ? data.yesterday : data.today;
      console.log("Content of stored data in case it is needed", day);
    }
    catch (e) { 
      console.error(e);
    }
    finally {
      console.groupEnd();
    }
  }

  const response = await requestAsync(date);
  console.log('Content of response before changes in case of error', response);
  if (day && ((Array.isArray(response.errors) && response.errors.length > 0) || response.results === 0)) {
    response.response = [ day ];
  }

  const formated = format(response.response[0]);
  if (yesterday) localStorage.setItem(yesterdayStorageKey, JSON.stringify(formated));

  console.groupEnd();
  return formated;
}

async function requestAsync(date) {
  console.group('requestAsync');
  
  const options = {
    "method": "GET",
    "headers": {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "covid-193.p.rapidapi.com"
    }
  };
  
  const response = await fetch(`${api}&day=${date.toISOString().split('T')[0]}`, options);
  console.log('Response from API', response);

  console.groupEnd();
  return response.json();
}

function format(data) {
  console.log('Content of response to format', data);

  if (data.newCases && data.newDeaths && data.datetime) return data;

  return {
    newCases: parseInt(data.cases.new),
    newDeaths: parseInt(data.deaths.new),
    totalCases: data.cases.total,
    totalRecovered: data.cases.recovered,
    totalDeaths: data.deaths.total,
    totalTests: data.tests.total,
    datetime: data.time
  };
}
