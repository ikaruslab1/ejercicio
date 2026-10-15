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

// Collect all 35 exercise entries for Week 1
const exercisesList = [];
let currentDay = '';

for (let r = 26; r < 65; r++) {
  const row = rows[r];
  if (!row) continue;
  if (row[1] && (row[1].includes('Upper') || row[1].includes('Lower') || row[1].includes('Arms'))) {
    currentDay = row[1];
  }
  const ex = row[2];
  if (ex && ex !== 'Exercise') {
    exercisesList.push({
      day: currentDay,
      name: ex,
      warmup: row[4],
      workingSets: parseInt(row[5]) || 2,
      repRange: row[6],
      rest: row[13],
      sub1: row[14],
      sub2: row[15],
      notes: row[16]
    });
  }
}

console.log(JSON.stringify(exercisesList, null, 2));
