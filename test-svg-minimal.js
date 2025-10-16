// Minimal test to reproduce the Resvg error
const { Resvg } = require('@resvg/resvg-js');

// Test different SVG strings to find the issue
const tests = [
  // Test 1: Minimal SVG
  `<svg width="800" height="480" xmlns="http://www.w3.org/2000/svg"></svg>`,
  
  // Test 2: With rect
  `<svg width="800" height="480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="white"/></svg>`,
  
  // Test 3: With text element (kebab-case)
  `<svg width="800" height="480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="white"/><text x="400" y="30" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="black">Week Agenda</text></svg>`,
  
  // Test 4: With camelCase (should fail)
  `<svg width="800" height="480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="white"/><text x="400" y="30" fontFamily="Arial" fontSize="24" fontWeight="bold" textAnchor="middle" fill="black">Week Agenda</text></svg>`,
];

tests.forEach((svg, i) => {
  console.log(`\nTest ${i + 1}:`);
  console.log('Length:', svg.length);
  console.log('Char at 116:', svg[116] || 'N/A');
  console.log('Substring 110-130:', svg.substring(110, 130));
  
  try {
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 800 } });
    const png = resvg.render().asPng();
    console.log('✓ Success - PNG size:', png.length);
  } catch (error) {
    console.log('✗ Error:', error.message);
    if (error.message.includes('at 1:')) {
      const pos = error.message.match(/at 1:(\d+)/)?.[1];
      if (pos) {
        console.log(`  Error at position ${pos}: "${svg[pos-1]}"`);
      }
    }
  }
});
