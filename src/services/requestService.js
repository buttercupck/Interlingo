import { IdCard, Languages } from 'lucide-react';
import{ supabase } from '../lib/supabase.js';

export async function createNewRequest(formData){
  try{
    const commitmentBlockData = {
      location_id: formData.location,
      modality: formData.modality,
      start_time: formData.startTime,
      end_time: formData.endTime,
      status: 'Initial'
    };
    const clientRequestData = {
      language_id: formData.language,
      program_id: formData.program,
      client_name: formData.clientName,
      case_number: formData.caseNumber,
      meeting_type: formData.meetingType,
      charges: formData.charges,
      requestor_email: 'you@example.com',
      specific_location_details: '',
    };
    const { data: commitmentBlock, error: cbError } = await supabase
      .from('commitment_blocks')
      .insert([commitmentBlockData])
      .select()
      .single();

    if (cbError) {
      throw cbError;
    }
    const newCommitmentBlockId = commitmentBlock.id;
    clientRequestData.commitment_block_id = newCommitmentBlockId;

    const { data: clientRequest, error: crError } = await supabase
      .from('client_requests')
      .insert([clientRequestData])
      .single();

    if (crError) {
      throw new Error(crError.message);
    }
    return { success: true, commitmentBlock, clientRequest };
  } catch (error) {
    console.error('Error creating new request:', error.message);
    return { success: false, error: error.message 
    }
  }
}
    
  export async function getAllRequestsWithDetails() {
      try{
        const { data, error } = await supabase
          .from('commitment_blocks')
          .select(
            `*, 
            locations (id, name, zoom_link, zoom_login, type, organizations (
            id,
            name,
            address,
            abbreviation
          )
          ),
          client_requests (
            *,
            languages (id, name),
            court_programs(id, name)
        )
      `)
        .order('start_time', { ascending: true });
        if (error) {
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    }

export async function getRequestById(id){
  try {
    const { data, error } = await supabase
    .from('commitment_blocks')
    .select('*, locations(id, name, address, zoom_link, zoom_login, type, organization (id, name, address, abbreviation)), client_requests(*, languages(id, name), court_programs(id, name))') .eqª('id', id).single();
    if (error) {
      throw error;
    }
    return data;
  } catch (error){
    console.error('Error fetching request by ID${id}:', error.message);
    return null;
  }
}