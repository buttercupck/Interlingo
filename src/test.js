import { getOrgs} from './services/orgService.js';

async function runTest() {
  console.log("Fetching organizations...");
  const orgs = await getOrgs();

  if (orgs){
    console.log("Test passed: Organizations fetched successfully");
    console.log(orgs);
  } else {
    console.error("Test failed: No organizations fetched");
  }
}

runTest();