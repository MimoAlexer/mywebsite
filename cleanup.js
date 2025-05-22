// =============================
// cleanup.js – Nachrichten aufräumen
// =============================
// Dieses Skript sorgt dafür, dass in messages.json immer nur die neuesten Nachrichten (maximal MAX_MESSAGES) gespeichert sind.
// Die Kommentare erklären jeden Schritt, damit du alles leicht anpassen kannst!

// Das "fs" Modul hilft uns, Dateien zu lesen und zu schreiben
const fs = require('fs');
// Das "path" Modul hilft uns, Dateipfade richtig zusammenzusetzen (funktioniert auf jedem Betriebssystem)
const path = require('path');

// Hier einstellen, wie viele Nachrichten maximal gespeichert werden sollen
const MAX_MESSAGES = 9; // Du kannst die Zahl ändern, wenn du mehr/weniger willst

// Pfad zur Datei, in der die Nachrichten gespeichert sind
const messagesFile = path.join(__dirname, 'messages.json');

// Nachrichten aus der Datei lesen (als Text -> dann als Array)
const messages = JSON.parse(fs.readFileSync(messagesFile));

// Zeige im Terminal, wie viele Nachrichten gerade gespeichert sind
console.log(`Aktuelle Anzahl an Nachrichten: ${messages.length}`);

// Behalte nur die neuesten MAX_MESSAGES Nachrichten
// slice(0, MAX_MESSAGES) nimmt die ersten MAX_MESSAGES Einträge aus dem Array
const trimmedMessages = messages.slice(0, MAX_MESSAGES);

// Zeige im Terminal, wie viele Nachrichten jetzt noch übrig sind
console.log(`Neue Anzahl an Nachrichten: ${trimmedMessages.length}`);

// Schreibe die gekürzte Liste zurück in die Datei (überschreibt die alte Datei)
fs.writeFileSync(messagesFile, JSON.stringify(trimmedMessages));

console.log('Bereinigung abgeschlossen.');