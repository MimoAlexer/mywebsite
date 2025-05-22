// =============================
// script.js – Interaktive Zeichenfläche und Nachrichten
// =============================
// Diese Datei steuert die Zeichenfläche (Canvas) und die Kommunikation mit dem Server.
// Die Kommentare erklären jeden Schritt, damit du alles leicht anpassen kannst!

// Warte, bis die ganze Seite geladen ist, bevor das Skript startet
// (damit alle Elemente im HTML existieren)
document.addEventListener('DOMContentLoaded', function() {
    // ===============================
    // Zeichenfläche (Canvas) vorbereiten
    // ===============================
    // Hole das Canvas-Element aus dem HTML (muss dort ein <canvas id="drawing-canvas"> geben)
    const canvas = document.getElementById('drawing-canvas');
    // Der "ctx" ist der Stift, mit dem wir auf das Canvas malen
    const ctx = canvas.getContext('2d');
    
    // Fülle das Canvas am Anfang mit weißem Hintergrund
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Hier werden Zeichen-Infos gespeichert:
    let isDrawing = false; // Ist der Stift gerade unten?
    let lastX = 0; // Letzte X-Position der Maus
    let lastY = 0; // Letzte Y-Position der Maus
    let currentColor = '#000000'; // Aktuelle Zeichenfarbe (schwarz)
    
    // ===============================
    // Farbauswahl-Button
    // ===============================
    // Wenn jemand eine neue Farbe auswählt, wird die Zeichenfarbe geändert
    document.getElementById('color-picker').addEventListener('input', (e) => {
        currentColor = e.target.value; // Neue Farbe übernehmen
    });
    
    // ===============================
    // "Löschen"-Button
    // ===============================
    // Wenn jemand auf "Löschen" klickt, wird das Canvas wieder weiß
    document.getElementById('clear-btn').addEventListener('click', () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    
    // ===============================
    // "Absenden"-Button
    // ===============================
    // Wenn jemand auf "Absenden" klickt, wird das Bild gespeichert und an den Server geschickt
    document.getElementById('submit-btn').addEventListener('click', () => {
        // Zeichnung als Bild speichern (PNG-Format als Text)
        const imageData = canvas.toDataURL('image/png');
        
        // Erstelle ein Nachrichten-Objekt mit Bild, Zeit und Zufallsrotation
        const now = new Date();
        const message = {
            imageData: imageData, // Das Bild (als Text)
            timestamp: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, // Zeitstempel
            rotation: Math.random() * 40 - 20 // Zufällige Drehung für "Zettel-Look"
        };
        
        // Sende die Nachricht an den Server
        submitMessage(message);
        
        // Setze das Canvas zurück (wieder weiß)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    
    // ===============================
    // Zeichenfunktionen (Maus)
    // ===============================
    // Wird aufgerufen, wenn der Benutzer mit der Maus auf das Canvas klickt
    function startDrawing(e) {
        isDrawing = true; // Jetzt wird gezeichnet
        [lastX, lastY] = [e.offsetX, e.offsetY]; // Startpunkt merken
    }
    
    // Wird aufgerufen, wenn die Maus bewegt wird
    function draw(e) {
        if (!isDrawing) return; // Nur zeichnen, wenn die Maustaste gedrückt ist
        
        ctx.beginPath(); // Starte neue Linie
        ctx.moveTo(lastX, lastY); // Gehe zum letzten Punkt
        ctx.lineTo(e.offsetX, e.offsetY); // Zeichne zur aktuellen Position
        ctx.lineWidth = 3; // Dicke der Linie (kannst du ändern)
        ctx.lineCap = 'round'; // Runde Linienenden
        ctx.strokeStyle = currentColor; // Farbe benutzen
        ctx.stroke(); // Linie zeichnen
        [lastX, lastY] = [e.offsetX, e.offsetY]; // Merke neue Position
    }
    
    // Wird aufgerufen, wenn die Maustaste losgelassen wird oder die Maus das Canvas verlässt
    function stopDrawing() {
        isDrawing = false; // Zeichnen beenden
    }
    
    // ===============================
    // Maus-Events mit der Zeichenfläche verbinden
    // ===============================
    // Wenn die Maus gedrückt wird, zeichnen starten
    canvas.addEventListener('mousedown', startDrawing);
    // Wenn die Maus bewegt wird, zeichnen
    canvas.addEventListener('mousemove', draw);
    // Wenn die Maus losgelassen wird oder das Canvas verlässt, zeichnen stoppen
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // ===============================
    // Touch-Events (für Handy/Tablet)
    // ===============================
    // Hilfsfunktion: Berechnet die Position des Fingers auf dem Canvas
    function getTouchPos(canvasDom, touchEvent) {
        const rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    }
    
    // Zeichnen starten, wenn der Finger auf das Canvas kommt
    function touchStart(e) {
        e.preventDefault(); // Standardverhalten verhindern (z.B. Scrollen)
        const touchPos = getTouchPos(canvas, e);
        startDrawing({offsetX: touchPos.x, offsetY: touchPos.y});
    }
    
    // Zeichnen, wenn der Finger bewegt wird
    function touchMove(e) {
        e.preventDefault();
        const touchPos = getTouchPos(canvas, e);
        draw({offsetX: touchPos.x, offsetY: touchPos.y});
    }
    
    // Touch-Events mit dem Canvas verbinden
    canvas.addEventListener('touchstart', touchStart);
    canvas.addEventListener('touchmove', touchMove);
    canvas.addEventListener('touchend', stopDrawing);
    
    // ===============================
    // Nachricht an den Server schicken
    // ===============================
    // Diese Funktion schickt das Bild und die Infos an den Server
    async function submitMessage(message) {
        try {
            const response = await fetch('/api/messages', {
                method: 'POST', // Sende eine POST-Anfrage
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message) // Nachricht als Text schicken
            });
            
            if (response.ok) {
                // Wenn das Senden geklappt hat, lade die Nachrichten neu
                loadMessages();
            }
        } catch (error) {
            console.error('Fehler beim Senden der Nachricht:', error);
        }
    }
    
    // ===============================
    // Nachrichten vom Server laden und anzeigen
    // ===============================
    async function loadMessages() {
        try {
            // Hole alle Nachrichten vom Server (GET-Anfrage)
            const response = await fetch('/api/messages');
            const messages = await response.json();
            
            // Leere die Pinnwand (damit nichts doppelt ist)
            const messagesPile = document.getElementById('messages-pile');
            messagesPile.innerHTML = '';
            
            // Für jede Nachricht ein "Zettel" anzeigen
            messages.forEach(message => {
                const note = document.createElement('div');
                note.className = 'message-note';
                note.style.transform = `rotate(${message.rotation}deg)`;
                
                // Bild anzeigen
                const img = document.createElement('img');
                img.src = message.imageData;
                img.alt = 'User message';
                note.appendChild(img);
                
                // Zeitstempel anzeigen
                const timestamp = document.createElement('div');
                timestamp.className = 'note-timestamp';
                timestamp.textContent = message.timestamp;
                note.appendChild(timestamp);
                
                messagesPile.appendChild(note);
            });
            
        } catch (error) {
            console.error('Fehler beim Laden der Nachrichten:', error);
        }
    }
    
    // ===============================
    // Beim Laden der Seite sofort Nachrichten anzeigen
    // ===============================
    loadMessages(); // Holt die bisherigen Nachrichten von Anfang an
});