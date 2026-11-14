import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

// Project-wide settings and defaults.
// Docs: https://www.checklyhq.com/docs/constructs/project.md
export default defineConfig({
  projectName: 'Checkly Challenge',
  logicalId: 'checkly-challenge',
  repoUrl: 'https://github.com/jacobburroughs-jpg/checkly-challenge',
  checks: {
    frequency: Frequency.EVERY_10M,
    locations: ['us-east-1', 'eu-west-1'],
    checkMatch: '**/*.check.ts',
  },
  cli: {
    runLocation: 'eu-west-1',
  },
})
