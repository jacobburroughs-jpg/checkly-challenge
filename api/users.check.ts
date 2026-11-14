import { createUserApiChecks } from './create-user-api-checks'
import data from './users.json'
import { raccoonEmail } from '../alerts.check'
import { CheckGroupV2, AlertEscalationBuilder } from 'checkly/constructs'

// Group 2: the API checks generated from users.json.
// Docs: https://www.checklyhq.com/docs/constructs/check-group-v2.md
export const apiGroup = new CheckGroupV2('user-api-group', {
  name: 'User API checks',
  alertChannels: [raccoonEmail],
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(1),
})

// users.json looks like { "users": [ ... ] }, so pass the inner list.
createUserApiChecks(data.users, apiGroup, 'user')
