# Agent Instructions for `abc-list` Repository

Welcome, agent! This document provides instructions and guidelines for working on this repository. Please read it carefully before making any changes.

## 1. Project Overview

This is a web application built with **React**, **TypeScript**, and **Vite**. It uses **Tailwind CSS** for styling and **Vitest** for testing. The application follows **mobile-first responsive design principles**.

ABC-List implements Vera F. Birkenbihl's learning methodology with multiple learning modes:
- **ABC-Lists**: Create association lists for any topic using letters A-Z
- **KaWa (Word Associations)**: Build associations for each letter of a specific word
- **KaGa (Graphical Associations)**: Visual learning with drawing tools and graphical elements
- **Stadt-Land-Fluss**: Quick knowledge retrieval game training with customizable categories and timer-based rounds
- **Sokrates Check**: Scientifically-backed spaced repetition system for optimal learning retention using the Ebbinghaus forgetting curve
- **Gamification System**: Comprehensive achievement and motivation system with daily streaks, challenges, levels, and leaderboards
- **Search & Tagging System**: Intelligent full-text search with automated tagging, smart collections, and advanced filtering across all content types
- **Community Hub**: Collaborative learning platform with user profiles, mentoring system, peer reviews, community challenges, and success stories

**Key Technical Features:**
- Mobile-first responsive design with hamburger navigation
- shadcn/ui components for consistent UI
- Accessibility-focused implementation
- Touch-friendly interface for mobile devices

The main application logic is in the `src` directory. Components are located in `src/components`.

## 2. Development Workflow

### 2.1. Prerequisites

Before you start, make sure you have Node.js and npm installed.

### 2.2. Enhanced Validation and Enforcement

**CRITICAL: Use the automated validation script before any commits:**

```bash
npm run validate:copilot
```

This comprehensive script enforces all guidelines from copilot-instructions.md:
- ✅ Detects forbidden 'any' type usage automatically
- ✅ Prevents ESLint disable comments  
- ✅ Enforces TypeScript strict mode compilation
- ✅ Validates the mandatory Test→Code→Lint workflow
- ✅ Verifies build success and output integrity
- ✅ Generates test coverage reports
- ✅ Provides colored, detailed feedback on each step

### 2.3. The Mandatory Development Workflow

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

**Important:** Before submitting any changes, you **must** ensure all existing tests pass. The project currently has tests covering all components including ABC-Lists, KaWa, KaGa, Stadt-Land-Fluss, Sokrates spaced repetition system, and UI utilities. For new features, you should add corresponding tests. For bug fixes, you should add a test that reproduces the bug and verifies the fix.

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
  - **AUTOMATED ENFORCEMENT**: The enhanced CI pipeline automatically detects and blocks ESLint disable comments
  - Instead of disabling ESLint rules, fix the underlying issue by:
    - Adding proper dependencies to useEffect hooks
    - Using useCallback to stabilize function references 
    - Moving pure functions outside components to avoid unnecessary re-creation
    - Restructuring code to follow React best practices
  - ESLint rules exist for good reasons and should not be suppressed
- **Never use `any` type in TypeScript** - Always use proper type annotations
  - **AUTOMATED ENFORCEMENT**: The enhanced CI pipeline automatically detects and blocks 'any' type usage
  - Enhanced TypeScript strict mode with comprehensive flags prevents implicit any usage
- Use proper type annotations for function parameters and return values
- Define interfaces for all data structures used in multiple components

### 4.2. Enhanced CI/CD Pipeline

The repository now includes a comprehensive CI/CD pipeline that automatically enforces all guidelines:

**Code Quality Enforcement:**
- Automatic detection of forbidden 'any' type usage
- Prevention of ESLint disable comments
- TypeScript strict compilation validation
- Enhanced ESLint rules with type-aware linting

**Workflow Validation:**
- Enforces the mandatory Test→Code→Lint sequence
- Build validation with output verification
- Test coverage generation and validation
- Documentation update validation for new features

**Local Development Support:**
- `npm run validate:copilot` - Comprehensive validation script
- `npm run precommit` - Pre-commit validation hook
- Colored output with detailed error reporting
- Step-by-step guidance for fixing issues

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

## 8. Enhanced GitHub Copilot Workflow Enforcement

### 8.1. Automated Validation

The repository includes comprehensive automation to ensure GitHub Copilot reliably follows all guidelines:

**Validation Script (`scripts/validate-copilot-guidelines.sh`):**
- Comprehensive pre-commit validation with colored output
- Enforces all guidelines from `.github/copilot-instructions.md`
- Provides clear error messages and fix guidance
- Integrated with npm scripts for easy access

**Usage:**
```bash
# Run comprehensive validation (recommended before any commit)
npm run validate:copilot

# Quick pre-commit check
npm run precommit

# Manual validation pipeline (fallback)
npm run test && npm run build && npm run lint && npm run format:check
```

**Validation Features:**
- ✅ Forbidden 'any' type detection with TypeScript patterns
- ✅ ESLint disable comment prevention
- ✅ TypeScript strict mode compilation enforcement
- ✅ Mandatory workflow sequence validation (Test→Code→Lint)
- ✅ Build output verification and integrity checks
- ✅ Test coverage generation and validation
- ✅ Detailed reporting with step-by-step guidance

### 8.2. CI/CD Pipeline Enhancements

**Enhanced Workflow (`.github/workflows/ci.yml`):**
- **Code Quality Checks**: Multi-layered validation before any other jobs
- **TypeScript Strict Mode**: Enhanced compilation with comprehensive flags  
- **Build Validation**: Production build verification with output checks
- **Coverage Validation**: Automated test coverage generation
- **Documentation Validation**: Warns when new features lack documentation

**Enforcement Mechanisms:**
- Automatic blocking of commits with forbidden patterns
- Enhanced TypeScript configuration with strict flags
- ESLint configuration with type-aware rules
- Comprehensive error reporting and fix guidance

This ensures GitHub Copilot consistently follows the established guidelines without manual intervention.

### 9.1. Overview

The Sokrates spaced repetition system implements a scientifically-backed learning algorithm based on the Ebbinghaus forgetting curve. This transforms the ABC-Lists from simple self-assessment tools into optimized learning systems that adapt to individual performance and maximize long-term retention.

### 9.2. Core Components

**Spaced Repetition Algorithm (`src/lib/spacedRepetition.ts`)**
- SM-2 based intervals with dynamic ease factor adjustments
- Rating-based initial intervals: 1★=1day, 2★=2days, 3★=4days, 4★=7days, 5★=14days
- Forgetting curve adaptation that increases intervals for good performance and resets for poor performance
- Comprehensive statistics including retention rate, mastery tracking, and performance analytics

**Settings Component (`src/components/SokratesCheck/SpacedRepetitionSettings.tsx`)**
- Algorithm customization: Base interval, ease factor, min/max intervals
- Preset configurations: Intensiv (aggressive), Standard (balanced), Entspannt (relaxed)
- Real-time preview showing how settings affect review intervals
- Notification management with quiet hours and frequency control

**Dashboard Component (`src/components/SokratesCheck/SokratesDashboard.tsx`)**
- Advanced metrics: Retention rate, mastery progress, average intervals
- Visual analytics: Interval distribution charts, algorithm status indicators
- KI-based recommendations tailored to learning patterns
- Performance tracking across multiple ABC lists

**Review Component (`src/components/SokratesCheck/SokratesReview.tsx`)**
- Bulk review functionality with list selection dialog
- Session optimization with recommended sizes (10-25 terms based on cognitive load research)
- Priority scheduling: Earliest due terms first, then by difficulty
- Interval preview showing next review date for each rating choice

**Notification System (`src/lib/notifications.ts`)**
- Intelligent scheduling: Daily, twice-daily, or hourly check frequencies
- Quiet hours: Respects user sleep/work schedules (default: 22:00-08:00)
- Permission management: Graceful handling of browser notification permissions
- Non-intrusive design: Auto-closing notifications with click-to-open functionality

### 9.3. Data Model Enhancement

The existing `WordWithExplanation` interface has been enhanced with spaced repetition fields:

```typescript
interface WordWithExplanation {
  // Existing fields...
  repetitionCount?: number;    // Review history count
  easeFactor?: number;         // Individual difficulty factor (2.5 default)
  interval?: number;           // Current review interval in days
  nextReviewDate?: string;     // Calculated next review date (ISO string)
}
```

### 9.4. Algorithm Examples

**First Review Sequence:**
- Rating 4 (good) → 7 days next review
- Second review with rating 4 → ~17 days (7 × 2.5 ease factor)
- Poor performance with rating 2 → reset to 1 day, reduce ease factor

**Progressive Learning:**
- Terms with consistent good ratings get longer intervals
- Difficult terms get shorter intervals and more frequent reviews
- Algorithm adapts to individual learning patterns

### 9.5. Testing Coverage

The spaced repetition system includes comprehensive test coverage:
- Algorithm behavior across all rating scenarios (1-5 stars)
- Edge case handling (invalid dates, extreme intervals, first reviews)
- Performance demonstration with forgetting curve simulation
- Statistics calculation accuracy and retention metrics
- Notification system functionality and permission handling

### 9.6. Backwards Compatibility

- Existing SavedWord data automatically upgrades with spaced repetition fields
- Legacy 7-day review logic serves as fallback for data without spaced repetition
- All existing ABC-List functionality preserved
- Gradual migration to spaced repetition without data loss

### 9.7. Mobile-First Design

All Sokrates components follow the existing mobile-first responsive design principles:
- Touch-friendly interface elements with adequate spacing
- Responsive charts and dialogs that work on mobile and desktop
- Hamburger navigation integration for mobile devices
- Optimized performance for mobile browsers

## 10. Search & Tagging System

### 10.1. Overview

The comprehensive search and tagging system transforms ABC-List into an intelligent content organization platform. It provides full-text search capabilities, automated tag suggestions, smart collections, and advanced filtering across all content types (ABC-Lists, KaWa, KaGa, and individual words).

### 10.2. Core Components

**SearchService (`src/lib/searchService.ts`)**
- Singleton service managing search indexing and querying
- Full-text search with relevance scoring and highlighting
- Multi-criteria filtering (type, tags, dates, ratings, favorites)
- Search history tracking with persistence

**TaggingService (`src/lib/taggingService.ts`)**
- AI-powered automatic tag suggestions based on German educational content
- Subject area detection (Mathematik, Physik, Biologie, etc.)
- Difficulty level and format-specific tag recognition
- Tag validation and duplicate prevention

**SearchAndFilter Component (`src/components/Search/SearchAndFilter.tsx`)**
- Main search interface with tabbed layout (Search Results, Smart Collections, Search History, Favorites)
- Real-time search with debounced input and live results
- Advanced filter UI with expandable sections
- Mobile-first responsive design

### 10.3. Smart Collections System

Automated content organization with four intelligent collections:

- **Favorites**: User-marked important content with heart icon
- **Recent**: Items created/modified in the last 7 days
- **Untagged**: Content without tags needing categorization
- **Most Used**: Items based on search frequency and access patterns

Each collection displays real-time statistics and provides quick action buttons for content management.

### 10.4. Search Features

**Full-Text Search Engine:**
- Searches across ABC-List titles, KaWa/KaGa content, and individual words
- Relevance scoring algorithm based on title matches, content frequency, and recency
- Context-aware result highlighting with text snippets
- Real-time search suggestions and auto-complete

**Advanced Filtering:**
- Content type filtering (ABC-Lists, KaWa, KaGa, Words)
- Tag-based multi-select filtering
- Date range filtering for content discovery
- Rating and favorites-based filtering
- Content presence filtering (items with/without explanations)

**Search History Management:**
- Persistent search history with frequency tracking
- Quick re-execution of previous searches
- Popular search term identification
- Search analytics and pattern recognition

### 10.5. Tagging System

**Automated Tag Suggestions:**
- German educational content recognition with subject categorization
- Difficulty level detection (Anfänger, Fortgeschritten, Experte)
- Format-specific tags (Vokabeln, Prüfung, Definitionen, Übung)
- Content analysis for custom tag generation

**Tag Management:**
- Manual tag addition/removal with validation
- Bulk tag operations across multiple items
- Similar tag detection to prevent duplication
- Popular tags tracking and usage statistics

**German Language Support:**
- Educational subject keywords (Mathematik, Physik, Chemie, etc.)
- Learning context detection (Schule, Studium, Beruf)
- Category-specific term recognition (Wissenschaft, Technik, Kultur)
- Intelligent categorization based on content analysis

### 10.6. Data Model Enhancement

Enhanced interfaces for search functionality:

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
```

### 10.7. Integration Points

**Navigation Integration:**
- New "Suchen" tab with search icon in main navigation
- Deep linking support for search results and filters
- Breadcrumb navigation for search contexts

**Feature Integration:**
- Direct navigation to found ABC-Lists, KaWa, and KaGa items
- Word-level search within lists with jump-to functionality
- Tag synchronization across all content types
- Favorites integration with existing rating systems

**Data Persistence:**
- localStorage integration for search history and preferences
- Tag data stored within existing content structures
- Backwards compatibility with existing ABC-List data
- Automatic migration of legacy content to searchable format

### 10.8. Testing Requirements

**Comprehensive Test Coverage:**
- Search functionality across all content types with edge cases
- Tag suggestion accuracy and German language recognition
- Filter combinations and complex query scenarios
- Performance testing with large content collections
- Mobile responsiveness and touch interaction testing

**Test Patterns:**
```typescript
// Test search accuracy
it("should find ABC-Lists by title and content", () => {
  const results = searchService.search({ query: "Mathematik" });
  expect(results).toContainEqual(expect.objectContaining({
    item: expect.objectContaining({ title: "Grundlagen Mathematik" })
  }));
});

// Test German tag suggestions
it("should suggest educational tags for German content", () => {
  const suggestions = taggingService.generateSuggestions("Physik Grundlagen");
  expect(suggestions).toContainEqual(expect.objectContaining({
    tag: "Wissenschaft",
    confidence: expect.any(Number)
  }));
});
```

### 10.9. Mobile-First Implementation

**Responsive Design:**
- Touch-friendly search interface with adequate spacing (minimum 44px)
- Responsive filter panels that work on mobile viewports (375px width)
- Collapsible filter sections for mobile optimization
- Swipe gestures for collection navigation

**Performance Optimization:**
- Function extraction pattern applied to all search components
- Debounced search input to prevent excessive API calls
- Lazy loading of search results and collections
- Efficient indexing with incremental updates

### 10.10. Development Guidelines

**When Working with Search:**
1. Always update search index after content modifications
2. Test tag suggestions with German educational content
3. Verify mobile responsiveness of search interfaces
4. Ensure backwards compatibility with existing data
5. Follow function extraction pattern for all event handlers
6. Add comprehensive test coverage for new search features

**Common Patterns:**
- Use `searchService.updateIndex()` after content changes
- Apply `taggingService.generateSuggestions()` for automatic tagging
- Follow mobile-first responsive design principles
- Implement proper error handling for search edge cases

## 11. Community Hub System

### 11.1. Overview

The Community Hub transforms ABC-List into a collaborative learning platform while maintaining its educational focus. It provides a centralized space for knowledge sharing, mentoring, and peer collaboration through five core features: user profiles, intelligent mentoring system, community challenges, peer review system, and success stories.

### 11.2. Core Components

**CommunityService (`src/lib/CommunityService.ts`)**
- Singleton service managing all community data with localStorage persistence
- Event-driven system for real-time UI updates
- Integration with existing Gamification and Basar systems
- Comprehensive error handling and graceful fallbacks

**Community Components (`src/components/Community/`)**
- **Community.tsx**: Main tabbed interface with mobile-first responsive design
- **UserProfile.tsx**: Profile creation and management with expertise areas
- **MentorshipManager.tsx**: Mentor finding and mentorship request workflows
- **CommunityChallenge.tsx**: Challenge participation and progress tracking
- **PeerReview.tsx**: Comprehensive review system for Basar contributions
- **FeaturedUsers.tsx**: Success stories and community inspiration

### 11.3. Data Models

**Core Interfaces:**
```typescript
interface CommunityProfile {
  userId: string;
  displayName: string;
  bio: string;
  expertise: UserExpertise[];
  mentorAvailable: boolean;
  menteeInterested: boolean;
  reputation: number;
  contributionCount: number;
}

interface MentorshipConnection {
  id: string;
  mentorId: string;
  menteeId: string;
  expertiseArea: string;
  status: "pending" | "active" | "completed" | "cancelled";
  sessionCount: number;
  rating?: number;
}

interface PeerReview {
  id: string;
  reviewerId: string;
  itemId: string;
  itemType: "abc-list" | "kawa" | "kaga";
  rating: number; // 1-5 stars
  categories: {
    accuracy: number;
    usefulness: number;
    clarity: number;
    creativity: number;
  };
  comment: string;
  helpfulnessRating: number;
}
```

### 11.4. Expertise Areas

**German Academic Subjects:**
The system includes 25+ predefined expertise areas matching the German educational context:
- STEM: Mathematik, Physik, Chemie, Biologie, Informatik, Technik, Ingenieurwesen
- Languages: Deutsch, Englisch, Französisch, Spanisch
- Humanities: Geschichte, Geographie, Politik, Philosophie, Rechtswissenschaft
- Social Sciences: Psychologie, Pädagogik, Wirtschaft
- Arts: Kunst, Musik
- Applied: Sport, Medizin, Naturwissenschaften, Geisteswissenschaften

### 11.5. Integration Points

**Gamification Integration:**
- Activity tracking for peer reviews and success story submissions
- Community challenge completion rewards
- Reputation system integration with existing achievement system
- Mentorship participation badges and recognition

**Navigation Integration:**
- New "Community" tab in main navigation with Users icon
- Deep linking support for community profiles and challenges
- Mobile-responsive tabbed interface with touch-friendly controls

**Data Persistence:**
- localStorage integration with COMMUNITY_STORAGE_KEYS
- Event-driven updates for real-time UI synchronization
- Backwards compatibility with existing user data and profiles
- Graceful error handling for localStorage and JSON parsing issues

### 11.6. Mobile-First Implementation

**Responsive Design Requirements:**
- Touch-friendly interface with minimum 44px touch targets
- Responsive profile cards and challenge layouts for mobile viewports
- Collapsible sections and expandable content for small screens
- Optimized form layouts for profile creation and mentorship requests

**Component Patterns:**
```jsx
// Mobile-first community profile layout
<div className="flex flex-col gap-4">
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
    <h2 className="text-2xl font-bold">Community Profil</h2>
    <div className="flex flex-col sm:flex-row gap-2">
      <Button className="w-full sm:w-auto">Profil bearbeiten</Button>
      <Button className="w-full sm:w-auto">Mentor werden</Button>
    </div>
  </div>
</div>
```

### 11.7. Testing Requirements

**Comprehensive Test Coverage (`src/lib/CommunityService.test.ts`):**
- Singleton pattern management and instance isolation
- User profile CRUD operations with validation
- Mentorship request workflows and status tracking
- Community challenge participation logic
- Peer review submission and retrieval with category scoring
- Success story management and featured user selection
- Event system functionality and listener management
- Error handling for localStorage failures and JSON parsing errors

**Test Isolation Patterns:**
```typescript
beforeEach(() => {
  localStorage.clear();
  CommunityService.resetInstance(); // Reset singleton for test isolation
  communityService = CommunityService.getInstance();
});
```

**Integration Testing:**
- Community data persistence across browser sessions
- Integration with existing Gamification and Basar systems
- Mobile responsiveness and touch interaction validation
- Backwards compatibility with existing user profiles

### 11.8. Performance Optimization

**Function Extraction Applied:**
All Community Hub components follow the function extraction pattern to prevent production rerenders:

```typescript
// Extracted handlers prevent recreation on every render
const handleProfileUpdateAction = (
  profileData: Partial<CommunityProfile>,
  setProfile: (profile: CommunityProfile) => void,
  onSuccess: () => void
) => () => {
  const communityService = CommunityService.getInstance();
  communityService.updateUserProfile(profileData);
  setProfile(communityService.getUserProfile()!);
  onSuccess();
};

// Inside component - create stable references
const handleProfileUpdate = () => 
  handleProfileUpdateAction(profileData, setProfile, onSuccess)();
```

### 11.9. Development Guidelines

**When Working with Community Features:**
1. Always test singleton instance management and data persistence
2. Verify mobile responsiveness of all community interfaces
3. Ensure integration with existing gamification and content systems
4. Follow function extraction pattern for all event handlers
5. Add comprehensive test coverage for new community features
6. Test error handling for localStorage and network failures

**Common Patterns:**
- Use `CommunityService.getInstance()` for all community operations
- Apply function extraction pattern to prevent React rerender loops
- Follow mobile-first responsive design principles
- Implement proper error boundaries and fallback states
- Ensure backwards compatibility with existing data structures
