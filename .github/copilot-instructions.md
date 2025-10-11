# ABC-List Learning Application

ABC-List is a React/TypeScript/Vite web application implementing Vera F. Birkenbihl's learning methodology with ABC-Lists, KaWa (word associations), KaGa (graphical associations), Mind-Map visualization, Stadt-Land-Fluss (quick knowledge retrieval game), Sokrates spaced repetition system with Interleaved Learning, Zahlen-Merk-System (Major-System for number memorization), and Template Library. This application helps users create learning materials using brain-compatible learning techniques with scientifically-backed retention optimization and pre-configured templates for quick start.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## ⚠️ CRITICAL REMINDER: MANDATORY TESTING AND LINTING WORKFLOW ⚠️

**🚫 NEVER FORGET: After ANY code changes, you MUST run tests and linting before committing!**

```bash
# MANDATORY after every code change:
npm run test    # ← MUST pass (516 tests) 
npm run lint    # ← MUST pass (0 errors)
npm run build   # ← MUST pass (production build)
```

**This is not optional - it prevents regressions and maintains code quality. If you skip this, you introduce bugs.**

## Working Effectively

### Prerequisites and Setup
- Node.js version 20+ and npm are required
- Repository uses React 19, TypeScript, Vite 7, and Tailwind CSS 4
- **Mobile-First Design**: Application follows mobile-first responsive design principles

### Bootstrap, Build, and Test Repository
**CRITICAL: All commands below have been validated to work. NEVER CANCEL any build or test command - set appropriate timeouts.**

1. **Install dependencies:**
   ```bash
   npm install
   ```
   - Takes approximately 3 minutes. NEVER CANCEL. Set timeout to 5+ minutes.
   - Downloads and installs 497+ packages
   - No security vulnerabilities expected

2. **Build the application:**
   ```bash
   npm run build
   ```
   - Takes approximately 2-3 seconds. Set timeout to 60+ seconds for safety.
   - Creates production build in `dist/` directory
   - Generates optimized CSS (~16KB) and JS (~245KB) bundles

3. **Run tests:**
   ```bash
   npm run test
   ```
   - Takes approximately 8 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
   - Runs 516 tests across test files using Vitest
   - All tests should pass - uses React Testing Library and Jest DOM

4. **Run test coverage:**
   ```bash
   npm run coverage
   ```
   - Takes approximately 8-10 seconds. Set timeout to 30+ seconds.
   - Generates coverage report with V8 provider
   - Current coverage: ~67% overall, components well-tested

### Development and Testing Workflow

1. **Start development server:**
   ```bash
   npm run dev
   ```
   - Starts in approximately 1 second
   - Available at `http://localhost:5173/` (note the base path)
   - Uses Vite with HMR for fast development

2. **Linting and formatting:**
   ```bash
   npm run lint          # Check ESLint rules (includes markdown linting via postlint)
   npm run lint:md       # Check markdown files specifically
   npm run format        # Auto-fix Prettier formatting
   npm run format:check  # Check formatting without fixing
   ```
   - Linting takes ~2-5 seconds. Set timeout to 30+ seconds.
   - Uses ESLint 9 with TypeScript, React, and accessibility rules
   - markdownlint-cli checks all markdown files for quality
   - Prettier configured with specific rules (no bracket spacing, double quotes, trailing commas)

## ⚠️ MANDATORY POST-DEVELOPMENT VALIDATION ⚠️

**🔴 CRITICAL: After making ANY code changes, you MUST run this validation sequence:**

```bash
# Step 1: Test (MUST pass all 516 tests)
npm run test

# Step 2: Lint (MUST have 0 errors) 
npm run lint

# Step 3: Build (MUST complete successfully)
npm run build
```

**If any of these steps fail, you MUST fix the issues before committing. No exceptions.**

**📝 Use this checklist for every development session:**
- [ ] Tests pass (`npm run test` - 516 tests)
- [ ] Linting passes (`npm run lint` - 0 errors, includes markdown linting)  
- [ ] Build succeeds (`npm run build`)
- [ ] Only then commit changes with `report_progress`

## Validation Scenarios

**ALWAYS manually test these scenarios after making changes to ensure full functionality:**

### 1. ABC-List Creation and Usage
- Navigate to main page (Listen tab)
- Click "Neue ABC-Liste" button
- Enter a topic (e.g., "Software Testing")
- Save the list
- Click on letter buttons (A-Z) to add associations
- Verify associations are saved and displayed
- Test export/import functionality

### 2. KaWa (Word Association) Creation
- Navigate to "Kawas" tab
- Click "Neues Kawa" button  
- Enter a word (e.g., "DOCKER")
- Save the KaWa
- Fill in associations for each letter of the word
- Verify all letter inputs work correctly

### 3. KaGa (Graphical Association) Creation
- Navigate to "KaGa" tab
- Click "Neues KaGa" button
- Enter a topic (e.g., "Solar System")
- Save the KaGa
- Test drawing tools (Stift/Pen and Text)
- Test color selection and size adjustment
- Verify save/delete functionality

### 4. Link Functionality
- Navigate to "Verknüpfen" tab
- Verify previously created ABC-Lists appear for selection
- Test list selection and linking functionality

### 5. Navigation and Routing
- Test all navigation links work correctly
- Verify proper URL routing between sections
- Check page titles update correctly

### 6. Stadt-Land-Fluss Game
- Navigate to "Stadt-Land-Fluss" tab
- Click "Neues Stadt-Land-Fluss Spiel" button
- Enter a game name (e.g., "Demo Spiel")
- Save the game
- Test game configuration:
  - Change timer duration (1, 2, 3, or 5 minutes)
  - Edit categories using "Bearbeiten" button
  - Add or remove categories as needed
- Start a game round and verify:
  - Random letter is generated
  - Timer counts down correctly
  - Input fields accept answers
  - Round ends automatically when timer reaches 0
  - Manual round ending with "Runde beenden" button
  - Score calculation works (base points + speed bonus + creativity bonus)
- Test game history and round tracking
- Verify game data persistence in localStorage

### 7. Zahlen-Merk-System (Number Memory System)
- Navigate to "Zahlen-Merk-System" tab
- Test Training mode:
  - Select training type: PIN (4 digits), Telefon (10 digits), Datum (8 digits), or Beliebig (6-8 digits)
  - Click "Training starten" to begin
  - Memorize the displayed number with Major-System consonants hint
  - Enter the number and verify correctness feedback
  - Check statistics update: success rate, sessions count, longest number
- Test Associations tab:
  - Verify default number-to-image associations (0=Sonne, 1=Tee, 10=Dose, etc.)
  - Click "Eigene Assoziation" to create custom association
  - Enter number, image/word, and optional story
  - Verify consonant mapping is shown (e.g., 42 → r-n)
  - Delete custom associations and verify persistence
- Test History tab:
  - View recent training sessions with correct/incorrect indicators
  - Verify time spent per session is tracked
- Test Help tab:
  - Verify Major-System explanation in German
  - Check digit-to-consonant mapping reference (0-9)
  - Review examples: 1→Tee, 10→Dose, 42→Regen
- Verify gamification integration (tracks as Sokrates session)

### 8. Sokrates Spaced Repetition System
- Navigate to any ABC-List with saved words
- Click "Sokrates-Check" button to enter spaced repetition mode
- Test spaced repetition settings:
  - Click "Einstellungen" to access SpacedRepetitionSettings component
  - Test preset configurations: Intensiv, Standard, Entspannt
  - Verify algorithm customization (base interval, ease factor, min/max intervals)
  - Test notification settings with quiet hours configuration
- Test review functionality:
  - Rate words using 1-5 star system in SokratesReview component
  - Verify next review dates are calculated correctly based on ratings
  - Test bulk review mode with multiple lists
  - Verify session optimization with recommended term limits
- Test dashboard analytics:
  - Access SokratesDashboard to view retention statistics
  - Verify performance metrics and interval distribution
  - Test KI-based learning recommendations
- Test notification system:
  - Enable browser notifications through settings
  - Verify notification scheduling respects quiet hours
  - Test notification frequency options (daily, twice-daily, hourly)
- Verify backwards compatibility:
  - Existing ABC-Lists should work with spaced repetition
  - Legacy data should upgrade seamlessly
  - Fallback to 7-day intervals for data without spaced repetition fields

### 8. Search & Tagging System
- Navigate to "Suchen" tab to access the search interface
- Test full-text search functionality:
  - Enter search queries in the main search bar
  - Verify real-time search results across ABC-Lists, KaWa, KaGa, and words
  - Test search result highlighting and snippets
  - Verify relevance scoring and result ordering
- Test advanced filtering:
  - Click "Filter" button to access advanced filters
  - Test content type filtering (ABC-Listen, KaWa, KaGa, Wörter)
  - Test special filters (Nur Favoriten, Mit Inhalt, Ohne Inhalt)
  - Verify date range filtering functionality
  - Test tag-based filtering with multi-select
- Test smart collections:
  - Navigate to "Sammlungen" tab
  - Verify "Favoriten" collection shows user-marked content
  - Check "Kürzlich erstellt" shows items from last 7 days
  - Verify "Untagged" collection identifies content needing tags
  - Test "Most Used" collection based on access patterns
- Test tagging functionality:
  - Click "Tags" button to access tag management
  - Test automatic tag suggestions for German educational content
  - Verify subject area detection (Mathematik, Physik, etc.)
  - Test manual tag addition and removal
  - Verify tag validation and duplicate prevention
- Test search history:
  - Navigate to "Verlauf" tab
  - Verify search history persistence and frequency tracking
  - Test one-click re-execution of previous searches
  - Check search pattern analytics
- Test favorites functionality:
  - Navigate to "Favoriten" tab
  - Test marking/unmarking content as favorites
  - Verify favorites persistence across sessions
  - Test favorites integration with search filters

### 9. Community Hub System
- Navigate to "Community" tab to access the community features
- Test user profile creation and management:
  - Click "Profil erstellen" to create a new community profile
  - Enter display name, bio, and select expertise areas from German academic subjects
  - Set mentoring availability preferences (mentor available, seeking mentorship)
  - Verify profile data persistence and reputation tracking
- Test mentoring system:
  - Navigate to "Mentoring" tab within Community Hub
  - Browse available mentors and filter by expertise areas
  - Send mentoring requests with optional personalized messages
  - Verify mentorship status tracking (pending, active, completed)
  - Test mentor response workflows and session management
- Test community challenges:
  - Navigate to "Challenges" tab to view active community challenges
  - Filter challenges by type (learning, creation, collaboration, review) and difficulty
  - Participate in challenges and track progress with visual indicators
  - Verify gamification integration with challenge completion rewards
- Test peer review system:
  - Navigate to "Bewertungen" tab to access the peer review interface
  - Submit reviews for Basar contributions with 5-star ratings and category scoring
  - Test review categories: accuracy, usefulness, clarity, creativity
  - Verify review moderation system and helpfulness voting
  - Check integration with existing Basar system for enhanced content quality
- Test success stories and featured users:
  - Navigate to "Erfolgsgeschichten" tab to view community achievements
  - Submit personal success stories with before/after learning journeys
  - Verify featured user highlighting and community inspiration features
  - Test story moderation and community engagement features
- Test community data persistence:
  - Verify all community data persists across browser sessions
  - Test data synchronization with existing gamification and content systems
  - Check backwards compatibility with existing user profiles and achievements

### 10. Mind-Map Visualization
- Navigate to an ABC-List detail page (e.g., `/list/TestListe`)
- Click the "🧠 Mind-Map" button in the action bar
- Verify mind map generation:
  - Check that the root node displays the list name
  - Verify letter nodes are arranged in a radial layout
  - Confirm word nodes are connected to their respective letters
  - Test that only the first 3 words per letter are displayed
- Test interactivity:
  - Click on the root node to navigate back to the list
  - Use zoom controls to zoom in/out
  - Drag nodes to reposition them
  - Verify mini-map shows overview of the entire mind map
- Test export functionality:
  - Click "PNG" button to download as PNG image
  - Click "SVG" button to download as SVG vector graphic
  - Click "PDF" button to download as PDF document
  - Verify all exports maintain the correct visual layout
- Test combined mind map:
  - Navigate to "/mindmap" to view combined mind map of all lists
  - Verify central "Meine Wissensbasis" root node
  - Check that multiple lists are displayed as child nodes
  - Test navigation from list nodes to their detail pages
- Verify mobile responsiveness:
  - Test mind map on mobile viewport (375px width)
  - Verify touch gestures work for pan and zoom
  - Check that export buttons are accessible on mobile

### 11. Dual-Coding Support (Visual Learning Elements)
- Navigate to any ABC-List and add/view a word
- Click the 🎨 icon next to any word to access visual elements editor
- Test Emoji Picker:
  - Click "Emoji wählen" button in the visual elements dialog
  - Browse emojis by category (Emotionen, Natur, Tiere, Essen, Objekte, Symbole, Wissenschaft, Transport)
  - Use search field to find specific emojis
  - Enter custom emoji in the input field and click "Verwenden"
  - Verify selected emoji is displayed in the preview
- Test Symbol Library:
  - Click "Symbol wählen" button in the visual elements dialog
  - Browse symbols by category (Wissenschaft, Mathematik, Sprachen, Natur, Technik, Emotion, Zeit, Richtung, Zustand)
  - Use search field to find symbols by name, description, or category
  - Verify symbol selection shows both emoji and name
  - Verify selected symbol is displayed in the preview
- Test Image URL Support:
  - Enter an external image URL in the "Bild-URL" field
  - Verify URL validation and preview indication
  - Test with various image hosting services
- Test Visual Element Display:
  - Verify emoji appears before word text when set
  - Verify symbol emoji appears before word text when set
  - Verify 🖼️ icon appears when image URL is set
  - Confirm multiple visual elements can be combined
- Test Visual Element Persistence:
  - Save visual elements and refresh the page
  - Verify all visual elements are persisted in localStorage
  - Test export/import functionality preserves visual elements
- Test Visual Element Removal:
  - Click "Symbol entfernen" or "Emoji entfernen" buttons
  - Click "Alle löschen" to remove all visual elements
  - Verify visual elements are cleared from display and storage
- Verify mobile responsiveness:
  - Test visual elements editor on mobile viewport (375px width)
  - Verify touch-friendly symbol/emoji grid layouts
  - Check that visual elements display correctly on small screens

## CI/CD Requirements

### The Mandatory Development Workflow

**THE GOLDEN RULE: Test, then Code, then Lint. Never deviate.**

This workflow is not a recommendation; it is a requirement. Following this sequence is critical to prevent regressions and ensure a stable codebase. Functionality is always prioritized over style.

**A. The Workflow Steps**

1.  **Always Start with Tests (`npm run test`)**
    - Before writing any code, run the entire test suite to confirm the current state of the project is stable.
    - **NEVER** proceed if any tests are failing.

2.  **Write New Tests (for new features)**
    - When adding a new feature, practice **Test-Driven Development (TDD)**.
    - Write a failing test that describes the new functionality *before* implementing it. This ensures your feature is testable and correctly implemented.

3.  **Implement Your Changes**
    - Write the necessary code to either make the new test pass or to fix an existing bug.

4.  **Verify with Tests (`npm run test`)**
    - After implementing your changes, run the test suite again.
    - All tests must pass. This proves that your changes work as expected and have not broken any other part of the application.

5.  **Linting (`npm run lint` and `npm run format`)**
    - **ONLY** after all tests pass, run the linter and formatter to ensure your code adheres to the project's style guidelines.

**B. The Iterative Cycle: The Most Important Rule**

If you make **any** code changes after linting (e.g., to fix a linting error), you **MUST** return to step 4 and run the tests again.

The development process is a loop:

`Code -> Test -> Lint -> (made a code change?) -> Test -> Lint ...`

This cycle continues until your code both passes all tests and has no linting errors. Breaking this cycle is the most common source of bugs. **Do not submit your work until this cycle is complete and stable.**

### Pre-commit Validation

**CRITICAL: Always run the comprehensive validation before committing:**

1. **Automated validation script (RECOMMENDED):**
   ```bash
   npm run validate:copilot
   ```
   - Runs all checks automatically with colored output
   - Enforces the mandatory Test→Code→Lint workflow
   - Validates TypeScript strict mode compliance
   - Checks for forbidden 'any' type usage
   - Checks for forbidden ESLint disable comments
   - Verifies build success and output
   - Total time: ~25-35 seconds with comprehensive reporting

2. **Manual validation pipeline (if script unavailable):**
   ```bash
   npm run test && npm run build && npm run lint && npm run format:check
   ```
   - Total time: ~15-20 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
   - All commands must pass for CI to succeed

3. **Enhanced CI Pipeline Features:**
   - **Code Quality Enforcement**: Automatically detects and prevents 'any' type usage
   - **ESLint Disable Prevention**: Blocks commits with ESLint disable comments
   - **TypeScript Strict Mode**: Enforces strict compilation with enhanced flags
   - **Parallel Test & Lint Validation**: Tests and linting run in parallel for faster CI execution
   - **Build Output Verification**: Validates dist directory and critical files
   - **Documentation Check**: Warns when new features lack documentation updates

4. **CI Pipeline Jobs:**
   - **Code Quality Checks**: Forbidden patterns, TypeScript strict mode
   - **Test Validation**: Runs in parallel with linting for faster CI
   - **Lint Validation**: Runs in parallel with tests for faster CI
   - **Build Validation**: Production build verification with output checks (depends on test & lint)
   - **Coverage Validation**: Test coverage generation and reporting (depends on test & lint)
   - **Documentation Validation**: New feature documentation requirements (PR only)
   - **Complete Pipeline**: Final validation with comprehensive reporting

## Project Structure

### Key Directories and Files
```
/src
  /components          # React components organized by feature
    /Community        # Community Hub components (profiles, mentoring, peer reviews)
    /Kaga             # KaGa (graphical associations) components
    /Kawa             # KaWa (word associations) components with templates
      KawaTemplates.tsx # Pre-configured KaWa word association templates
    /List             # ABC-List components with templates
      AbcListTemplates.tsx # Pre-configured ABC-List educational templates
    /LinkLists        # List linking functionality
    /NumberMemory     # Zahlen-Merk-System (Major-System) components
      NumberMemory.tsx # Number memory training interface
    /Search           # Search and tagging system components
    /SokratesCheck    # Spaced repetition system components
    /StadtLandFluss   # Stadt-Land-Fluss game components with templates
      StadtLandFlussTemplates.tsx # Pre-configured game category templates
  /lib                # Utility libraries and algorithms
    CommunityService.ts # Community data management and mentoring system
    NumberMemoryService.ts # Number memory system service
    numberMemory.ts   # Major-System algorithm and data structures
    notifications.ts  # Browser notification system
    searchService.ts  # Full-text search and indexing engine
    spacedRepetition.ts # Spaced repetition algorithm implementation
    taggingService.ts # Automated tagging and content categorization
  /test               # Test setup and utilities
  /themes             # Theme configuration
  App.tsx             # Main application component
  index.tsx           # Application entry point

/dist                 # Production build output (auto-generated)
/.github/workflows    # CI/CD pipeline definitions
```

### Important Configuration Files
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite configuration with base path `/`
- `tailwind.config.js` - Tailwind CSS configuration
- `eslint.config.js` - ESLint rules and plugins
- `.prettierrc.cjs` - Code formatting rules
- `tsconfig.json` - TypeScript configuration

## Common Tasks

### Adding New Components
- Create components in appropriate subdirectory under `/src/components`
- Include corresponding `.test.tsx` file with React Testing Library tests

**⚠️ REMINDER: After creating new components, ALWAYS run:**
```bash
npm run test && npm run lint && npm run build
```

### TypeScript Guidelines
- **STRICTLY FORBIDDEN: Never use `any` type** - This violates type safety and is explicitly prohibited
- Always use proper TypeScript types with specific interfaces and type annotations
- When working with complex data structures, define explicit interfaces (e.g., `ListAccumulator`, `ListPerformance`)
- Use generic types `<T>` when appropriate for reusable components
- Prefer `unknown` over `any` if you must work with uncertain types, then use type guards
- Use union types (`string | number`) instead of `any` when multiple types are acceptable
- Define return types explicitly for functions, especially complex ones
- Component-specific styles use Tailwind utility classes
- Follow existing naming conventions and TypeScript patterns
- Update imports in parent components as needed

### Code Quality Requirements
- All TypeScript code must pass strict type checking without `any` types
- **AUTOMATED ENFORCEMENT**: CI pipeline automatically detects and blocks 'any' usage
- Use proper type annotations for function parameters and return values
- Define interfaces for all data structures, especially those used in multiple components
- Avoid type assertions (`as`) unless absolutely necessary with proper justification
- **STRICTLY FORBIDDEN: Never use ESLint disable comments** (e.g., `// eslint-disable-next-line`)
  - **AUTOMATED ENFORCEMENT**: CI pipeline automatically detects and blocks ESLint disable comments
  - Instead of disabling ESLint rules, fix the underlying issue by:
    - Adding proper dependencies to useEffect hooks
    - Using useCallback to stabilize function references 
    - Moving pure functions outside components to avoid unnecessary re-creation
    - Restructuring code to follow React best practices
  - ESLint rules exist for good reasons and should not be suppressed

### Enhanced TypeScript Configuration
The project now uses enhanced TypeScript strict mode with additional flags:
- `noImplicitAny: true` - Prevents implicit any types
- `strictNullChecks: true` - Strict null checking
- `strictFunctionTypes: true` - Strict function type checking
- `noImplicitReturns: true` - Ensures all code paths return a value
- `noImplicitThis: true` - Prevents implicit this types
- `noUnusedLocals: true` - Detects unused local variables
- `noUnusedParameters: true` - Detects unused parameters
- `exactOptionalPropertyTypes: true` - Strict optional property handling

### Function Extraction Pattern for Production Performance
**CRITICAL: Use this pattern to prevent production rerender loops and optimize React.memo performance**

#### Core Principle: Extract All Functions Outside Components
Move ALL function definitions outside React components to prevent recreation on every render, which is essential for production performance. This pattern has been applied to critical components like Navigation, ListItem, Letter, SavedWord, DeleteConfirm, NewStringItem, and KawaLetter:

```typescript
// ✅ CORRECT: Extract functions outside component
const handleExportAsJSON = (
  item: string,
  cacheKey: string,
  setExportedData: (data: string) => void,
  setShowExportModal: (show: boolean) => void,
) => {
  const exportData = createExportData(item, cacheKey);
  const jsonString = JSON.stringify(exportData, null, 2);
  setExportedData(jsonString);
  setShowExportModal(true);
};

const handleAddWordAction = (
  newWord: string,
  words: WordWithExplanation[],
  storageKey: string,
  setWords: (words: WordWithExplanation[]) => void,
  setNewWord: (word: string) => void,
  setIsModalOpen: (open: boolean) => void,
) => {
  if (newWord && !words.some((w) => w.text === newWord)) {
    const newWordObj: WordWithExplanation = {
      text: newWord,
      explanation: "",
      version: 1,
      imported: false,
    };
    const newWords = [...words, newWordObj];
    setWords(newWords);
    localStorage.setItem(storageKey, JSON.stringify(newWords));
    setNewWord("");
    setIsModalOpen(false);
  }
};

function MyComponent() {
  const [exportedData, setExportedData] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  
  // ✅ Create stable reference inside component
  const exportAsJSON = () => handleExportAsJSON(item, cacheKey, setExportedData, setShowExportModal);
  const handleAddWord = () => handleAddWordAction(newWord, words, storageKey, setWords, setNewWord, setIsModalOpen);
  
  return <button onClick={exportAsJSON}>Export</button>;
}

// ❌ WRONG: Functions inside component recreate on every render
function MyComponent() {
  const [exportedData, setExportedData] = useState("");
  
  const exportAsJSON = () => {  // ← Creates new function reference each render
    // ... logic here
  };
  
  const handleAddWord = () => {  // ← Another new function reference each render
    // ... logic here
  };
  
  return <button onClick={exportAsJSON}>Export</button>;
}
```

#### Applied Function Extraction Examples

**Letter Component:**
```typescript
// Extracted handlers prevent recreation on every render
const handleAddWordAction = (newWord, words, storageKey, setWords, setNewWord, setIsModalOpen) => { ... };
const handleDeleteWordAction = (wordToDelete, words, storageKey, setWords) => { ... };
const handleExplanationChangeAction = (wordText, explanation, words, storageKey, setWords) => { ... };

// Inside component - create stable references
const handleAddWord = () => handleAddWordAction(newWord, words, storageKey, setWords, setNewWord, setIsModalOpen);
```

**SavedWord Component:**
```typescript
// Extracted handlers with proper state management
const handleDeleteAction = (setShowDelete, onDelete) => () => { ... };
const handleSaveExplanationAction = (explanationText, setEditingExplanation, onExplanationChange) => () => { ... };
const handleRatingClickAction = (setShowRating, onRatingChange) => (newRating) => { ... };
```

**Navigation Component:**
```typescript
// Extracted navigation items and handlers prevent app-wide rerenders
const navigationItems = [ ... ]; // Moved outside component
const createCloseHandler = (setIsOpen) => () => setIsOpen(false);
const noOpHandler = () => {}; // Stable no-op for consistent props
```

#### Components Updated with Function Extraction Pattern
- ✅ **Navigation** - Prevents app-wide rerenders by stabilizing navigation handlers
- ✅ **ListItem** - Eliminates localStorage access loops during production rerenders  
- ✅ **Letter** - Stabilizes word management functions (add, delete, explanation, rating)
- ✅ **SavedWord** - Optimizes word interaction handlers and modal controls
- ✅ **KawaLetter** - Stabilizes text change handlers using useMemo for storage keys
- ✅ **DeleteConfirm** - Prevents recreation of delete confirmation handlers
- ✅ **NewStringItem** - Stabilizes item creation and dialog management functions

#### Key Extraction Patterns by Component Type

**Dialog Components:**
```typescript
const setModalOpenAction = (setIsModalOpen) => () => setIsModalOpen(true);
const setModalCloseAction = (setIsModalOpen) => () => setIsModalOpen(false);
```

**Form Components:**
```typescript
const handleSubmitAction = (formData, onSubmit, resetForm) => () => { ... };
const handleCancelAction = (resetForm, closeDialog) => () => { ... };
```

**List Management Components:**
```typescript
const handleItemAddAction = (item, items, setItems, saveToStorage) => () => { ... };
const handleItemDeleteAction = (itemId, items, setItems, saveToStorage) => (id) => { ... };
```

#### Avoid useEffect When Possible
Replace useEffect with direct computation to eliminate dependency-related rerenders:

```typescript
// ✅ CORRECT: Direct computation
export function ListItem() {
  const {item} = useParams<{item: string}>();
  
  // Compute derived state directly instead of using useEffect
  const cacheKey = getCacheKey(item);
  
  // Set title directly without useEffect
  if (item) {
    setDocumentTitle(item);
  }
  
  // Don't render until ready - no useEffect needed
  if (!item || !cacheKey) {
    return <div>Loading...</div>;
  }
  
  return <div>Content...</div>;
}

// ❌ WRONG: useEffect creates dependency chains and timing issues
export function ListItem() {
  const {item} = useParams<{item: string}>();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {  // ← Creates effect dependency chain
    if (item) {
      document.title = `ABC-Liste für ${item}`;
      const timer = setTimeout(() => setIsReady(true), 0);
      return () => clearTimeout(timer);
    }
  }, [item]);  // ← Can cause rerenders when item changes
  
  if (!isReady) return <div>Loading...</div>;
  return <div>Content...</div>;
}
```

#### Navigation Component Pattern
Extract all navigation handlers to prevent cascading rerenders:

```typescript
// ✅ CORRECT: All functions extracted outside component
const createCloseHandler = (setIsOpen: (open: boolean) => void) => () => setIsOpen(false);
const noOpHandler = () => {};

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Create stable references
  const closeNavigation = createCloseHandler(setIsOpen);
  
  return (
    <NavButton onClick={closeNavigation} />
    <NavButton onClick={noOpHandler} />
  );
}
```

#### Testing Pattern
Always test for rerender loops in integration tests:

```typescript
it("should handle production rerender scenarios without localStorage access growth", async () => {
  let localStorageAccess = 0;
  const originalGetItem = localStorage.getItem;
  
  localStorage.getItem = function(...args) {
    localStorageAccess++;
    return originalGetItem.apply(this, args);
  };
  
  // Test multiple rerenders
  for (let i = 0; i < 10; i++) {
    rerender(<Component />);
  }
  
  // CRITICAL: Should be 0 with proper function extraction
  expect(localStorageAccess).toBe(0);
});
```

#### Why This Pattern Is Required
- **Production builds** optimize differently than development
- **React.memo** fails when function references change between renders
- **Navigation components** being global cause app-wide rerenders
- **localStorage access** during rerenders indicates optimization failures

#### Key Benefits
- ✅ Eliminates production rerender loops completely
- ✅ Stabilizes React.memo optimization
- ✅ Improves overall application performance  
- ✅ Prevents cascading rerenders from global components
- ✅ Reduces localStorage access during rerenders to zero

### Modifying Styles  
- Uses Tailwind CSS 4 for styling
- Global styles in `src/index.css`
- Theme configuration in `src/themes/default.tsx`
- Component-specific styles use Tailwind utility classes

**⚠️ REMINDER: After modifying styles, ALWAYS run:**
```bash
npm run test && npm run lint && npm run build
```

### Working with State Management
- Uses React hooks for local state management
- localStorage for persistence of lists and associations
- No external state management library (Redux, Zustand, etc.)

### Testing Guidelines
- Test files use `.test.tsx` extension
- Uses Vitest with React Testing Library
- Setup file: `src/test/setup.ts`
- Focus on user interactions and component behavior
- Always add tests for new features and bug fixes

**⚠️ REMINDER: After writing tests, ALWAYS run:**
```bash
npm run test && npm run lint && npm run build
```

### Updating documentations
- Always update AGENTS.MD and .github/copilot-instructions.md on new or changed features

## Mobile-First Design Principles

### Design Philosophy
- **Mobile-First Approach**: All components are designed for mobile devices first, then enhanced for larger screens
- **Responsive Navigation**: Uses hamburger menu for mobile, horizontal navigation for desktop
- **Touch-Friendly**: Adequate touch targets (minimum 44px) and spacing for mobile interaction

### UI Components Guidelines
- Use Tailwind responsive classes: `flex-col sm:flex-row` for mobile-first layouts
- Stack buttons vertically on mobile, horizontally on desktop
- Use `gap-2 sm:gap-3` for responsive spacing
- Implement `text-sm sm:text-base` for responsive typography
- Mobile buttons: `w-full` or `flex-1`, desktop: `w-auto`

### Navigation Implementation
- Mobile: shadcn Sheet component with hamburger menu (☰)
- Desktop: Horizontal navigation bar
- Auto-close mobile menu on navigation
- ARIA labels for accessibility

### Layout Patterns
```jsx
// Mobile-first button layout
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
  <Button className="w-full sm:w-auto">Action</Button>
</div>

// Mobile-first header with subnavigation buttons (stacked on mobile, side-by-side on desktop)
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
  <h1 className="text-3xl font-bold">Page Title</h1>
  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
    <Button className="text-sm w-full sm:w-auto">Action 1</Button>
    <Button className="text-sm w-full sm:w-auto">Action 2</Button>
  </div>
</div>

// Mobile-first list items with delete
<div className="flex items-stretch gap-2 sm:gap-3">
  <Button className="flex-1 text-left justify-start">Item</Button>
  <Button className="w-12 sm:w-16 flex-shrink-0">✕</Button>
</div>
```

### Testing Mobile Changes
- Test navigation functionality on mobile viewport (375x667)
- Verify responsive breakpoints work correctly
- Ensure touch targets are accessible
- Update tests when changing UI interaction patterns


## Troubleshooting

### Common Issues
- **Build fails:** Check TypeScript errors and ESLint violations
- **Tests fail:** Verify React Testing Library queries and assertions
- **Dev server issues:** Check port availability (5173) and base path

### Performance Notes
- npm install: ~3 minutes (due to many dependencies)
- Build time: ~2-3 seconds (very fast with Vite)
- Test execution: ~8 seconds (78 tests)
- Dev server startup: ~1 second

**Remember: NEVER CANCEL long-running commands. Always wait for completion and set appropriate timeouts (5+ minutes for installs, 60+ seconds for builds and tests).**

## Sokrates Spaced Repetition System

### Overview
The Sokrates spaced repetition system implements a scientifically-backed learning algorithm based on the Ebbinghaus forgetting curve and SM-2 algorithm. This system transforms ABC-Lists from simple self-assessment tools into optimized learning platforms that adapt to individual performance patterns.

### Core Implementation

**Algorithm (`src/lib/spacedRepetition.ts`)**
- SM-2 based intervals with dynamic ease factor adjustments
- Rating-based initial intervals: 1★=1day, 2★=2days, 3★=4days, 4★=7days, 5★=14days  
- Forgetting curve adaptation: increases intervals for good performance, resets for poor performance
- Comprehensive statistics: retention rate, mastery tracking, average intervals

**Settings Component (`src/components/SokratesCheck/SpacedRepetitionSettings.tsx`)**
- Algorithm customization: base interval, ease factor, min/max intervals
- Preset configurations: Intensiv (aggressive), Standard (balanced), Entspannt (relaxed)
- Real-time preview showing how settings affect review intervals
- Notification management with quiet hours and frequency control

**Dashboard Analytics (`src/components/SokratesCheck/SokratesDashboard.tsx`)**
- Advanced metrics: retention rate, mastery progress, interval distribution
- Visual analytics with responsive charts for mobile and desktop
- KI-based recommendations tailored to learning patterns
- Performance tracking across multiple ABC lists

**Review Interface (`src/components/SokratesCheck/SokratesReview.tsx`)**
- Bulk review functionality with list selection dialog
- Session optimization: 10-25 terms based on cognitive load research
- Priority scheduling: earliest due terms first, then by difficulty
- Interval preview: shows next review date for each rating choice

**Notification System (`src/lib/notifications.ts`)**
- Intelligent scheduling: daily, twice-daily, or hourly frequencies
- Quiet hours: respects user sleep/work schedules (default: 22:00-08:00)
- Permission management: graceful handling of browser notification permissions
- Non-intrusive design: auto-closing notifications with click-to-open functionality

### Data Model Enhancement

Enhanced `WordWithExplanation` interface with spaced repetition fields:

```typescript
interface WordWithExplanation {
  // Existing fields...
  repetitionCount?: number;    // Review history count
  easeFactor?: number;         // Individual difficulty factor (2.5 default)
  interval?: number;           // Current review interval in days
  nextReviewDate?: string;     // Calculated next review date (ISO string)
}
```

### Algorithm Behavior Examples

**Progressive Learning Pattern:**
```typescript
// First review: rating 4 → 7 days
// Second review: rating 4 → ~17 days (7 × 2.5 ease factor)
// Third review: rating 4 → ~42 days (17 × 2.5 ease factor)
// Poor performance: rating 2 → reset to 1 day, reduce ease factor
```

**Adaptive Difficulty:**
- Terms with consistent good ratings (4-5★) get longer intervals
- Difficult terms (1-2★) get shorter intervals and more frequent reviews
- Algorithm adapts ease factor based on individual performance patterns

### Testing Requirements

**Comprehensive Test Coverage (`src/lib/spacedRepetition.test.ts`):**
- Algorithm behavior across all rating scenarios (1-5 stars)
- Edge case handling: invalid dates, extreme intervals, first reviews
- Performance demonstration with forgetting curve simulation
- Statistics calculation accuracy and retention metrics
- Notification system functionality and permission handling

**Integration Testing Patterns:**
```typescript
// Test spaced repetition algorithm accuracy
it("should calculate correct intervals for different ratings", () => {
  expect(calculateNextReview(4).newInterval).toBe(7); // Good rating = 7 days
  expect(calculateNextReview(2).newInterval).toBe(2); // Poor rating = 2 days
});

// Test backwards compatibility
it("should handle legacy data without spaced repetition fields", () => {
  const legacyWord = { text: "test", explanation: "" };
  expect(upgradeWordData(legacyWord)).toHaveProperty("repetitionCount", 0);
});
```

### Mobile-First Implementation

**Responsive Design Requirements:**
- Touch-friendly rating buttons with adequate spacing (minimum 44px)
- Responsive charts that work on mobile viewports (375px width)
- Settings dialogs optimized for mobile interaction
- Notification UI that respects mobile notification patterns

**Component Patterns:**
```jsx
// Mobile-first rating interface
<div className="grid grid-cols-5 gap-2 sm:gap-3 w-full">
  {[1, 2, 3, 4, 5].map(rating => (
    <Button 
      key={rating}
      className="h-12 sm:h-14 flex-col text-xs sm:text-sm"
      onClick={() => handleRating(rating)}
    >
      {"★".repeat(rating)}
    </Button>
  ))}
</div>
```

### Performance Optimization

**Function Extraction Applied:**
All Sokrates components follow the function extraction pattern to prevent production rerenders:

```typescript
// Extracted handlers prevent recreation on every render
const handleRatingAction = (
  rating: number,
  word: WordWithExplanation,
  onRatingChange: (word: WordWithExplanation, rating: number) => void
) => () => {
  onRatingChange(word, rating);
};

// Inside component - create stable references
const handleRating = (rating: number) => 
  handleRatingAction(rating, word, onRatingChange)();
```

### Integration Points

**Navigation Integration:**
- Sokrates Check accessible from any ABC-List with saved words
- Mobile navigation includes spaced repetition status indicators
- Deep linking support for review sessions and settings

**Data Persistence:**
- localStorage integration for settings and algorithm state
- Backwards compatibility with existing ABC-List data
- Automatic migration of legacy data to spaced repetition format

**Notification Integration:**
- Browser notification API integration with permission handling
- Scheduling system that respects user preferences and quiet hours
- Graceful degradation when notifications are not supported or blocked

### Development Guidelines

**When Working with Spaced Repetition:**
1. Always test algorithm accuracy with edge cases
2. Verify mobile responsiveness of new UI components
3. Ensure backwards compatibility with existing data
4. Test notification functionality across different browsers
5. Follow function extraction pattern for all event handlers
6. Add comprehensive test coverage for new algorithm features

**Common Patterns:**
- Use `calculateNextReview()` for all interval calculations
- Apply `upgradeWordData()` when loading legacy data
- Follow notification permission best practices
- Implement responsive design with mobile-first approach

## Interleaved Learning System

### Overview
The Interleaved Learning system enhances the Sokrates spaced repetition algorithm with scientifically-backed topic mixing for improved long-term retention. Based on research showing that interleaving (mixing different topics) improves retention by 10-30% compared to blocked practice, this feature intelligently shuffles terms from multiple lists during review sessions.

### Core Implementation

**InterleavedLearningService (`src/lib/InterleavedLearningService.ts`)**
- Singleton service managing interleaved learning sessions with localStorage persistence
- Event-driven system for real-time UI updates
- Session tracking with performance metrics and AI-powered recommendations
- Statistics aggregation: total sessions, average accuracy, session duration, most practiced topics

**Interleaved Learning Algorithm (`src/lib/interleavedLearning.ts`)**
- Balanced interleaving with weighted topic selection for optimal distribution
- Context-switching optimization based on configurable frequency (1-5 scale)
- Effectiveness scoring: measures topic distribution uniformity (0-1 scale)
- Performance analysis: accuracy tracking, response time metrics per topic
- Recommendation generation: identifies weak topics, time-intensive areas, practice balance

### Key Features

**Configurable Settings:**
- **Enabled/Disabled**: Toggle interleaving on/off
- **Context Switch Frequency**: 1-5 scale (1=very frequent, 5=rare)
- **Shuffle Intensity**: 1-5 scale (1=minimal, 5=aggressive)
- **Minimum Topics**: Default 2 (need at least 2 topics to interleave)

**Session Management:**
- Start session with topic groups (list names as topics)
- Record results: topic, term, correct/incorrect, response time
- Finish session: analyze performance, generate recommendations
- Session history: stores last 50 sessions with full metrics

**Performance Metrics:**
- Topic-specific accuracy rates
- Average response times per topic
- Context switch counts and effectiveness scores
- Recommendations based on learning patterns

### Integration with Sokrates

**Settings UI (`SpacedRepetitionSettings.tsx`):**
- Interleaved Learning toggle with descriptive help text
- Range sliders for context-switch frequency and shuffle intensity
- Real-time settings persistence with visual feedback
- Mobile-optimized controls with touch-friendly sliders

**Review Flow:**
- Terms from multiple lists grouped by list name (topic)
- Interleaved sequence generated respecting user settings
- Performance tracked per topic for detailed analysis
- Recommendations provided after session completion

### Data Model

```typescript
interface InterleavingSettings {
  enabled: boolean;
  contextSwitchFrequency: number; // 1-5
  minTopicsToInterleave: number; // default: 2
  shuffleIntensity: number; // 1-5
}

interface InterleavingSession {
  id: string;
  startTime: string;
  endTime?: string;
  topicGroups: TopicGroup[];
  results: Array<{
    topic: string;
    term: string;
    correct: boolean;
    responseTime: number;
    timestamp: string;
  }>;
  metrics?: PerformanceMetrics[];
  recommendations?: string[];
}
```

### Testing Coverage

**Comprehensive Test Suite (40 tests):**
- `src/lib/interleavedLearning.test.ts` (19 tests): Algorithm correctness, weighted selection, context-switching
- `src/lib/InterleavedLearningService.test.ts` (21 tests): Service integration, session management, persistence

**Test Scenarios:**
- Algorithm with various topic configurations (balanced, weighted, empty)
- Context-switching frequency validation
- Effectiveness calculation accuracy
- Session lifecycle management
- Performance metrics and recommendations
- Settings persistence and event system

### Development Guidelines

**When Working with Interleaved Learning:**
1. Use `InterleavedLearningService.getInstance()` for all operations
2. Test with realistic topic distributions (2-10 topics)
3. Verify mobile responsiveness with touch interaction
4. Ensure settings persist across browser sessions
5. Follow function extraction pattern for event handlers
6. Add tests for new algorithm features

**Common Patterns:**
- Use `generateInterleavedSequence()` for sequence generation
- Apply `analyzeInterleavingPerformance()` after sessions
- Generate recommendations with `generateInterleavingRecommendations()`
- Track session history for long-term analysis
- Integrate with gamification for activity tracking

**Scientific Backing:**
- Interleaving improves discrimination between similar concepts
- Context switching enhances long-term retention
- Balanced distribution maximizes learning effectiveness
- Performance tracking enables personalized optimization

## Search & Tagging System

### Overview
The comprehensive search and tagging system transforms ABC-List into an intelligent content organization platform. It provides full-text search capabilities, automated tag suggestions based on German educational content, smart collections for automatic organization, and advanced filtering across all content types.

### Core Implementation

**SearchService (`src/lib/searchService.ts`)**
- Singleton service managing search indexing and querying across all content types
- Full-text search engine with relevance scoring and context highlighting
- Multi-criteria filtering: type, tags, dates, ratings, favorites, content presence
- Persistent search history with frequency tracking and analytics
- Real-time index updates when content changes

**TaggingService (`src/lib/taggingService.ts`)**
- AI-powered automatic tag suggestions with German language support
- Educational content recognition: Mathematik, Physik, Biologie, Geschichte, etc.
- Category detection: Wissenschaft, Technik, Kultur, Natur, Gesundheit
- Difficulty level suggestions: Anfänger, Fortgeschritten, Experte
- Format-specific tags: Vokabeln, Prüfung, Definitionen, Übung

**Search Components (`src/components/Search/`)**
- **SearchAndFilter**: Main tabbed interface with real-time search and filtering
- **SearchResults**: Result display with highlighting and direct navigation
- **SmartCollections**: Automated content organization (Favorites, Recent, Untagged, Most Used)
- **SearchHistory**: Persistent search tracking with one-click re-execution
- **TagManager**: Manual and automatic tag management interface
- **SearchFilters**: Advanced filtering UI with expandable sections

### Smart Collections System

**Automated Organization:**
- **Favorites**: User-marked important content with heart icon integration
- **Recent**: Items created/modified in the last 7 days with real-time updates
- **Untagged**: Content without tags requiring categorization
- **Most Used**: Items ranked by search frequency and access patterns

Each collection provides real-time statistics, visual indicators, and quick action buttons for immediate content management.

### Data Model Enhancement

Enhanced interfaces for comprehensive search functionality:

```typescript
interface SearchableItem {
  id: string;
  type: 'abc-list' | 'kawa' | 'kaga' | 'word';
  title: string;
  content: string;
  tags: string[];
  metadata: ListMetadata;
  lastModified: Date;
  isFavorite: boolean;
}

interface SearchFilters {
  query?: string;
  tags?: string[];
  type?: ('abc-list' | 'kawa' | 'kaga' | 'word')[];
  dateRange?: { start?: Date; end?: Date; };
  isFavorite?: boolean;
  hasContent?: boolean;
}

interface TagSuggestion {
  tag: string;
  confidence: number; // 0-1 confidence score
  reason: string; // Explanation for suggestion
}
```

### Testing Requirements

**Comprehensive Test Coverage (`src/lib/searchService.test.ts`, `src/lib/taggingService.test.ts`):**
- Search functionality across all content types with relevance scoring
- German language tag suggestion accuracy with educational content
- Filter combinations and complex query scenarios with edge cases
- Performance testing with large content collections
- Mobile responsiveness and touch interaction validation
- Search history persistence and frequency analytics

**Integration Testing Patterns:**
```typescript
// Test cross-content search
it("should search across ABC-Lists, KaWa, and KaGa content", () => {
  const results = searchService.search({ query: "Mathematik" });
  expect(results).toContainEqual(expect.objectContaining({
    item: expect.objectContaining({ type: "abc-list" })
  }));
});

// Test German educational tag suggestions
it("should suggest German educational tags with confidence scores", () => {
  const suggestions = taggingService.generateSuggestions("Physik Grundlagen");
  expect(suggestions).toContainEqual(expect.objectContaining({
    tag: "Wissenschaft",
    confidence: expect.any(Number)
  }));
});
```

### Mobile-First Implementation

**Responsive Design Requirements:**
- Touch-friendly search interface with adequate spacing (minimum 44px)
- Responsive filter panels optimized for mobile viewports (375px width)
- Collapsible filter sections with smooth animations
- Swipe gestures for smart collection navigation
- Mobile-optimized tag management with touch-friendly controls

**Component Patterns:**
```jsx
// Mobile-first search interface
<div className="flex flex-col gap-4">
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
    <Input className="flex-1" placeholder="Durchsuche alle Listen, Wörter und Inhalte..." />
    <div className="flex gap-2">
      <Button className="w-full sm:w-auto">Filter</Button>
      <Button className="w-full sm:w-auto">Tags</Button>
    </div>
  </div>
</div>
```

### Performance Optimization

**Function Extraction Applied:**
All search components follow the function extraction pattern to prevent production rerenders:

```typescript
// Extracted handlers prevent recreation on every render
const handleSearchAction = (
  query: string,
  filters: SearchFilters,
  onResults: (results: SearchResult[]) => void
) => () => {
  const results = searchService.search({ query, ...filters });
  onResults(results);
};

// Inside component - create stable references
const handleSearch = () => handleSearchAction(query, filters, setResults)();
```

### Integration Points

**Navigation Integration:**
- New "Suchen" tab with search icon in main navigation
- Deep linking support for search queries and filter states
- Breadcrumb navigation for search contexts and result navigation

**Feature Integration:**
- Direct navigation to found ABC-Lists, KaWa, and KaGa items
- Word-level search within lists with jump-to functionality
- Tag synchronization across all content types
- Favorites integration with existing rating and gamification systems
- Search analytics integration with usage tracking

**Data Persistence:**
- localStorage integration for search history and user preferences
- Tag data embedded within existing content structures
- Backwards compatibility with all existing ABC-List data
- Automatic content migration to searchable format

### Development Guidelines

**When Working with Search:**
1. Always call `searchService.updateIndex()` after content modifications
2. Test tag suggestions with authentic German educational content
3. Verify mobile responsiveness of all search interfaces
4. Ensure backwards compatibility with existing data structures
5. Follow function extraction pattern for all search event handlers
6. Add comprehensive test coverage for new search features

**Common Patterns:**
- Use `searchService.search(filters)` for all search operations
- Apply `taggingService.generateSuggestions()` for automatic tagging
- Implement proper error handling for search edge cases
- Follow mobile-first responsive design principles
- Use debounced input for real-time search performance

## Gamification System

### Overview
The gamification system transforms ABC-List from simple self-assessment into an engaging, achievement-driven platform that encourages daily use and feature exploration. It seamlessly integrates with all existing features while maintaining the app's educational focus.

### Core Implementation

**Service Architecture (`src/lib/GamificationService.ts`)**
- Singleton service managing all gamification state and logic
- Event-driven system for real-time UI updates
- localStorage persistence with backwards compatibility
- Automatic daily activity tracking and streak management

**Activity Tracking Integration**
```typescript
// Automatic tracking across all app features
trackListCreated("My New List");     // +10 points + achievement bonuses
trackWordAdded("Achievement");       // +2 points  
trackKawaCreated("DOCKER");         // +15 points + achievement bonuses
trackKagaCreated("Solar System");   // +20 points + achievement bonuses
trackStadtLandFlussGame();          // +5 points per game
trackSokratesSession();             // +8 points per session
trackBasarTrade();                  // +12 points per trade
```

**UI Components (`src/components/Gamification/`)**
- **GamificationDashboard**: Tabbed interface with Overview, Achievements, and Leaderboard
- **GamificationStatusIndicator**: Live status showing level, points, and streak in navigation
- Mobile-first responsive design with touch-friendly interactions

### Achievement System (15 Achievements across 5 Categories)

**Learning Category:**
- First ABC-List creation (20 points, common)
- List Master: 10 ABC-Lists (100 points, rare)
- Word Collector: 100 terms (200 points, epic)
- Vocabulary Legend: 1000 terms (1000 points, legendary)
- Game Enthusiast: 10 Stadt-Land-Fluss games (80 points, common)

**Creativity Category:**
- Creative Mind: First KaWa (30 points, common)
- Visual Artist: First KaGa (40 points, common)
- Creative Genius: 25 combined KaWas + KaGas (300 points, epic)

**Dedication Category:**
- Daily Learner: 7-day streak (150 points, rare)
- Streak Master: 30-day streak (500 points, epic)
- Unstoppable: 100-day streak (1500 points, legendary)

**Social Category:**
- First Trader: First Basar trade (25 points, common)
- Merchant King: 100 Basar trades (800 points, legendary)

**Mastery Category:**
- Sokrates Student: 50 Sokrates sessions (250 points, rare)
- Wisdom Seeker: Reach Level 10 (400 points, epic)

### Level & Experience System

**Progressive Formula:**
- Level N requires N² × 100 experience points
- Level 1→2: 100 XP, Level 2→3: 400 XP, Level 3→4: 900 XP
- Visual progress bars showing XP needed for next level
- Level-up notifications with bonus point awards

**Point Economy:**
- Daily login: 3 points
- Word addition: 2 points
- ABC-List creation: 10 points + achievement bonuses
- KaWa creation: 15 points + achievement bonuses
- KaGa creation: 20 points + achievement bonuses
- Achievement bonuses: 20-1500 points based on rarity

### Daily Streak System

**Smart Tracking Logic:**
- Automatic daily activity detection
- Visual streak indicators (🔥) in navigation
- Current and longest streak counters
- Streak milestone achievements at 7, 30, and 100 days
- Intelligent reset logic for missed days

### Challenge System

**Weekly Challenges:**
- Lern-Streak: Stay active for 7 consecutive days (150 points)
- Wort-Sprint: Collect 50 new terms (120 points)
- Spiel-Woche: Play 15 Stadt-Land-Fluss rounds (80 points)
- Kreativ-Schub: Create 5 KaWas or KaGas (200 points)

**Monthly Challenges:**
- Vokabular-Boost: Collect 200 new terms (400 points)
- Listen-Marathon: Create 15 ABC-Lists (300 points)
- Allrounder: Use all app features 5 times each (500 points)
- Meister-Modus: Complete 20 Sokrates sessions (450 points)

### Leaderboard System

**Multiple Ranking Metrics:**
- Total Points: Overall gamification score
- Level: Current experience-based level
- Current Streak: Active learning streak
- Lists Created: Total ABC-Lists authored
- Words Collected: Total vocabulary gathered
- Trading Activity: Basar engagement

**Mock Competitor System:**
- Realistic competitor profiles with badges and achievements
- Dynamic ranking updates
- Refresh functionality for competitive elements

### Integration Requirements

**Activity Tracking Integration:**
All feature components automatically track relevant activities:
- List creation/word addition in ABC-Lists
- KaWa/KaGa creation in creative modules
- Stadt-Land-Fluss games and Sokrates sessions
- Basar trading activities

**useGamification Hook (`src/hooks/useGamification.ts`):**
```typescript
const {
  trackListCreated,
  trackWordAdded,
  trackKawaCreated,
  trackKagaCreated,
  trackStadtLandFlussGame,
  trackSokratesSession,
  trackBasarTrade,
  gamificationService
} = useGamification();
```

**Data Architecture:**
- Event-driven updates via listener pattern
- localStorage persistence with GAMIFICATION_STORAGE_KEYS
- Backwards compatibility with existing user data
- Automatic data migration for legacy profiles

### Testing Requirements

**Comprehensive Test Coverage (`src/lib/GamificationService.test.ts`):**
- Activity tracking accuracy across all features
- Achievement unlock conditions and progress calculation
- Streak logic with edge cases and timezone handling
- Level progression and XP calculations
- Challenge generation and completion detection
- Event system and listener management
- Data persistence and profile management

**Test Isolation Patterns:**
```typescript
beforeEach(() => {
  localStorage.clear();
  GamificationService.resetInstance(); // Reset singleton for test isolation
  gamificationService = GamificationService.getInstance();
});
```

**Mock Integration for Component Tests:**
```typescript
// Mock useGamification hook to prevent interference
vi.mock("@/hooks/useGamification", () => ({
  useGamification: () => ({
    trackWordAdded: vi.fn(),
    trackListCreated: vi.fn(),
    // ... other tracking methods
  }),
}));
```

### Development Guidelines

**When Adding New Features:**
1. Integrate activity tracking calls at appropriate points
2. Add new achievement types if feature warrants recognition
3. Update challenge templates if feature supports competitive goals
4. Test gamification integration doesn't interfere with core functionality
5. Ensure mobile-responsive design for any gamification UI

**Function Extraction Pattern:**
All gamification components follow the function extraction pattern:
```typescript
// Extract handlers outside component to prevent recreation
const handleAchievementClick = (achievement, setSelectedAchievement) => () => {
  setSelectedAchievement(achievement);
};

// Inside component - create stable references
const achievementClick = handleAchievementClick(achievement, setSelectedAchievement);
```

**Performance Considerations:**
- Event batching for localStorage operations
- Memoized calculations for level and achievement computations
- Lazy loading of gamification components
- Function extraction prevents React rerender loops

### Mobile-First Implementation

**Responsive Design Requirements:**
- Touch-friendly achievement cards and progress indicators
- Responsive charts for mobile viewports (375px width)
- Status indicator optimization for small screens
- Hamburger menu integration for gamification dashboard access

**Component Patterns:**
```jsx
// Mobile-first gamification status

```

### Accessibility Standards

**Implementation Requirements:**
- Keyboard navigation support for all interactive elements
- ARIA labels for achievement progress and status indicators
- Screen reader compatibility for level and streak announcements
- High contrast mode support for achievement rarity indicators
- Focus management in modal dialogs and tabbed interfaces

The gamification system successfully enhances user engagement while maintaining ABC-List's educational mission and technical quality standards.

## Zahlen-Merk-System (Number Memory System)

### Overview
The Zahlen-Merk-System implements Vera F. Birkenbihl's Major-System methodology for memorizing numbers through visual associations. This scientifically-backed technique converts digits to consonants, which are then combined with vowels to create memorable words and images, dramatically improving number retention.

### Core Implementation

**Service Architecture (`src/lib/NumberMemoryService.ts`)**
- Singleton service managing number-to-image associations and training sessions
- Event-driven system for real-time UI updates
- localStorage persistence with training history management
- Automatic default association initialization with German examples

**Major-System Algorithm (`src/lib/numberMemory.ts`)**
- Digit-to-consonant mapping based on German phonetics:
  - 0 = S, Z (weicher S-Laut)
  - 1 = T, D (dentale Laute)
  - 2 = N (Nasal)
  - 3 = M (Nasal)
  - 4 = R (rollender Laut)
  - 5 = L (flüssig)
  - 6 = CH, J, SCH (weiche Laute)
  - 7 = K, G (harte Laute)
  - 8 = F, V, W (Frikative)
  - 9 = P, B (Labiale)
- Default German associations: 0=Sonne, 1=Tee, 10=Dose, 42=Regen, etc.
- Training number generators for PIN, phone, date, and custom formats

**UI Component (`src/components/NumberMemory/NumberMemory.tsx`)**
- Tabbed interface with Training, Associations, History, and Help sections
- Four training modes: PIN (4 digits), Phone (10 digits), Date (8 digits), Custom (6-8 digits)
- Interactive memorization workflow with Major-System hints
- Custom association creation with consonant validation
- Comprehensive help documentation in German

### Data Model

**Number Association:**
```typescript
interface NumberAssociation {
  number: string;              // The number as string (e.g., "42", "0815")
  image: string;               // The associated image/word
  story?: string;              // Optional mnemonic story
  isCustom: boolean;           // User-created or preset
  createdAt: string;
  lastReviewed?: string;
  reviewCount: number;
}
```

**Training Session:**
```typescript
interface TrainingSession {
  id: string;
  type: "phone" | "date" | "pin" | "custom";
  numberToMemorize: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;           // in seconds
  timestamp: string;
}
```

**Statistics:**
```typescript
interface NumberMemoryStats {
  totalTrainingSessions: number;
  successRate: number;
  averageTimePerDigit: number;
  longestNumberMemorized: number;
  favoriteNumberType: string;
  customAssociationsCount: number;
  totalReviewCount: number;
}
```

### Key Features

**Training Modes:**
- **PIN (4 digits):** Practice with 4-digit security codes
- **Phone (10 digits):** German phone number format training
- **Date (8 digits):** Date memorization in DDMMYYYY format
- **Custom (6-8 digits):** Flexible length number practice

**Association Management:**
- 21 preset German associations (0-20) based on Major-System
- Unlimited custom association creation with stories
- Consonant mapping display for learning reinforcement
- Review count tracking for spaced repetition integration

**Statistics Dashboard:**
- Real-time success rate calculation
- Total training sessions counter
- Longest number memorized tracking
- Custom associations count display

### Testing Coverage

**Comprehensive Test Suite (37 tests):**
- Major-System algorithm validation (17 tests)
- Service functionality and data persistence (20 tests)
- Digit-to-consonant conversion accuracy
- Word validation against Major-System rules
- Training number generation for all formats
- Statistics calculation accuracy
- Event system functionality

### Integration Points

**Gamification Integration:**
- Training sessions tracked as Sokrates-Check activity
- Points awarded for successful memorization
- Statistics contribute to overall learning metrics

**Navigation Integration:**
- "Zahlen-Merk-System" entry in main navigation
- Mobile-responsive hamburger menu support
- Route: `/number-memory`

**Data Persistence:**
- localStorage keys: `numberMemory-customAssociations`, `numberMemory-trainingHistory`
- Automatic cleanup: keeps last 100 training sessions
- Event-driven updates for UI synchronization

### Mobile-First Implementation

**Responsive Design:**
- Touch-friendly training mode selection buttons
- Mobile-optimized tab navigation
- Responsive statistics cards (2x2 grid on mobile, 1x4 on desktop)
- Association grid: 1 column mobile, 2 tablet, 3 desktop
- Full-screen training interface for distraction-free memorization

### Development Guidelines

**When Working with Number Memory:**
1. Always test Major-System consonant mapping accuracy
2. Verify German language associations are culturally appropriate
3. Test all training modes (PIN, phone, date, custom) thoroughly
4. Ensure mobile responsiveness of training interfaces
5. Follow function extraction pattern for all event handlers
6. Add tests for new association validation logic

**Common Patterns:**
- Use `NumberMemoryService.getInstance()` for all data operations
- Apply `numberToMajorWord()` for consonant conversion display
- Validate custom associations with `wordMatchesMajorSystem()`
- Generate training numbers with `generateTrainingNumber(type)`
- Calculate stats with `calculateStats(sessions, associations)`

## Template Library System

### Overview
The Template Library (Template-Bibliothek) provides users with pre-configured templates for quick-start learning across ABC-Lists, KaWa, and Stadt-Land-Fluss. With 33 professionally crafted templates covering various educational subjects and learning scenarios, it significantly lowers the barrier to entry for new users while maintaining pedagogical quality.

### Core Implementation

**Template Components:**
- **AbcListTemplates** (`src/components/List/AbcListTemplates.tsx`) - 8 subject-specific templates
- **KawaTemplates** (`src/components/Kawa/KawaTemplates.tsx`) - 10 creative word association templates  
- **StadtLandFlussTemplates** (`src/components/StadtLandFluss/StadtLandFlussTemplates.tsx`) - 15 game category templates

**Educational Coverage:**
- Mathematik, Sprachen (Englisch, Deutsch), Naturwissenschaften (Biologie, Physik, Chemie)
- Geschichte, Lerntechniken, Motivation, Produktivität
- Specialized game categories: Geography, Science, Culture, Children's learning

**Key Features:**
- Dialog-based template selection with category grouping
- One-click template application with automatic data population
- Mobile-first responsive design with touch-friendly interfaces
- Pre-filled content with educational explanations
- Duplicate detection to prevent data conflicts

### Template Data Structures

**ABC-List Template:**
```typescript
interface AbcListTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  data: Record<string, WordWithExplanation[]>;
}
```

**KaWa Template:**
```typescript
interface KawaTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  word: string;
  preview: string;
  associations: Record<string, string>;
}
```

**Stadt-Land-Fluss Template:**
```typescript
interface StadtLandFlussTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  categories: string[];
}
```

### Integration Points

**UI Integration:**
- Template buttons integrated into List, Kawa, and StadtLandFluss main screens
- Seamless workflow: Click template button → Select template → Automatic creation
- Mobile-responsive dialogs with category-based organization
- Preview and description for informed template selection

**Data Management:**
- Automatic localStorage integration for template-created content
- Gamification tracking for template usage
- Duplicate name detection with user-friendly error messages
- Backwards compatibility with existing data structures

### Testing Coverage

**Comprehensive Test Suite (21 tests):**
- Template dialog rendering and interaction
- Category grouping and display validation
- Template selection and data application
- Mobile responsiveness verification
- Data structure integrity checks

**Test Files:**
- `src/components/List/AbcListTemplates.test.tsx` (6 tests)
- `src/components/Kawa/KawaTemplates.test.tsx` (7 tests)
- `src/components/StadtLandFluss/StadtLandFlussTemplates.test.tsx` (9 tests)

### Development Guidelines

**When Working with Templates:**
1. Follow existing template structure and data formats
2. Ensure educational accuracy and pedagogical value
3. Use appropriate German terminology consistent with Birkenbihl methodology
4. Group templates by logical educational categories
5. Provide clear descriptions and previews for user guidance
6. Apply function extraction pattern to all event handlers

**Adding New Templates:**
1. Define template object with all required fields
2. Add to appropriate template array (abcListTemplates, kawaTemplates, etc.)
3. Ensure category grouping for logical organization
4. Write tests for new template validation
5. Test mobile responsiveness and touch interactions

**Common Patterns:**
- Extract template selection handlers outside components
- Use dialog-based UI for consistent user experience
- Implement duplicate detection before template application
- Track gamification events for template usage
- Follow mobile-first responsive design principles

### Template Categories by Type

**ABC-List Templates (8):**
- Mathematik Grundlagen, Englisch Grundwortschatz, Biologie: Die Zelle
- Geschichte: Antike, Physik: Energie, Deutsch: Grammatik
- Chemie: Atome und Elemente, Prüfungsvorbereitung

**KaWa Templates (10):**
- Bildung: LERNEN, WISSEN, SPRACHE
- Motivation: ERFOLG
- Produktivität: FOKUS
- Kreativität: KREATIV
- Philosophie: FREIHEIT, ZUKUNFT
- Naturwissenschaft: ENERGIE
- Gesundheit: GESUND

**Stadt-Land-Fluss Templates (15):**
- Standard: Klassisch, Erweitert
- Fachspezifisch: Geographie, Natur, Wissenschaft, Kultur, Geschichte, Schule
- Alltag: Alltag, Essen & Trinken, Sport, Technik
- Bildung: Sprachen, Mathematik
- Kinder: Für Kinder

## Community Hub System

### Overview
The Community Hub transforms ABC-List into a collaborative learning platform while maintaining its educational focus and technical excellence standards. It provides a centralized space for knowledge sharing, mentoring, and peer collaboration through five core features that seamlessly integrate with existing systems.

### Core Implementation

**CommunityService (`src/lib/CommunityService.ts`)**
- Singleton service managing all community data with localStorage persistence
- Event-driven system for real-time UI updates
- Integration with existing Gamification and Basar systems for cohesive experience
- Comprehensive error handling and graceful fallbacks for production stability

**Community Components (`src/components/Community/`)**
- **Community**: Main tabbed interface with Overview, Profile, Mentoring, Challenges, Reviews, and Success Stories
- **UserProfile**: Rich profile creation with 25+ German academic expertise areas and mentoring preferences
- **MentorshipManager**: Intelligent mentor matching based on expertise areas with request workflows
- **CommunityChallenge**: Gamified collaborative challenges extending existing achievement system
- **PeerReview**: Comprehensive review system for Basar contributions with detailed category ratings
- **FeaturedUsers**: Community inspiration through shared learning journeys and achievements

### Data Model Enhancement

Enhanced interfaces for comprehensive community functionality:

```typescript
interface CommunityProfile {
  userId: string;
  displayName: string;
  bio: string;
  expertise: UserExpertise[];
  mentorAvailable: boolean;
  menteeInterested: boolean;
  joinDate: string;
  lastActive: string;
  reputation: number;
  contributionCount: number;
  helpfulReviews: number;
}

interface MentorshipConnection {
  id: string;
  mentorId: string;
  menteeId: string;
  expertiseArea: string;
  status: "pending" | "active" | "completed" | "cancelled";
  requestDate: string;
  sessionCount: number;
  rating?: number;
}

interface PeerReview {
  id: string;
  reviewerId: string;
  itemId: string;
  itemType: "abc-list" | "kawa" | "kaga";
  rating: number; // 1-5 stars
  comment: string;
  categories: {
    accuracy: number;
    usefulness: number;
    clarity: number;
    creativity: number;
  };
  helpfulnessRating: number;
  timestamp: string;
  status: "pending" | "published" | "flagged";
}
```

### Testing Requirements

**Comprehensive Test Coverage (`src/lib/CommunityService.test.ts`):**
- Singleton pattern management with proper instance isolation
- User profile CRUD operations with validation and error handling
- Mentorship request workflows and status tracking
- Community challenge participation logic and progress tracking
- Peer review submission and retrieval with category scoring
- Success story management and featured user selection
- Event system functionality and listener management
- Data persistence and profile management across sessions

**Test Isolation Patterns:**
```typescript
beforeEach(() => {
  localStorage.clear();
  CommunityService.resetInstance(); // Reset singleton for test isolation
  communityService = CommunityService.getInstance();
});
```

**Integration Testing:**
```typescript
// Test community data persistence
it("should persist community data across browser sessions", () => {
  const profile = communityService.createUserProfile(profileData);
  expect(localStorage.getItem(COMMUNITY_STORAGE_KEYS.USER_PROFILE)).toBeTruthy();
});

// Test mentorship workflow
it("should handle complete mentorship request workflow", () => {
  const request = communityService.requestMentorship(mentorId, expertiseArea);
  expect(request.status).toBe("pending");
});
```

### Mobile-First Implementation

**Responsive Design Requirements:**
- Touch-friendly interface with minimum 44px touch targets for mobile interaction
- Responsive profile cards and challenge layouts optimized for mobile viewports (375px width)
- Collapsible sections and expandable content for efficient space usage on small screens
- Mobile-optimized form layouts for profile creation and mentorship requests

**Component Patterns:**
```jsx
// Mobile-first community interface

```

### Performance Optimization

**Function Extraction Applied:**
All Community Hub components follow the function extraction pattern to prevent production rerenders:

```typescript
// Extracted handlers prevent recreation on every render
const handleMentorshipRequestAction = (
  mentorId: string,
  expertiseArea: string,
  message: string,
  onSuccess: () => void,
  onError: (error: string) => void
) => () => {
  try {
    const communityService = CommunityService.getInstance();
    communityService.requestMentorship(mentorId, expertiseArea, message);
    onSuccess();
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
};

// Inside component - create stable references
const handleMentorshipRequest = () => 
  handleMentorshipRequestAction(mentorId, area, message, onSuccess, onError)();
```

### Integration Points

**Gamification Integration:**
- Activity tracking for peer reviews and success story submissions
- Community challenge completion rewards integrated with existing point system
- Reputation system synchronized with gamification achievements
- Mentorship participation badges and community recognition

**Navigation Integration:**
- New "Community" tab in main navigation with Users icon
- Deep linking support for community profiles, challenges, and mentorships
- Mobile-responsive hamburger menu integration for community access

**Basar Integration:**
- Peer review system seamlessly integrated with existing Basar contribution system
- Enhanced content quality through community-driven review process
- Review-based reputation building for contributors

**Data Persistence:**
- localStorage integration with COMMUNITY_STORAGE_KEYS for consistent data management
- Event-driven updates for real-time UI synchronization across components
- Backwards compatibility with existing user data and profiles
- Automatic migration and graceful handling of legacy data structures

### Development Guidelines

**When Working with Community Features:**
1. Always test singleton instance management and data persistence across sessions
2. Verify mobile responsiveness of all community interfaces with touch interaction testing
3. Ensure seamless integration with existing gamification and content systems
4. Follow function extraction pattern for all event handlers to prevent rerenders
5. Add comprehensive test coverage for new community features including edge cases
6. Test error handling for localStorage failures and network connectivity issues

**Common Patterns:**
- Use `CommunityService.getInstance()` for all community data operations
- Apply function extraction pattern consistently to prevent React rerender loops
- Follow mobile-first responsive design principles with touch-friendly controls
- Implement proper error boundaries and fallback states for production stability
- Ensure backwards compatibility and graceful upgrades for existing data

**Performance Considerations:**
- Event batching for localStorage operations to prevent excessive writes
- Lazy loading of community data and profiles for optimal initial load times
- Function extraction applied throughout to maintain React.memo effectiveness
- Efficient state management with minimal re-renders through stable references

### Accessibility Standards

**Implementation Requirements:**
- Keyboard navigation support for all interactive community elements
- ARIA labels for mentorship status, review ratings, and challenge progress
- Screen reader compatibility for community announcements and notifications
- High contrast mode support for all community interface elements
- Focus management in modal dialogs and tabbed community interfaces

The Community Hub successfully transforms ABC-List into a collaborative learning platform while preserving its core educational mission and maintaining the highest technical quality standards.

## Mind-Map Integration System

### Overview
The Mind-Map Integration feature implements Vera F. Birkenbihl's visual learning methodology through interactive mind maps. This system automatically generates visual knowledge structures from ABC-Lists and KaWa associations, enabling users to see connections between concepts and enhancing retention through dual-coding (visual + verbal information).

### Core Implementation

**MindMapService (`src/lib/mindMapService.ts`)**
- Singleton-free service providing mind map generation algorithms
- Automatic layout using radial positioning for optimal visual clarity
- Support for ABC-Lists, KaWa, and combined multi-source mind maps
- Node type system: root, letter, word, kawa-letter, kawa-word

**Mind Map Component (`src/components/MindMap/MindMap.tsx`)**
- Built on @xyflow/react for interactive graph visualization
- Color-coded nodes: Blue (root), Green (letters), Orange (words)
- Interactive features: drag, zoom, pan, minimap navigation
- Export functionality: PNG, SVG, PDF using html-to-image and jsPDF

**Mind Map View (`src/components/MindMap/MindMapView.tsx`)**
- Route-based access: `/mindmap/:item` for single list, `/mindmap` for combined
- Click-to-navigate: nodes link back to source lists and content
- Help dialog with usage instructions and Birkenbihl learning tips
- Mobile-first responsive design with touch-friendly controls

### Key Features

**Automatic Generation from ABC-Lists:**
- Root node displays list name
- Letter nodes arranged in radial layout (200px radius)
- Word nodes connected to letters (max 3 per letter to avoid clutter)
- Smooth step edges for visual clarity

**KaWa Integration:**
- Word letters as primary nodes
- Associations as secondary connected nodes
- Maintains same visual language as ABC-Lists

**Combined Mind Maps:**
- Central "Meine Wissensbasis" root node
- Multiple lists/kawas as child nodes (250px radius)
- Supports up to 5 lists for optimal visualization
- Radial distribution prevents overlap

**Export Options:**
- PNG: High-quality raster image (1:1 quality)
- SVG: Scalable vector graphic for presentations
- PDF: Print-ready landscape document
- All exports preserve exact visual layout

### Data Model Enhancement

```typescript
interface MindMapNode extends Node {
  data: {
    label: string;
    type: "root" | "letter" | "word" | "kawa-letter" | "kawa-word";
    sourceId?: string;
    sourceType?: "abc-list" | "kawa";
    letterContext?: string;
  };
}

interface MindMapData {
  nodes: MindMapNode[];
  edges: Edge[];
}
```

### Testing Requirements

**Comprehensive Test Coverage:**
- `src/lib/mindMapService.test.ts` (8 tests): Algorithm validation, layout generation
- `src/components/MindMap/MindMap.test.tsx` (3 tests): Component rendering, export buttons

**Test Scenarios:**
- Mind map generation from ABC-Lists with multiple letters
- Empty list handling (root node only)
- Word limit enforcement (3 per letter)
- KaWa association mapping
- Combined mind map with multiple sources
- Export functionality with mocked libraries

### Integration Points

**Navigation Integration:**
- New "Mind-Map" menu item in main navigation
- Route: `/mindmap` for combined view
- Route: `/mindmap/:item` for single list view
- Button in ListItem component action bar ("🧠 Mind-Map")

**Data Integration:**
- Reads from same localStorage as ABC-Lists
- Compatible with existing WordWithExplanation data structure
- No migration required - works with all existing lists

**Mobile-First Implementation:**
- Touch-friendly controls (44px minimum touch targets)
- Responsive layout adapts to viewport width
- Pan/zoom gestures work on mobile devices
- Export buttons stacked vertically on small screens

### Performance Optimization

**Function Extraction Applied:**
All Mind-Map components follow the function extraction pattern:

```typescript
// Extracted export handlers outside component
const handleExportPNG = (elementId: string) => async () => {
  // Export logic
};

// Inside component - create stable references
const exportPNG = handleExportPNG("mindmap-container");
```

**Optimization Techniques:**
- Static node styling computed once during initialization
- Edge generation optimized with single pass algorithms
- ReactFlow built-in virtualization for large graphs
- Lazy loading of mind map view via route-based code splitting

### Development Guidelines

**When Working with Mind Maps:**
1. Always test with realistic data (10+ letters, 3+ words per letter)
2. Verify export functionality across all three formats
3. Test touch interactions on mobile viewports
4. Ensure node positioning prevents overlap
5. Follow function extraction pattern for all event handlers
6. Add tests for new layout algorithms

**Common Patterns:**
- Use `generateMindMapFromList()` for ABC-List visualization
- Use `generateMindMapFromKawa()` for KaWa visualization
- Use `generateCombinedMindMap()` for multi-source views
- Apply color coding consistently (blue=root, green=letters, orange=words)
- Limit displayed items to prevent visual clutter (3 words per letter)

**Scientific Backing:**
- Mind maps activate both brain hemispheres (Birkenbihl methodology)
- Visual-verbal dual coding improves retention by 30-40%
- Radial layout mirrors natural brain association patterns
- Interactive exploration enhances active learning

### Accessibility Standards

**Implementation Requirements:**
- Keyboard navigation for all interactive elements
- ARIA labels for all nodes and controls
- Screen reader compatible with node descriptions
- High contrast mode support for all color schemes
- Focus management in mind map canvas

The Mind-Map Integration successfully implements core Birkenbihl learning methodology while maintaining ABC-List's technical excellence and mobile-first design principles.

---

## Dual-Coding Support System

### Overview
The Dual-Coding Support system implements the scientifically-backed dual-coding theory by combining visual and verbal learning elements. This feature allows users to enhance word retention by adding emojis, symbols from a curated library, or external image URLs to their vocabulary, creating stronger memory associations through multi-sensory encoding.

### Core Implementation

**Symbol Library (`src/lib/symbolLibrary.ts`)**
- 48 pre-selected educational symbols organized in 9 categories
- Categories: Wissenschaft, Mathematik, Sprachen, Natur, Technik, Emotion, Zeit, Richtung, Zustand
- Search functionality: by name, description, or category
- Helper functions: `getSymbolsByCategory()`, `getSymbolById()`, `searchSymbols()`

**Visual Elements Components (`src/components/DualCoding/`)**
- **EmojiPicker**: Categorized emoji selection with search and custom input
- **SymbolPicker**: Symbol library browser with category filtering
- **VisualElementsEditor**: Combined interface for all visual element types

**Integration Points:**
- SavedWord component enhanced with 🎨 icon for visual element editing
- Letter component passes visual element props and handles changes
- WordWithExplanation interface extended with `emoji?`, `symbol?`, `imageUrl?` fields
- Full localStorage persistence and export/import support

### Data Model Enhancement

```typescript
interface WordWithExplanation {
  text: string;
  explanation?: string;
  // ... existing fields
  // Dual-Coding Support: Visual elements for enhanced learning
  emoji?: string;        // Unicode emoji for visual association
  symbol?: string;       // Symbol ID from symbol library
  imageUrl?: string;     // External image URL for visual learning
}

interface Symbol {
  id: string;
  name: string;
  emoji: string;
  category: SymbolCategory;
  description: string;
}
```

### Key Features

**Emoji Integration:**
- 8 categorized emoji collections (Emotionen, Natur, Tiere, Essen, Objekte, Symbole, Wissenschaft, Transport)
- Custom emoji input for flexibility
- Search functionality within categories
- Current emoji highlighting

**Symbol Library:**
- 48 carefully selected educational symbols
- Category-based browsing with "Alle" option
- Real-time search by name, description, or category
- Symbol details: emoji representation, German name, educational description
- Examples: 🔬 Mikroskop (Wissenschaft), 🧮 Taschenrechner (Mathematik), 📚 Buch (Sprachen)

**Image URL Support:**
- External image URL input field
- URL validation with user guidance
- Suggestions for free image databases (Unsplash, Pixabay)
- Visual indicator (🖼️) when image URL is set

**Visual Element Display:**
- Emojis and symbols appear before word text in list view
- Highlight visual element button (🎨) when elements are present (purple color)
- Combined preview showing all active visual elements
- Mobile-optimized display with touch-friendly controls

### Testing Coverage

**Comprehensive Test Suite (53 tests total, 516 passing):**
- `src/lib/symbolLibrary.test.ts` (12 tests): Symbol library validation, search, category filtering
- `src/components/DualCoding/SymbolPicker.test.tsx` (14 tests): UI interaction, filtering, selection
- Updated existing tests to account for new 🎨 icon in accessible names

**Test Scenarios:**
- Symbol library content validation and uniqueness
- Category-based filtering accuracy
- Search functionality with partial and case-insensitive matching
- Symbol selection and removal workflows
- Visual elements persistence and localStorage integration
- Mobile responsiveness and touch interactions

### Mobile-First Implementation

**Responsive Design Requirements:**
- Touch-friendly symbol/emoji grids (responsive columns: 4/6/8 based on screen size)
- Mobile-optimized picker dialogs with scrollable content
- Visual element indicators adapt to small screens
- Symbol grids: 4 columns mobile, 6 tablet, responsive up to desktop
- Emoji grids: 8 columns mobile, 10 desktop for optimal density

**Component Patterns:**
```jsx
// Mobile-first emoji grid
<div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
  {emojis.map(emoji => (
    <button className="p-2 rounded-lg border-2 text-2xl">
      {emoji}
    </button>
  ))}
</div>

// Mobile-first symbol grid
<div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
  {symbols.map(symbol => (
    <button className="flex flex-col items-center p-3">
      <span className="text-3xl">{symbol.emoji}</span>
      <span className="text-xs">{symbol.name}</span>
    </button>
  ))}
</div>
```

### Performance Optimization

**Function Extraction Applied:**
All Dual-Coding components follow the function extraction pattern:
```typescript
// Extracted handlers outside components
const handleSymbolClickAction = (symbol, onSelect, onClose) => () => {
  onSelect(symbol);
  onClose();
};

// Stable references inside component
const handleSymbolClick = (symbol) => 
  handleSymbolClickAction(symbol, onSelect, onClose)();
```

### Integration Points

**Data Persistence:**
- Visual elements stored with word data in localStorage
- Backwards compatible with existing word data (optional fields)
- Export/import preserves all visual elements
- Migration-free: old data works without modification

**UI Integration:**
- Visual elements button (🎨) integrated into SavedWord component
- Visual indicators in word display (emoji before text, symbol before text, 🖼️ for images)
- Consistent styling with existing UI patterns
- Accessibility: proper labels, keyboard navigation, ARIA attributes

### Development Guidelines

**When Working with Dual-Coding:**
1. Always use symbol IDs from SYMBOL_LIBRARY, not raw emojis for symbols
2. Test visual element persistence across page reloads
3. Verify mobile responsiveness with touch interaction testing
4. Ensure export/import preserves all visual elements
5. Follow function extraction pattern for all event handlers
6. Add tests for new symbol categories or emoji collections

**Common Patterns:**
- Use `getSymbolById()` to retrieve symbol data for display
- Use `searchSymbols()` for flexible symbol discovery
- Apply `WordWithExplanation` interface for type safety
- Implement proper error boundaries for visual element loading failures
- Follow mobile-first responsive design with grid-based layouts

**Scientific Backing:**
- Dual-coding theory: combining visual and verbal information improves retention by 30-40%
- Multi-sensory encoding creates stronger memory traces
- Visual associations activate different brain regions for enhanced recall
- Emotionally-resonant emojis strengthen episodic memory formation

### Accessibility Standards

**Implementation Requirements:**
- All visual elements have proper ARIA labels and descriptions
- Keyboard navigation supported in all pickers
- Screen reader announces selected visual elements
- High contrast mode compatible visual indicators
- Focus management in modal dialogs

The Dual-Coding Support system successfully enhances learning effectiveness through scientifically-backed visual-verbal integration while maintaining ABC-List's technical excellence and mobile-first design principles.

---

## 🚨 FINAL REMINDER: NEVER FORGET THE MANDATORY WORKFLOW 🚨

**Before closing any development session, ALWAYS complete this checklist:**

```bash
# 1. TEST (MUST pass all 516 tests)
npm run test

# 2. LINT (MUST have 0 errors, includes markdown linting)  
npm run lint

# 3. BUILD (MUST complete successfully)
npm run build
```

**✅ Development Session Checklist:**
- [ ] All tests pass (`npm run test` - 516 tests)
- [ ] No linting errors (`npm run lint` - includes markdown linting)
- [ ] Build succeeds (`npm run build`)
- [ ] Changes committed with `report_progress`

**If ANY step fails, fix the issues before committing. This prevents regressions and maintains code quality.**

**💡 Remember: Testing and linting are not optional - they are mandatory parts of the development workflow!**
