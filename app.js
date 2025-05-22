// ======================
// Portfolio-Server (app.js)
// ======================
// Dieses Programm startet einen kleinen Webserver für deine Portfolio-Website.
// Die Kommentare erklären jeden Schritt, damit du alles leicht anpassen kannst!
//
// TIPP: Du kannst diesen Server lokal auf deinem Rechner oder im Netzwerk nutzen.
// Wenn du etwas änderst, musst du den Server neu starten (Strg+C, dann wieder "node app.js").

// ===============================
// BENÖTIGTE MODULE LADEN
// ===============================
// Express ist ein "Werkzeugkasten" für Webseiten. Damit kann man schnell einen Server bauen.
const express = require('express');
// fs ist ein Werkzeug, um Dateien auf dem Computer zu lesen und zu speichern (z.B. für Nachrichten).
const fs = require('fs');
// path hilft uns, Dateipfade richtig zusammenzusetzen (funktioniert auf jedem Betriebssystem gleich).
const path = require('path');
// Wir erstellen unsere "App" (unseren Server). Alles, was wir mit "app." machen, steuert den Server.
const app = express();

// ===============================
// KONFIGURATION: PORT UND HOSTNAME
// ===============================
// Die Portnummer ist wie eine "Türnummer" am Computer. Hier: 3000.
// Wenn du mehrere Webseiten auf dem gleichen Rechner hast, braucht jede einen anderen Port!
const port = 3000;
// hostname '0.0.0.0' bedeutet: Alle Geräte im Netzwerk dürfen zugreifen.
// Wenn du nur lokal testen willst, kannst du auch 'localhost' nehmen.
const hostname = 'localhost'; // Lauscht nur auf localhost (127.0.0.1), NICHT im Netzwerk!

// ===============================
// NACHRICHTEN: MAXIMALE ANZAHL
// ===============================
// Hier legen wir fest, wie viele Nachrichten (Notizzettel) maximal gespeichert werden.
// Das sorgt dafür, dass die Datei nicht zu groß wird und auf der Website immer nur die letzten 9 angezeigt werden.
const MAX_MESSAGES = 9; // 3x3 Kacheln auf der Website

// ===============================
// MIDDLEWARE: DATEN VERSTEHEN UND STATISCHE DATEIEN LADEN
// ===============================
// Damit der Server versteht, was aus dem Browser geschickt wird (z.B. Nachrichten als JSON).
app.use(express.json({limit: '10mb'}));
// Damit die Website-Dateien (HTML, CSS, Bilder, JS) aus dem "public"-Ordner geladen werden können.
// Alles, was in "public" liegt, ist direkt im Browser erreichbar.
app.use(express.static(path.join(__dirname, 'public')));

// ===============================
// NACHRICHTEN-DATEI VORBEREITEN
// ===============================
// Hier speichern wir alle Nachrichten in einer Datei namens messages.json.
// Die Datei liegt immer im gleichen Ordner wie app.js.
const messagesFile = path.join(__dirname, 'messages.json');

// Prüfe: Gibt es die Datei schon? Falls nicht, erstelle sie als leere Liste.
if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, JSON.stringify([]));
}
// TIPP: Die Nachrichten werden als JSON gespeichert. Du kannst die Datei mit einem Texteditor anschauen.

// ===============================
// API: NACHRICHTEN ABRUFEN
// ===============================
// GET /api/messages
// Wenn jemand im Browser oder per JavaScript /api/messages aufruft, bekommt er alle gespeicherten Nachrichten als JSON zurück.
app.get('/api/messages', (req, res) => {
    // Lese die Datei (messages.json) und schicke den Inhalt als Antwort zurück
    const messages = JSON.parse(fs.readFileSync(messagesFile));
    res.json(messages); // Antwort im JSON-Format
});

// ===============================
// API: NEUE NACHRICHT SPEICHERN
// ===============================
// POST /api/messages
// Wenn jemand eine neue Nachricht (z.B. ein gezeichneter Zettel) schickt, wird sie gespeichert.
app.post('/api/messages', (req, res) => {
    // Lese alle bisherigen Nachrichten aus der Datei
    const messages = JSON.parse(fs.readFileSync(messagesFile));
    // Die neue Nachricht kommt aus dem Browser (req.body)
    const newMessage = req.body;
    
    // Die neue Nachricht kommt nach ganz vorne (oben auf dem Notizzettel-Stapel)
    messages.unshift(newMessage);
    
    // Wenn es jetzt zu viele Nachrichten sind, entferne die älteste (ganz unten)
    if (messages.length > MAX_MESSAGES) {
        messages.pop();
    }
    
    // Speichere die neue Nachrichtenliste wieder in die Datei
    fs.writeFileSync(messagesFile, JSON.stringify(messages));
    
    // Sag dem Browser: Hat geklappt! (Status 201 = erstellt)
    res.status(201).json({success: true});
});


// ===============================
// SERVER STARTEN
// ===============================
// Jetzt startet der Server! Danach kannst du die Seite im Browser öffnen (z.B. http://localhost:3000)
app.listen(port, hostname, () => {
    // Zeige im Terminal an, dass der Server läuft
    console.log(`Server läuft nur lokal auf http://${hostname}:${port}`);
    // Achtung: Andere Geräte im Netzwerk können NICHT darauf zugreifen!
});
// TIPP: Wenn du den Server beenden willst: Im Terminal Strg+C drücken.
// Wenn du etwas am Code änderst, musst du den Server neu starten, damit die Änderungen wirken.