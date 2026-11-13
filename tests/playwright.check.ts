import { CheckGroupV2 } from 'checkly/constructs'

// Group 1: the customer's Playwright tests.
// Any spec file in this folder (or a subfolder) whose name matches a glob below
// becomes a check in this group on the next `npx checkly deploy`.
// The globs are relative to THIS file's folder (see node_modules/checkly/dist/constructs/check-group-v1.js, __addChecks).
// Docs: https://www.checklyhq.com/docs/constructs/check-group-v2.md
export const playwrightGroup = new CheckGroupV2('playwright-group', {
  name: 'Playwright checks',
  browserChecks: { testMatch: '**/*.browser.spec.ts' },     // your glob
  multiStepChecks: { testMatch: '**/*.multistep.spec.ts' }, // your glob
  // TODO: alert channel. Attach the email channel from alerts.check.ts.
})
