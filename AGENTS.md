# Agent Instructions for `abc-list` Repository

Welcome, agent! This document provides instructions and guidelines for working on this repository. Please read it carefully before making any changes.

## 1. Project Overview

This is a web application built with **React**, **TypeScript**, and **Vite**. It uses **Tailwind CSS** for styling and **Vitest** for testing. The application follows **mobile-first responsive design principles**.

ABC-List implements Vera F. Birkenbihl's learning methodology with multiple learning modes:
- **ABC-Lists**: Create association lists for any topic using letters A-Z
- **KaWa (Word Associations)**: Build associations for each letter of a specific word
- **KaGa (Graphical Associations)**: Visual learning with drawing tools and graphical elements
- **Stadt-Land-Fluss**: Quick knowledge retrieval game training with customizable categories and timer-based rounds

**Key Technical Features:**
- Mobile-first responsive design with hamburger navigation
- shadcn/ui components for consistent UI
- Accessibility-focused implementation
- Touch-friendly interface for mobile devices

The main application logic is in the `src` directory. Components are located in `src/components`.

## 2. Development Workflow

### 2.1. Prerequisites

Before you start, make sure you have Node.js and npm installed.

### 2.2. Test-First Development Approach

**CRITICAL: Always follow the test-first workflow to prevent breaking functionality.**

**Recommended development sequence:**

1. **Test First** - Always verify functionality works before making changes:
   ```bash
   npm run test
   ```
   - Takes ~8 seconds, set timeout to 30+ seconds
   - Ensures all 153 tests pass before proceeding
   - Validates that existing functionality works correctly

2. **Build Verification** - Confirm the application builds successfully:
   ```bash
   npm run build
   ```
   - Takes ~2-3 seconds, set timeout to 60+ seconds
   - Ensures production build works before making changes

3. **Make Changes** - Implement your modifications with confidence

4. **Test Again** - Verify your changes don't break anything:
   ```bash
   npm run test
   ```

5. **Fix Linting Last** - Address code style only after functionality is confirmed:
   ```bash
   npm run lint
   npm run format     # Auto-fix formatting issues
   ```

**Why test first?** Tests verify functionality works correctly. Linting only addresses code style. Fixing linting first can accidentally break working code, while testing first ensures functionality remains intact throughout the development process.

### 2.3. Installing Dependencies

To install the project dependencies, run the following command from the root of the repository:

```bash
npm install
```

### 2.4. Running the Development Server

To start the local development server, run:

```bash
npm run dev
```

The server will be accessible at `http://localhost:5173` (or the next available port).

### 2.5. Building for Production

To create a production-ready build, run:

```bash
npm run build
```

The output files will be placed in the `dist` directory. Do not edit these files directly; always modify the source files in `src`.

## 3. Testing

This project uses **Vitest** for unit and component testing. Test files are located alongside the source files, with a `.test.tsx` extension.

### 3.1. Running Tests

To run all tests once, use:

```bash
npm run test
```

To run tests and view coverage:

```bash
npm run coverage
```

**Important:** Before submitting any changes, you **must** ensure all existing tests pass. The project currently has 78 tests covering all components including ABC-Lists, KaWa, KaGa, Stadt-Land-Fluss, and UI utilities. For new features, you should add corresponding tests. For bug fixes, you should add a test that reproduces the bug and verifies the fix.

## 4. Coding Style

This project uses **Prettier** and **ESLint** to enforce a consistent code style. Configuration files for Prettier and ESLint are included in the repository.

To check for linting errors, run:

```bash
npm run lint
```

To automatically fix formatting and linting issues, run:

```bash
npm run format
```

Please ensure your code adheres to these styles. It's recommended to integrate Prettier and ESLint into your editor to format code automatically on save.

### 4.1. Code Quality Requirements

- **STRICTLY FORBIDDEN: Never use ESLint disable comments** (e.g., `// eslint-disable-next-line`)
  - Instead of disabling ESLint rules, fix the underlying issue by:
    - Adding proper dependencies to useEffect hooks
    - Using useCallback to stabilize function references 
    - Moving pure functions outside components to avoid unnecessary re-creation
    - Restructuring code to follow React best practices
  - ESLint rules exist for good reasons and should not be suppressed
- **Never use `any` type in TypeScript** - Always use proper type annotations
- Use proper type annotations for function parameters and return values
- Define interfaces for all data structures used in multiple components

## 5. Commit Messages

Please follow the conventional commit format for your commit messages. This helps maintain a clear and understandable commit history.

A commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Example:**

```
feat(components): Add a new Button component

This commit introduces a new reusable Button component with support for different variants (primary, secondary, and destructive).

Closes #42
```

Common types include `feat`, `fix`, `docs`, `style`, `refactor`, `test`, and `chore`.

## 7. Performance Optimization Pattern: Function Extraction

### Critical: Production Rerender Prevention

**✅ IMPLEMENTED ACROSS ALL COMPONENTS:** Function extraction pattern has been applied to critical components including Navigation, ListItem, Letter, SavedWord, DeleteConfirm, NewStringItem, and KawaLetter to prevent production rerender loops.

To prevent production rerender loops and optimize React.memo performance, **extract ALL function definitions outside React components**:

```typescript
// ✅ CORRECT: Extract functions outside component
const handleExportAsJSON = (item: string, setData: (data: string) => void) => {
  const jsonString = JSON.stringify(createExportData(item), null, 2);
  setData(jsonString);
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
  const [data, setData] = useState("");
  
  // Create stable reference inside component
  const exportAsJSON = () => handleExportAsJSON(item, setData);
  const handleAddWord = () => handleAddWordAction(newWord, words, storageKey, setWords, setNewWord, setIsModalOpen);
  
  return <button onClick={exportAsJSON}>Export</button>;
}

// ❌ WRONG: Functions inside component recreate on every render
function MyComponent() {
  const exportAsJSON = () => {  // ← New function reference each render
    // ... logic
  };
  
  const handleAddWord = () => {  // ← Another new function reference each render
    // ... logic
  };
  
  return <button onClick={exportAsJSON}>Export</button>;
}
```

### Components Successfully Updated

**✅ Navigation Component:** Prevents app-wide rerenders by stabilizing navigation handlers
**✅ ListItem Component:** Eliminates localStorage access loops during production rerenders  
**✅ Letter Component:** Stabilizes word management functions (add, delete, explanation, rating)
**✅ SavedWord Component:** Optimizes word interaction handlers and modal controls
**✅ KawaLetter Component:** Stabilizes text change handlers using useMemo for storage keys
**✅ DeleteConfirm Component:** Prevents recreation of delete confirmation handlers
**✅ NewStringItem Component:** Stabilizes item creation and dialog management functions

### Avoid useEffect When Possible

Replace useEffect with direct computation:

```typescript
// ✅ CORRECT: Direct computation
export function ListItem() {
  const {item} = useParams<{item: string}>();
  const cacheKey = getCacheKey(item);
  
  if (item) setDocumentTitle(item);
  
  if (!item || !cacheKey) {
    return <div>Loading...</div>;
  }
  
  return <div>Content...</div>;
}

// ❌ WRONG: useEffect creates dependency chains
export function ListItem() {
  const {item} = useParams<{item: string}>();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {  // ← Creates timing issues and rerenders
    if (item) {
      document.title = `ABC-Liste für ${item}`;
      const timer = setTimeout(() => setIsReady(true), 0);
      return () => clearTimeout(timer);
    }
  }, [item]);
  
  if (!isReady) return <div>Loading...</div>;
  return <div>Content...</div>;
}
```

### Why This Matters

- **Production builds** behave differently than development
- **Global components** (like Navigation) cause app-wide rerenders
- **React.memo** fails when function references change
- **localStorage access** during rerenders indicates performance issues

### Testing Pattern

Always verify no rerender loops in tests:

```typescript
it("should prevent production rerender loops", async () => {
  let accessCount = 0;
  const originalGetItem = localStorage.getItem;
  
  localStorage.getItem = function(...args) {
    accessCount++;
    return originalGetItem.apply(this, args);
  };
  
  for (let i = 0; i < 10; i++) {
    rerender(<Component />);
  }
  
  expect(accessCount).toBe(0); // Should be 0 with proper function extraction
});
```

Thank you for your contribution!
