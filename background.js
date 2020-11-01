const storageKey = 'coronalgium';
const api = 'https://coronavirus-19-api.herokuapp.com/countries/belgium';

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
  console.dir(chrome);

  console.log('start HTTP Request...');
  
  try {
    const response = await fetch(api);
    const data = await response.text();
    if (data === 'Country not found') {
      localStorage.setItem(storageKey, JSON.stringify({ error: 'An error occured while trying to get data' }));
      
      throw new Error(message);
    }
    const body = JSON.parse(data);

    const isPositiveChange = false;
    chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' });
    
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.todayCases > body.todayCases) {
        chrome.browserAction.setBadgeBackgroundColor({ color: '008000' });
        isPositiveChange = true;
      } else {
        chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' });
      }
    }

    localStorage.setItem(storageKey, JSON.stringify({ ...body, isPositiveChange }));
    chrome.browserAction.setBadgeText({ text: body.todayCases.toString() });
  }
  catch (error) {
    console.error(error);
  } 
  finally {
    console.log('end HTTP Request...');
  }
}
