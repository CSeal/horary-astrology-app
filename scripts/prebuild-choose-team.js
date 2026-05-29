#!/usr/bin/env node
/**
 * Interactive prebuild with team selection.
 * Usage: npm run prebuild:choose [-- --no-clean]
 *
 * Known teams — update when org account is ready:
 *   DGAHHMV358  Anton Manuzin (personal) — current default
 *   TODO        AstraSk org team         — replace when invite received
 */

const { execSync } = require('child_process');
const readline = require('readline');

const TEAMS = [
  { id: 'DGAHHMV358', label: 'Anton Manuzin (personal) — current default' },
  { id: 'TODO_ORG_TEAM', label: 'AstraSk org — fill in when invite received' },
];

const args = process.argv.slice(2);
const clean = !args.includes('--no-clean');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('\nAvailable Apple teams:\n');
TEAMS.forEach((t, i) => console.log(`  [${i + 1}] ${t.id}  —  ${t.label}`));
console.log('');

rl.question('Select team [1]: ', (answer) => {
  rl.close();

  const index = parseInt(answer || '1', 10) - 1;
  const team = TEAMS[index];

  if (!team) {
    console.error('Invalid selection.');
    process.exit(1);
  }

  if (team.id === 'TODO_ORG_TEAM') {
    console.error('\n⚠️  Org team ID not set yet. Update TEAMS in scripts/prebuild-choose-team.js first.\n');
    process.exit(1);
  }

  const cmd = `APPLE_TEAM_ID=${team.id} npx expo prebuild${clean ? ' --clean' : ''}`;
  console.log(`\n→ Running: ${cmd}\n`);

  try {
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, APPLE_TEAM_ID: team.id } });
  } catch {
    process.exit(1);
  }
});
