/**
 * JSON Data Import / Export Backup Utility (§14)
 */

export function exportDataAsJSON(data, filename = 'orbitx-backup.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function importDataFromJSON(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      callback(null, parsed);
    } catch (err) {
      callback(err, null);
    }
  };
  reader.readAsText(file);
}
