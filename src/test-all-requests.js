import { getAllRequestsWithDetails } from './services/requestService.js';

async function runTest(){
  console.log("Fetching all requests with details...");
  const allRequests = await getAllRequestsWithDetails();

  if (allRequests){
    console.log("Test passed: All requests fetched successfully");
    console.log(JSON.stringify(allRequests, null, 2));
  }
  else {
    console.error("Test failed: No requests fetched");
  }
}

runTest();