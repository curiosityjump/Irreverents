export {};
// INTENT: these commands are cited by the docs but land with Step 1 Gate 2.
// They exit non-zero on purpose: a stub that exits 0 would read as a passing check.
const command = process.argv[2] ?? 'this command';
console.error(`npm run ${command}: lands with Step 1 Gate 2`);
process.exit(1);
