"use strict";
const fs = require('fs');
let content = fs.readFileSync('./di-container.ts', 'utf8');
if (!content.includes('GetBoostPricingQueryHandler')) {
    content = content.replace(/import \{ VerifyBoostPaymentCommand, VerifyBoostPaymentCommandHandler \} from '\.\.\/application\/use-cases\/boosted-events\/verify-boost-payment';/, `import { VerifyBoostPaymentCommand, VerifyBoostPaymentCommandHandler } from '../application/use-cases/boosted-events/verify-boost-payment';\nimport { GetBoostPricingQuery, GetBoostPricingQueryHandler } from '../application/use-cases/boosted-events/get-boost-pricing';`);
    content = content.replace(/mediator\.register\(VerifyBoostPaymentCommand\.name, new VerifyBoostPaymentCommandHandler\(boostedEventRepo, communicationGateway\)\);/, `mediator.register(VerifyBoostPaymentCommand.name, new VerifyBoostPaymentCommandHandler(boostedEventRepo, communicationGateway));\nmediator.register(GetBoostPricingQuery.name, new GetBoostPricingQueryHandler(configRepo));`);
    fs.writeFileSync('./di-container.ts', content);
}
