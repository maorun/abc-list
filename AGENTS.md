# Agent Instructions for `abc-list-web` Repository

Welcome, agent! This document provides instructions and guidelines for working on this repository. Please read it carefully before making any changes.

## 1. Project Overview

This is a web application built with **React**, **TypeScript**, and **Vite**. It uses **Tailwind CSS** for styling and **Vitest** for testing.

The main application logic is in the `src` directory. Components are located in `src/components`.

## 2. Development Workflow

### 2.1. Prerequisites

Before you start, make sure you have Node.js and npm installed.

### 2.2. Installing Dependencies

To install the project dependencies, run the following command from the root of the repository:

```bash
npm install
```

### 2.3. Running the Development Server

To start the local development server, run:

```bash
npm run dev
```

The server will be accessible at `http://localhost:5173` (or the next available port).

### 2.4. Building for Production

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

**Important:** Before submitting any changes, you **must** ensure all existing tests pass. For new features, you should add corresponding tests. For bug fixes, you should add a test that reproduces the bug and verifies the fix.

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

Thank you for your contribution!
