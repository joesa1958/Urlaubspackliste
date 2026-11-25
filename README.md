# Urlaubspackliste

Packlisten für unsere Urlaube – fürs iPhone gemacht, auf Basis der [Wohnmobil-Checkliste](https://github.com/joesa1958/Wohnmobil-Checkliste).

- Startseite mit Gruppen und Listen (Symbol und Farbe je Liste frei wählbar)
- Packen im Walzen-Look: der aktuelle Punkt groß in der Mitte, davor und danach je zwei Nachbarn; Zurück, Weiter und Eingepackt darunter
- Kategorien sind die Abschnitte einer Liste; jeder Punkt kann eine Zuständigkeit haben (Jörg, Anne, Beide)
- Die Listen liegen in der gemeinsamen Dropbox unter `Apps/Wohnmobil-Checkliste/urlaubspackliste.json` (gleiche Dropbox-App wie die Checkliste). Beim ersten Start wird die „Packliste unsere Sachen“ einmalig in die erste Liste übernommen.
- Im öffentlichen Code stehen keine persönlichen Daten; ohne Dropbox-Verbindung zeigt die Seite nur „Verbindung zur Dropbox herstellen“.
- Veröffentlicht über GitHub Pages: https://joesa1958.github.io/Urlaubspackliste/

Dateien: `index.html`, `style.css`, `app.js`, Bilder und Icons. Keine weiteren Abhängigkeiten.


## Wo liegt was?

| Was | Wo |
|---|---|
| Programm (Code, Bilder, Icons) | GitHub-Repo `joesa1958/Urlaubspackliste` – öffentlich, enthält keine persönlichen Daten |
| Webseite | https://joesa1958.github.io/Urlaubspackliste/ (GitHub Pages, Branch `main`, Ordner `/`) |
| Listen und Punkte | Dropbox: `Apps/Wohnmobil-Checkliste/urlaubspackliste.json` |
| Dropbox-Zugang | Dropbox App Console (https://www.dropbox.com/developers/apps) → App **Wohnmobil-Checkliste**; gemeinsam genutzt mit der Wohnmobil-Checkliste |
| Anmeldung auf dem iPhone | nur lokal im Browser bzw. in der Home-Bildschirm-App (wird nicht gesichert) |
| Fortschritt beim laufenden Check/Packen | nur lokal auf dem jeweiligen iPhone |

## Auf einem neuen Gerät einrichten

1. In Safari https://joesa1958.github.io/Urlaubspackliste/ öffnen.
2. Teilen → **Zum Home-Bildschirm**, dann über das neue Symbol öffnen.
3. **Verbindung zur Dropbox herstellen** antippen, mit dem gemeinsamen Dropbox-Konto anmelden und erlauben. In der Home-Bildschirm-App den angezeigten Code kopieren und einfügen.
4. Fertig – die Listen kommen aus der Dropbox.

Bei Problemen mit der Anmeldung: In der App Console unter Settings → OAuth 2 → Redirect URIs muss `https://joesa1958.github.io/Urlaubspackliste/` stehen (genau so, mit Schrägstrich am Ende).

## Sicherung

- **Automatisch:** Die Datei `urlaubspackliste.json` liegt in der Dropbox. Dropbox hebt frühere Versionen auf (Datei im Dropbox-Web öffnen → „Versionsverlauf“) und kann gelöschte Dateien wiederherstellen.
- **Von Hand:** In der App unter Einstellungen → Sicherung → **Exportieren** speichert alle Listen als `.json`-Datei. **Importieren** spielt so eine Datei wieder ein (ersetzt alle Listen). Empfehlung: vor größeren Umbauten einmal exportieren.
- **Programm:** Der Code liegt vollständig auf GitHub. Wer ihn zusätzlich sichern will: im Repo → Code → **Download ZIP**.

## Wiederherstellen, falls etwas weg ist

- **Listen versehentlich gelöscht oder verändert:** im Dropbox-Web `Apps/Wohnmobil-Checkliste/urlaubspackliste.json` → Versionsverlauf → ältere Version wiederherstellen, oder eine exportierte Sicherung importieren. Danach in der App auf Aktualisieren tippen.
- **Webseite weg:** GitHub-Repo prüfen und unter Settings → Pages wieder `main` und `/ (root)` einstellen.
- **Dropbox-App weg:** neue App mit Zugriff „App-Ordner“ anlegen, Option „Öffentliche Clients zulassen“ einschalten, Redirect URIs beider Seiten eintragen, den neuen App-Key in `app.js` (`DROPBOX_APP_KEY`) beider Repos eintragen und die Datendateien in den neuen App-Ordner legen.
