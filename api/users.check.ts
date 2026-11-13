import { CheckGroupV2 } from 'checkly/constructs'
import { createUserApiChecks } from './create-user-api-checks'
import data from './users.json'

// Group 2: the API checks generated from users.json.
// Docs: https://www.checklyhq.com/docs/constructs/check-group-v2.md
export const apiGroup = new CheckGroupV2('user-api-group', {
  name: 'User API checks',
  // TODO: alert channel. Attach the email channel from alerts.check.ts.
})

// users.json looks like { "users": [ ... ] }, so pass the inner list.
createUserApiChecks(data.users, apiGroup)
