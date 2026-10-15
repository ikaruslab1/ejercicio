import fs from 'fs';

function parseCSV(text) {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(current.trim());
      if (row.length > 1 || row[0] !== '') {
        rows.push(row);
      }
      row = [];
      current = '';
    } else {
      current += c;
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

const csv = fs.readFileSync('public/Min-Max_Program_5x.xlsx - 5x Per Week.csv', 'utf8');
const rows = parseCSV(csv);
console.log('Total parsed rows:', rows.length);

let currentWeek = 0;
let currentDay = '';
const weekDays = {};

for (let r = 0; r < rows.length; r++) {
  const row = rows[r];
  const col1 = row[1] || '';
  if (col1.startsWith('Week ')) {
    currentWeek = parseInt(col1.replace('Week ', ''));
    weekDays[currentWeek] = {};
    continue;
  }
  const dayCol = row[1];
  if (dayCol && (dayCol.includes('Upper') || dayCol.includes('Lower') || dayCol.includes('Arms') || dayCol.includes('Rest'))) {
    currentDay = dayCol;
    if (!weekDays[currentWeek]) weekDays[currentWeek] = {};
    if (!weekDays[currentWeek][currentDay]) weekDays[currentWeek][currentDay] = [];
  }
  const exerciseName = row[2];
  if (exerciseName && exerciseName !== 'Exercise' && currentWeek > 0 && currentDay && !currentDay.includes('Rest')) {
    weekDays[currentWeek][currentDay].push({
      exercise: exerciseName,
      intensity: row[3] || 'N/A',
      warmup: row[4] || '',
      workingSets: row[5] || '2',
      repRange: row[6] || '',
      load1: row[7] || '',
      reps1: row[8] || '',
      load2: row[9] || '',
      reps2: row[10] || '',
      rir1: row[11] || '',
      rir2: row[12] || '',
      rest: row[13] || '',
      sub1: row[14] || '',
      sub2: row[15] || '',
      notes: row[16] || ''
    });
  }
}

for (let w = 1; w <= 12; w++) {
  const days = Object.keys(weekDays[w] || {});
  console.log(`Week ${w}: ${days.length} days -> ${days.map(d => `${d} (${weekDays[w][d].length})`).join(', ')}`);
}

// Check unique exercises across all weeks
const uniqueExercises = new Set();
for (let w = 1; w <= 12; w++) {
  for (const d in weekDays[w] || {}) {
    weekDays[w][d].forEach(ex => uniqueExercises.add(ex.exercise));
  }
}
console.log('Total unique exercises across all 12 weeks:', uniqueExercises.size);
console.log('List:', Array.from(uniqueExercises));

// Check notes and substitutions consistency across weeks
const exerciseCatalog = {};
for (let w = 1; w <= 12; w++) {
  for (const d in weekDays[w] || {}) {
    weekDays[w][d].forEach(ex => {
      if (!exerciseCatalog[ex.exercise]) {
        exerciseCatalog[ex.exercise] = {
          exercise: ex.exercise,
          sub1: ex.sub1,
          sub2: ex.sub2,
          notes: ex.notes,
          rest: ex.rest,
          warmup: ex.warmup
        };
      }
    });
  }
}

console.log('\n--- EXERCISE CATALOG (33 exercises) ---');
for (const [name, data] of Object.entries(exerciseCatalog)) {
  console.log(`[${name}] Warmup: ${data.warmup} | Rest: ${data.rest} | Sub1: ${data.sub1} | Sub2: ${data.sub2}`);
  console.log(`  Notes: ${data.notes.substring(0, 70)}...`);
}

// Analyze what changes per week
console.log('\n--- VARIATIONS ACROSS WEEKS ---');
for (let w = 1; w <= 12; w++) {
  const sample = weekDays[w]['Upper 1'][0];
  const samplePec = weekDays[w]['Upper 1'][1];
  console.log(`Week ${w}: Incline Press RIR1=${sample.rir1}, RIR2=${sample.rir2}, Int=${sample.intensity} | Pec Deck Int=${samplePec.intensity}, RIR1=${samplePec.rir1}, RIR2=${samplePec.rir2}`);
}

// Let's check rep ranges across weeks
let repRangeChanges = false;
for (let w = 2; w <= 12; w++) {
  for (const d of Object.keys(weekDays[1])) {
    for (let i = 0; i < weekDays[1][d].length; i++) {
      if (weekDays[w][d][i].repRange !== weekDays[1][d][i].repRange) {
        console.log(`Rep range changed in W${w} ${d} ${weekDays[1][d][i].exercise}: ${weekDays[1][d][i].repRange} -> ${weekDays[w][d][i].repRange}`);
        repRangeChanges = true;
      }
    }
  }
}
if (!repRangeChanges) console.log('Rep ranges are identical across all weeks!');


