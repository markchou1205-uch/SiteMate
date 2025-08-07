// src/lib/dev-checklist.ts
"use client";

/**
 * Runs a series of development-only checks and logs warnings to the console.
 * This acts as an automated reminder for developers to adhere to critical UI/UX and architectural guidelines.
 */
export const runDevChecklist = () => {
    if (process.env.NODE_ENV === 'development') {
        console.groupCollapsed('%c[WujiPDF Dev Checklist] - Click to expand', 'color: #7c3aed; font-weight: bold; padding: 2px 4px; border: 1px solid #7c3aed; border-radius: 4px;');
        
        console.log('%cEngineering Guide: /docs/engineering-guide.md', 'font-style: italic; color: #9ca3af;');

        console.group('%c① UI Consistency Checks', 'font-weight: bold;');
        console.warn('Ensure thumbnail action buttons (Rotate, Copy, Delete) are always visible, not just on :hover.');
        console.warn('Ensure rotating a thumbnail does NOT rotate its action buttons, page number, or checkbox.');
        console.groupEnd();
        
        console.group('%c② State Management Checks', 'font-weight: bold;');
        console.warn('Verify that all state changes originate from usePdfLoader.ts. Components should only call props functions.');
        console.warn('Asynchronous operations (e.g., thumbnail rendering) must NOT call setState directly. Use a queue/batch update pattern.');
        console.groupEnd();
        
        console.group('%c③ Testing Checks', 'font-weight: bold;');
        console.warn('Have you added a data-testid for any new interactive element?');
        console.warn('Have you run the manual regression checklist in engineering-guide.md?');
        console.groupEnd();
        
        console.log('%cRemember: "A stable feature today is better than a perfect feature tomorrow." - The Dev Team', 'color: #16a34a; font-weight: bold;');

        console.groupEnd();
    }
};
