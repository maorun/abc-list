---
name: feature
about: Feature Implementation für GitHub Copilot
title: 'Feature: [Feature Name aus features.md]'
labels: Copilot, enhancement
assignees: 'Copilot'

---

## 🎯 Aufgabe für GitHub Copilot

### Schritt 1: Feature-Auswahl

**Priorisierte Feature-Auswahl aus `features.md`:**

1. Wähle das **vielversprechendste Feature** mit der **höchsten Priorität** aus der Datei `/features.md`
2. Beachte die Priorisierung: **Hohe Priorität** → **Mittlere Priorität** → **Niedrige Priorität**
3. Falls `/features.md` leer ist oder keine Features mehr enthält:
   - Analysiere die bestehende Anwendung
   - Identifiziere sinnvolle Verbesserungen oder Erweiterungen basierend auf:
     - Bestehenden Funktionen, die erweitert werden können
     - User Experience Optimierungen
     - Performance-Verbesserungen
     - Accessibility-Verbesserungen
     - Mobile-First Design Optimierungen
   - Orientiere dich an den **Birkenbihl-Lernmethoden** und dem **pädagogischen Ansatz** der Anwendung
   - Dokumentiere das neue Feature-Konzept in einem Kommentar in diesem Issue

### Schritt 2: Entwicklung

**📚 WICHTIG: Befolge strikt die Richtlinien in `.github/copilot-instructions.md`**

Die `copilot-instructions.md` enthält:
- ⚠️ Mandatory Testing und Linting Workflow
- TypeScript Guidelines und Code Quality Requirements
- Mobile-First Design Principles
- Function Extraction Pattern für Production Performance
- Testing Guidelines und Best Practices
- Projektstruktur und Common Tasks

**Entwicklungs-Checkliste:**
- [ ] Feature aus `features.md` ausgewählt (oder neues Feature konzipiert, falls leer)
- [ ] `.github/copilot-instructions.md` vollständig gelesen und verstanden
- [ ] `AGENTS.md` für projekt-spezifische Konventionen konsultiert
- [ ] Tests geschrieben (TDD: Test-Driven Development)
- [ ] Feature implementiert mit TypeScript strict mode
- [ ] Function Extraction Pattern angewendet (siehe copilot-instructions.md)
- [ ] Mobile-First Design sichergestellt
- [ ] **MANDATORY:** `npm run test` ✅ (alle 516+ Tests bestehen)
- [ ] **MANDATORY:** `npm run lint` ✅ (0 Fehler, inkl. Markdown)
- [ ] **MANDATORY:** `npm run build` ✅ (Production Build erfolgreich)
- [ ] Dokumentation aktualisiert (`AGENTS.md` und `.github/copilot-instructions.md`)
- [ ] Feature aus `features.md` entfernt (falls dort vorhanden)

### Schritt 3: Nach der Implementierung

**Entferne das Feature aus `features.md`:**
- Lösche den entsprechenden Feature-Eintrag aus `/features.md`
- Erwähne **NICHT**, dass das Feature umgesetzt wurde
- Behalte die Struktur und Priorisierung bei

**Falls `features.md` komplett leer ist:**
- Behalte die Struktur der Datei (Header, Kategorien)
- Füge einen kurzen Hinweis hinzu: "Alle priorisierten Features sind implementiert. Neue Feature-Vorschläge können als GitHub Issues eingereicht werden."

## 📋 Wichtige Referenzen

- **Entwicklungsrichtlinien:** `.github/copilot-instructions.md` (VOLLSTÄNDIG LESEN!)
- **Projekt-Konventionen:** `AGENTS.md`
- **Feature-Liste:** `features.md`
- **Mandatory Workflow:** Test → Code → Lint (NIEMALS abweichen!)

## 🚨 CRITICAL REMINDERS

**Vor jedem Commit MUSS folgende Sequenz erfolgreich sein:**

```bash
npm run test   # MUSS bestehen (516+ Tests)
npm run lint   # MUSS 0 Fehler haben (inkl. Markdown Linting)
npm run build  # MUSS erfolgreich sein
```

**Alternative: Nutze das automatisierte Validierungs-Script:**

```bash
npm run validate:copilot  # Comprehensive validation mit colored output
```

## 💡 Hinweise zur Qualität

- **Keine `any` Types** - Wird automatisch durch CI geblockt
- **Keine ESLint disable comments** - Wird automatisch durch CI geblockt
- **Function Extraction Pattern** für Production Performance (siehe copilot-instructions.md)
- **Mobile-First Design** mit touch-friendly controls (min 44px)
- **TypeScript Strict Mode** mit allen enhanced flags
- **Comprehensive Testing** mit React Testing Library und Vitest

---

**Viel Erfolg bei der Implementierung! 🚀**