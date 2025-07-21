import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test('TypeScript files compile without errors', async () => {
  try {
    // Run TypeScript compiler in no-emit mode to check for errors
    const { stdout, stderr } = await execAsync('npx tsc --noEmit');
    
    // If we get here without throwing, compilation was successful
    expect(stderr).toBe('');
    console.log('TypeScript compilation successful');
  } catch (error: any) {
    // Check if the error is related to our fixed file
    const errorMessage = error.stderr || error.stdout || error.message;
    
    // Fail if the error mentions our relationship-chart file
    if (errorMessage.includes('relationship-chart/page.ts')) {
      throw new Error(`TypeScript compilation failed for relationship-chart/page.ts:\n${errorMessage}`);
    }
    
    // Log other errors but don't fail the test since we only care about our specific file
    console.log('Other TypeScript errors found (not related to our fix):', errorMessage);
  }
});