# ABC-List Learning Application

ABC-List is a React/TypeScript/Vite web application implementing Vera F. Birkenbihl's learning methodology with ABC-Lists, KaWa (word associations), KaGa (graphical associations), Stadt-Land-Fluss (quick knowledge retrieval game), and Sokrates spaced repetition system. This application helps users create learning materials using brain-compatible learning techniques with scientifically-backed retention optimization.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

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
   - Runs 78 tests across 15 test files using Vitest
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
   - Available at `http://localhost:5173/abc-list/` (note the base path)
   - Uses Vite with HMR for fast development

2. **Linting and formatting:**
   ```bash
   npm run lint          # Check ESLint rules
   npm run format        # Auto-fix Prettier formatting
   npm run format:check  # Check formatting without fixing
   ```
   - Linting takes ~2-5 seconds. Set timeout to 30+ seconds.
   - Uses ESLint 9 with TypeScript, React, and accessibility rules
   - Prettier configured with specific rules (no bracket spacing, double quotes, trailing commas)

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

### 7. Sokrates Spaced Repetition System
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
   - **Mandatory Workflow Validation**: Ensures Test→Code→Lint sequence is followed
   - **Build Output Verification**: Validates dist directory and critical files
   - **Documentation Check**: Warns when new features lack documentation updates

4. **CI Pipeline Jobs:**
   - **Code Quality Checks**: Forbidden patterns, TypeScript strict mode
   - **Build Validation**: Production build verification with output checks
   - **Coverage Validation**: Test coverage generation and reporting  
   - **Documentation Validation**: New feature documentation requirements (PR only)
   - **Complete Pipeline**: Final validation with comprehensive reporting

## Project Structure

### Key Directories and Files
```
/src
  /components          # React components organized by feature
    /Kaga             # KaGa (graphical associations) components
    /Kawa             # KaWa (word associations) components
    /List             # ABC-List components
    /LinkLists        # List linking functionality
    /Search           # Search and tagging system components
    /SokratesCheck    # Spaced repetition system components
    /StadtLandFluss   # Stadt-Land-Fluss game components
  /lib                # Utility libraries and algorithms
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
- `vite.config.ts` - Vite configuration with base path `/abc-list/`
- `tailwind.config.js` - Tailwind CSS configuration
- `eslint.config.js` - ESLint rules and plugins
- `.prettierrc.cjs` - Code formatting rules
- `tsconfig.json` - TypeScript configuration

## Common Tasks

### Adding New Components
- Create components in appropriate subdirectory under `/src/components`
- Include corresponding `.test.tsx` file with React Testing Library tests
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
- **Routing problems:** Application uses base path `/abc-list/` for GitHub Pages

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
