// Kalam Companion — background service worker
// 1) Attributes active-tab time to domains every 5s (with hour-by-hour buckets).
// 2) Runs reminder + daily-limit alarms so notifications fire even when Kalam tabs are closed.

const TICK_ALARM = 'kalam-tick';
const REMINDER_ALARM = 'kalam-reminders';
const DAY_KEY = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local

const APP_NAMES = {
  'youtube.com': 'YouTube', 'youtu.be': 'YouTube', 'instagram.com': 'Instagram',
  'facebook.com': 'Facebook', 'netflix.com': 'Netflix', 'reddit.com': 'Reddit',
  'x.com': 'X', 'twitter.com': 'X', 'tiktok.com': 'TikTok', 'twitch.tv': 'Twitch',
  'hotstar.com': 'Hotstar', 'primevideo.com': 'Prime Video', 'snapchat.com': 'Snapchat',
  'pinterest.com': 'Pinterest', 'discord.com': 'Discord', 'spotify.com': 'Spotify',
  'whatsapp.com': 'WhatsApp', 'web.whatsapp.com': 'WhatsApp', 'docs.google.com': 'Google Docs',
  'github.com': 'GitHub', 'stackoverflow.com': 'Stack Overflow', 'khanacademy.org': 'Khan Academy',
};
function prettyDom(dom) {
  if (!dom) return 'that site';
  if (APP_NAMES[dom]) return APP_NAMES[dom];
  const base = dom.replace(/\.(com|org|net|io|co|in|dev|app|be|tv|live)$/, '').split('.').pop() || dom;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function domainOf(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.hostname.replace(/^www\./, '');
  } catch { return null; }
}

async function tick() {
  let win;
  try { win = await chrome.windows.getLastFocused({ populate: false }); } catch { return; }
  if (!win || !win.focused) return;
  const [tab] = await chrome.tabs.query({ active: true, windowId: win.id });
  if (!tab || !tab.url) return;
  const dom = domainOf(tab.url);
  if (!dom) return;

  const store = await chrome.storage.local.get(['screentime']);
  const st = store.screentime || {};
  const day = DAY_KEY();
  if (!st[day]) st[day] = { total: 0, apps: {}, hours: {} };
  if (!st[day].hours) st[day].hours = {};
  st[day].total += 5;
  st[day].apps[dom] = (st[day].apps[dom] || 0) + 5;
  const hr = new Date().getHours();
  st[day].hours[hr] = (st[day].hours[hr] || 0) + 5;
  st.cur = dom;
  st.curTs = Date.now();

  // keep 30 days
  const keys = Object.keys(st).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
  while (keys.length > 30) { delete st[keys.shift()]; }

  await chrome.storage.local.set({ screentime: st });
}

// ---- Reminders ----

function notify(title, body) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title,
    message: body,
    priority: 2,
  });
}

// ---- Daily app limits (StayFree-style) ----
// schedule.limits = { domain: minutes }, synced from the Kalam app.
// First notification right when the limit is crossed; a stronger, more
// frequent reminder once the user is 5+ minutes past it (more aggressive
// while that site is the active tab).
async function checkLimits(s) {
  const limits = s.limits || {};
  const doms = Object.keys(limits);
  if (!doms.length) return;
  const store = await chrome.storage.local.get(['screentime']);
  const st = store.screentime || {};
  const day = st[DAY_KEY()];
  if (!day || !day.apps) return;
  const now = Date.now();
  const lt = s.limitTs || {};
  const cur = (st.cur && now - (st.curTs || 0) < 3 * 60 * 1000) ? st.cur : null;

  for (const dom of doms) {
    const mins = parseInt(limits[dom], 10) || 0;
    if (mins <= 0) continue;
    const used = day.apps[dom] || 0;
    const over = used - mins * 60;
    if (over < 0) continue;
    const last = lt[dom] || 0;
    if (over < 5 * 60) {
      if (now - last > 30 * 60 * 1000) {
        notify('Kalam — limit reached', prettyDom(dom) + ' daily limit (' + mins + ' min) is used up. Time to wrap up.');
        lt[dom] = now;
      }
    } else {
      const cd = (cur === dom) ? 2 * 60 * 1000 : 15 * 60 * 1000;
      if (now - last > cd) {
        notify('Kalam — take a break', Math.round(over / 60) + ' min past the ' + prettyDom(dom) + ' limit.' + (cur === dom ? ' Close the tab and take a break.' : ''));
        lt[dom] = now;
      }
    }
  }
  s.limitTs = lt;
}

async function checkReminders() {
  const store = await chrome.storage.local.get(['schedule']);
  const s = store.schedule;
  if (!s) return;
  const now = new Date();
  const today = DAY_KEY();
  const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const fired = s.fired || {};

  // Hourly pending-items digest (fires at minute :00)
  if (s.hourly && now.getMinutes() === 0 && fired['hourly-' + now.getHours()] !== today) {
    const due = (s.tasks || []).filter(t => !t.done);
    const overdue = due.filter(t => t.dueDate && t.dueDate < today).length;
    const dueToday = due.filter(t => t.dueDate === today).length;
    const total = due.length;
    if (total > 0) {
      let body = total + ' pending item(s)';
      if (overdue) body += ' · ' + overdue + ' overdue';
      if (dueToday) body += ' · ' + dueToday + ' due today';
      notify('Kalam — items need attention', body);
    }
    fired['hourly-' + now.getHours()] = today;
  }

  // Journal reminder
  if (s.journalTime && hhmm === s.journalTime && fired.journal !== today) {
    if (s.lastJournalDate !== today) {
      notify('Kalam — Journal time', "You haven't written today's journal entry yet.");
    }
    fired.journal = today;
  }

  // Daily review
  if (s.dailyReviewTime && hhmm === s.dailyReviewTime && fired.review !== today) {
    notify('Kalam — Daily review', 'Take a minute to review your day: tasks, habits and goals.');
    fired.review = today;
  }

  // Study block reminders (10 min before start, and at start)
  for (const b of (s.studyBlocks || [])) {
    if (b.date !== today || !b.start) continue;
    const [bh, bm] = b.start.split(':').map(n => parseInt(n));
    const startMin = (bh || 0) * 60 + (bm || 0);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const diff = startMin - nowMin;
    if (diff <= 10 && diff > 0 && fired['sb-soon-' + b.id] !== today) {
      notify('Kalam — study session soon', (b.title || 'Study') + ' at ' + b.start);
      fired['sb-soon-' + b.id] = today;
    }
    if (diff <= 0 && diff > -5 && fired['sb-start-' + b.id] !== today) {
      notify('Kalam — study session now', 'Start: ' + (b.title || 'Study'));
      fired['sb-start-' + b.id] = today;
    }
  }

  // Exam reminders (day of exam + score entry 7 days after)
  for (const ex of (s.exams || [])) {
    if (ex.date === today && fired['exam-' + ex.id] !== today) {
      notify('Kalam — Exam today', ex.title + ' is today. Good luck!');
      fired['exam-' + ex.id] = today;
    }
    if (ex.date) {
      const scoreDay = new Date(ex.date + 'T12:00:00');
      scoreDay.setDate(scoreDay.getDate() + 7);
      const sd = scoreDay.toLocaleDateString('en-CA');
      if (sd === today && fired['score-' + ex.id] !== today) {
        notify('Kalam — Enter your score', 'It has been a week since "' + ex.title + '". Enter your marks in Kalam.');
        fired['score-' + ex.id] = today;
      }
    }
  }

  // Daily app limits
  try { await checkLimits(s); } catch (e) { /* non-fatal */ }

  s.fired = fired;
  await chrome.storage.local.set({ schedule: s });
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(TICK_ALARM, { periodInMinutes: 0.1 }); // ~6s, min allowed
  await chrome.alarms.create(REMINDER_ALARM, { periodInMinutes: 0.5 });
});

chrome.runtime.onStartup.addListener(async () => {
  await chrome.alarms.create(TICK_ALARM, { periodInMinutes: 0.1 });
  await chrome.alarms.create(REMINDER_ALARM, { periodInMinutes: 0.5 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TICK_ALARM) tick();
  if (alarm.name === REMINDER_ALARM) checkReminders();
});

// Messages from the Kalam page (via content script bridge)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'kalam:sync-schedule') {
    chrome.storage.local.get(['schedule']).then(store => {
      const prev = store.schedule || {};
      return chrome.storage.local.set({ schedule: { ...msg.payload, fired: prev.fired || {}, limitTs: prev.limitTs || {} } });
    }).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg && msg.type === 'kalam:get-screentime') {
    chrome.storage.local.get(['screentime']).then(store =>
      sendResponse({ ok: true, screentime: store.screentime || {} }));
    return true;
  }
  if (msg && msg.type === 'kalam:ping') {
    sendResponse({ ok: true, version: '1.2.0' });
    return false;
  }
});
