'use client';

import { useEffect } from 'react';
import { initMockApi } from '@/lib/mockApi';

export function MockApiInit() {
  // Initialize immediately in render if in browser
  if (typeof window !== 'undefined') {
    initMockApi();
  }

  useEffect(() => {
    initMockApi();
  }, []);

  return null;
}
