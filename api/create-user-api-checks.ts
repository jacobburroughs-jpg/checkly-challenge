import { ApiCheck, AssertionBuilder, CheckGroupV2 } from 'checkly/constructs'

// The reusable function: one ApiCheck per user entry.
// Docs: https://www.checklyhq.com/docs/constructs/api-check.md

export type User = { id: number; name: string; profile_url: string }

export function createUserApiChecks(users: User[], group: CheckGroupV2) {
  for (const user of users) {
    new ApiCheck(
      `user-${user.id}`,
      {
        name: `Get user ${user.name}`,
        group,
        request: {
          method: 'GET',
          url: user.profile_url,
          headers: [{ key: 'Authorization', value: 'Bearer {{API_TOKEN}}' }],
          assertions: [
            AssertionBuilder.statusCode().equals(200),
            AssertionBuilder.jsonBody('$.id').equals(`${user.id}`),
            AssertionBuilder.jsonBody('$.name').equals(user.name),
          ],
        },
      },
    )
  }
}