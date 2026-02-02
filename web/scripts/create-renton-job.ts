import { createClient } from '../lib/supabase/client';
import { saveICSToFile } from '../lib/utils/ics-generator';

const supabase = createClient();

// Job data from Renton RTF grid - Case 5A0232087
const jobData = {
  location_id: 'a69ceb50-929a-4339-a7cd-1925d2c5082c', // Renton location
  modality: 'Zoom',
  start_time: '2025-12-08T08:30:00-08:00', // 8:30 AM PST
  end_time: '2025-12-08T10:30:00-08:00', // 2 hours later
  duration: 120, // 2 hours in minutes
  status: 'Initial',
  client_requests: [
    {
      language_id: '03faa119-9f1b-4bc9-9085-2c06ea546442', // Spanish
      client_name: 'SIMANCAS ACOSTA, XAVIER A',
      case_number: '5A0232087',
      meeting_type: 'ARR', // Arraignment
    },
  ],
};

console.log('Creating job for case 5A0232087...');

// Step 1: Create the commitment block (job)
const { data: job, error: jobError } = await supabase
  .from('commitment_blocks')
  .insert({
    location_id: jobData.location_id,
    modality: jobData.modality,
    start_time: jobData.start_time,
    end_time: jobData.end_time,
    // duration is generated from start_time and end_time, don't insert it
    status: jobData.status,
    interpreter_id: null,
  })
  .select()
  .single();

if (jobError || !job) {
  console.error('Failed to create job:', jobError);
  process.exit(1);
}

console.log('Job created:', job.id);

// Step 2: Create client request
const { data: clientRequest, error: clientError } = await supabase
  .from('client_requests')
  .insert({
    commitment_block_id: job.id,
    language_id: jobData.client_requests[0].language_id,
    client_name: jobData.client_requests[0].client_name,
    case_number: jobData.client_requests[0].case_number,
    meeting_type: jobData.client_requests[0].meeting_type,
  })
  .select()
  .single();

if (clientError) {
  console.error('Failed to create client request:', clientError);
  // Rollback
  await supabase.from('commitment_blocks').delete().eq('id', job.id);
  process.exit(1);
}

console.log('Client request created:', clientRequest.id);

// Step 3: Fetch the full job details for .ics generation
const { data: fullJob, error: fetchError } = await supabase
  .from('commitment_blocks')
  .select(`
    *,
    client_requests(*,
      language:languages(*),
      program:court_programs(*)
    ),
    interpreter:interpreters(*),
    location:locations(*,
      organization:organizations(*)
    )
  `)
  .eq('id', job.id)
  .single();

if (fetchError || !fullJob) {
  console.error('Failed to fetch full job details:', fetchError);
  process.exit(1);
}

console.log('Full job details fetched');

// Step 4: Generate .ics calendar file
const icsFilePath = `/Users/intercomlanguageservices/Desktop/Renton-${jobData.client_requests[0].case_number}.ics`;
await saveICSToFile(fullJob, icsFilePath);

console.log(`✅ Job created successfully!`);
console.log(`📅 Calendar file saved to: ${icsFilePath}`);
console.log(`🔗 View job at: http://localhost:3001/dashboard/jobs/${job.id}`);
