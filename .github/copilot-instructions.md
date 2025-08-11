# ABC-List Learning Application

ABC-List is a React/TypeScript/Vite web application implementing Vera F. Birkenbihl's learning methodology with ABC-Lists, KaWa (word associations), KaGa (graphical associations), and Stadt-Land-Fluss (quick knowledge retrieval game). This application helps users create learning materials using brain-compatible learning techniques.

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

**Always run these commands before committing to ensure CI passes:**

1. **Complete validation pipeline (required for CI):**
   ```bash
   npm run test && npm run build && npm run lint && npm run format:check
   ```
   - Total time: ~15-20 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
   - All commands must pass for CI to succeed

2. **CI Pipeline runs:**
   - Test job: Runs `npm test`
   - Lint job: Runs `npm run lint` 
   - Prettier job: Runs `npm run format:check`
   - Build job: Runs `npm run build`
   - Uses Node.js 22.x on Ubuntu

## Project Structure

### Key Directories and Files
```
/src
  /components          # React components organized by feature
    /Kaga             # KaGa (graphical associations) components
    /Kawa             # KaWa (word associations) components
    /List             # ABC-List components
    /LinkLists        # List linking functionality
    /StadtLandFluss   # Stadt-Land-Fluss game components
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
- Use proper type annotations for function parameters and return values
- Define interfaces for all data structures, especially those used in multiple components
- Avoid type assertions (`as`) unless absolutely necessary with proper justification
- **STRICTLY FORBIDDEN: Never use ESLint disable comments** (e.g., `// eslint-disable-next-line`)
  - Instead of disabling ESLint rules, fix the underlying issue by:
    - Adding proper dependencies to useEffect hooks
    - Using useCallback to stabilize function references 
    - Moving pure functions outside components to avoid unnecessary re-creation
    - Restructuring code to follow React best practices
  - ESLint rules exist for good reasons and should not be suppressed

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
