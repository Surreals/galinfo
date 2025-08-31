# AI Rules for this Application

This document outlines the technical stack and guidelines for developing this Next.js application.

## Tech Stack

*   **Framework**: Next.js (App Router) for building server-rendered React applications.
*   **Language**: TypeScript for type-safe and robust code development.
*   **Styling**: Tailwind CSS for utility-first styling, complemented by SCSS/CSS Modules for component-specific styles.
*   **UI Components**: Utilizes Ant Design for existing components (e.g., Carousel). For new components, `shadcn/ui` and `Radix UI` are preferred for accessible and customizable UI.
*   **Routing**: Leverages Next.js's built-in file-system based routing (App Router).
*   **HTTP Client**: `axios` for making API requests.
*   **Icons**: `lucide-react` for vector icons.
*   **Font Optimization**: `next/font` for optimizing and loading Google Fonts (Open Sans).
*   **Utility**: `classnames` for conditionally joining CSS class names.

## Library Usage Rules

*   **General UI Components**:
    *   For new UI components, **always prefer `shadcn/ui` components**. They are pre-built and styled with Tailwind CSS, ensuring consistency and accessibility.
    *   If a specific `shadcn/ui` component is not available or doesn't meet requirements, consider building it using `Radix UI` primitives for headless components, then style with Tailwind CSS.
    *   Existing Ant Design components (like `Carousel`) should be maintained, but new carousel implementations should consider `shadcn/ui` alternatives if available.
*   **Styling**:
    *   **Default to Tailwind CSS utility classes** for all styling.
    *   Use **CSS Modules (or SCSS Modules)** for component-specific styles that require complex logic, variables, or cannot be easily achieved with Tailwind utilities alone. Avoid global CSS unless absolutely necessary (e.g., `globals.css` for base styles).
*   **Data Fetching**: Use `axios` for all HTTP requests to external APIs.
*   **Icons**: Use icons from the `lucide-react` library.
*   **State Management**: For local component state, use React's `useState` and `useReducer` hooks. For global or shared state, consider React Context API (`useContext`) for simpler cases. Avoid external state management libraries unless the application complexity explicitly demands it.
*   **Image Handling**: Always use Next.js's `next/image` component for optimized image loading and performance.
*   **Routing**: All navigation should be handled using Next.js's `Link` component and the App Router's conventions.