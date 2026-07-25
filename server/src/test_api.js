import authService from './services/auth.service.js';
import donationService from './services/donation.service.js';

async function main() {
  // 1. Log in to get the user ID
  const loginRes = await authService.login('donor1@greenleafcafe.com', 'password123');
  const userId = loginRes.user.id;
  console.log('Logged in user ID:', userId);

  // 2. Query donations with selfOnly=true
  // We mimic what the controller does:
  const queryParams = { selfOnly: 'true' };
  
  // Simulation of controllers/donation.controller.js:37
  if (queryParams.selfOnly === 'true') {
    queryParams.donorId = userId;
  }

  const result = await donationService.listDonations(queryParams);
  console.log('QueryResult total records:', result.metadata.total);
  console.log('QueryResult records:', JSON.stringify(result.records, null, 2));
}

main().catch(console.error);
