
"use client";

import { useEffect } from 'react';
import { runDevChecklist } from '@/lib/dev-checklist';

/**
 * A client component responsible for running development-only checks.
 * This component is intentionally left empty and only contains a useEffect
 * to trigger the checklist logic on the client-side during development.
 */
const DevChecklistRunner = () => {
  useEffect(() => {
    runDevChecklist();
  }, []);

  return null;
};

export default DevChecklistRunner;
