const regex = /^[#>\-*+`\d]/;
const tests = [
  { input: '# Heading', expected: true },
  { input: '> Quote', expected: true },
  { input: '- List', expected: true },
  { input: '* List', expected: true },
  { input: '+ List', expected: true },
  { input: '1. List', expected: true },
  { input: '` Code', expected: true },
  { input: 'Normal text', expected: false },
];

let failed = false;
tests.forEach(({ input, expected }) => {
  const result = regex.test(input);
  if (result !== expected) {
    console.error(`Test failed for "${input}": expected ${expected}, got ${result}`);
    failed = true;
  }
});

if (!failed) {
  console.log("Regex verification passed!");
} else {
  process.exit(1);
}
