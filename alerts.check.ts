
import { EmailAlertChannel } from 'checkly/constructs'

export const raccoonEmail = new EmailAlertChannel('raccoon-email', {
    address: 'raccoon@checklyhq.com',
});