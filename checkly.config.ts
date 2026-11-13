import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

// Project-wide settings and defaults.
// Docs: https://www.checklyhq.com/docs/constructs/project.md
export default defineConfig({
  projectName: 'Checkly Challenge',
  logicalId: 'checkly-challenge',
  // TODO: once the repo is on GitHub, add repoUrl: 'https://github.com/jacobburroughs-jpg/<repo>'
  checks: {
    frequency: Frequency.EVERY_10M,
    locations: ['us-east-1', 'eu-west-1'],
    // Which files contain construct code (groups, ApiChecks, alert channels).
    // Spec files are NOT listed here. The groups pick those up with their own testMatch.
    checkMatch: '**/*.check.ts',
  },
  cli: {
    runLocation: 'eu-west-1',
  },
})
