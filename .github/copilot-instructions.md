# ABC-List Learning Application

ABC-List is a React/TypeScript/Vite web application implementing Vera F. Birkenbihl's learning methodology with ABC-Lists, KaWa (word associations), KaGa (graphical associations), and Stadt-Land-Fluss (quick knowledge retrieval game). This application helps users create learning materials using brain-compatible learning techniques.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Prerequisites and Setup
- Node.js version 20+ and npm are required
- Repository uses React 19, TypeScript, Vite 7, and Tailwind CSS 4

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

**Always run these commands before committing to ensure CI passes:**

1. **Pre-commit validation (required for CI):**
   ```bash
   npm run lint && npm run format:check && npm run test && npm run build
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
- Follow existing naming conventions and TypeScript patterns
- Update imports in parent components as needed

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
