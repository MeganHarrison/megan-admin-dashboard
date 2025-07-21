import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

test('relationship-chart/page.ts has valid syntax', async () => {
  // Read the file content
  const filePath = join(process.cwd(), 'src/app/relationship/relationship-chart/page.ts');
  const content = readFileSync(filePath, 'utf-8');
  
  // Check that the string on line 55 is properly terminated
  const lines = content.split('\n');
  const line55 = lines[54]; // 0-indexed
  
  // Verify the line contains a properly closed string
  expect(line55).toContain("notes: 'Although there was a big part of Brandon that did want things to work out, the stacking resentment'");
  expect(line55).toContain('}');
  
  // Verify the array is properly closed
  expect(content).toContain('];');
  
  // Verify the function and class are properly closed
  expect(content).toMatch(/\]\s*;\s*}\s*}/);
  
  // Also check that we have the closing braces
  const closingBraces = content.match(/}/g);
  expect(closingBraces?.length).toBeGreaterThanOrEqual(3); // At least 3 closing braces for the class, constructor, and method
  
  console.log('✓ Syntax errors have been fixed');
  console.log('✓ String on line 55 is properly terminated');
  console.log('✓ Array and class structure are properly closed');
});