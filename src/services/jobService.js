import { supabase } from '../lib/supabase.js';

/**
 * Job Service - Handles all job/client_request operations with correct database relationships
 * Based on the actual database structure where:
 * - client_requests.commitment_block_id -> commitment_blocks.id (one-to-one)
 * - commitment_blocks.interpreter_id -> interpreters.id (optional, can be null)
 * - commitment_blocks.location_id -> locations.id
 */

export const jobService = {
  /**
   * Get all jobs with complete related data for Dashboard
   */
  async getAllJobs() {
    try {
      const { data, error } = await supabase
        .from('client_requests')
        .select(`
          id,
          client_name,
          case_number,
          meeting_type,
          requestor_email,
          specific_location_details,
          key_contact_name,
          charges,
          created_at,
          updated_at,
          commitment_block_id,
          commitment_blocks:commitment_block_id (
            id,
            start_time,
            end_time,
            duration,
            status,
            modality,
            interpreter_id,
            location_id,
            interpreters:interpreter_id (
              id,
              first_name,
              last_name,
              email,
              phone
            ),
            locations:location_id (
              id,
              name,
              address,
              zoom_link,
              zoom_login,
              organizations (
                id,
                name,
                abbreviation
              )
            )
          ),
          languages (
            id,
            name
          ),
          court_programs (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get single job by ID with complete related data for JobPage
   */
  async getJobById(jobId) {
    try {
      const { data, error } = await supabase
        .from('client_requests')
        .select(`
          id,
          client_name,
          case_number,
          meeting_type,
          requestor_email,
          specific_location_details,
          key_contact_name,
          charges,
          created_at,
          updated_at,
          commitment_block_id,
          language_id,
          program_id,
          commitment_blocks:commitment_block_id (
            id,
            start_time,
            end_time,
            duration,
            status,
            modality,
            interpreter_id,
            location_id,
            interpreters:interpreter_id (
              id,
              first_name,
              last_name,
              email,
              phone
            ),
            locations:location_id (
              id,
              name,
              address,
              zoom_link,
              zoom_login,
              organizations (
                id,
                name,
                abbreviation,
                street,
                city,
                state,
                zip
              )
            )
          ),
          languages (
            id,
            name
          ),
          court_programs (
            id,
            name,
            description
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update client request data
   */
  async updateClientRequest(jobId, updates) {
    try {
      const { data, error } = await supabase
        .from('client_requests')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating client request:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update commitment block data
   */
  async updateCommitmentBlock(commitmentBlockId, updates) {
    try {
      const { data, error } = await supabase
        .from('commitment_blocks')
        .update(updates)
        .eq('id', commitmentBlockId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating commitment block:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Assign interpreter to a commitment block
   */
  async assignInterpreter(commitmentBlockId, interpreterId) {
    try {
      const { data, error } = await supabase
        .from('commitment_blocks')
        .update({ 
          interpreter_id: interpreterId,
          status: interpreterId ? 'assigned' : 'pending'
        })
        .eq('id', commitmentBlockId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error assigning interpreter:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Create new job with commitment block
   */
  async createJob(jobData) {
    try {
      // First create the commitment block
      const commitmentBlockData = {
        location_id: jobData.location_id,
        modality: jobData.modality,
        start_time: jobData.start_time,
        end_time: jobData.end_time,
        status: 'initial',
        interpreter_id: jobData.interpreter_id || null
      };

      const { data: commitmentBlock, error: cbError } = await supabase
        .from('commitment_blocks')
        .insert([commitmentBlockData])
        .select()
        .single();

      if (cbError) throw cbError;

      // Then create the client request linked to the commitment block
      const clientRequestData = {
        language_id: jobData.language_id,
        program_id: jobData.program_id,
        client_name: jobData.client_name,
        case_number: jobData.case_number,
        meeting_type: jobData.meeting_type,
        charges: jobData.charges,
        requestor_email: jobData.requestor_email,
        specific_location_details: jobData.specific_location_details,
        key_contact_name: jobData.key_contact_name,
        commitment_block_id: commitmentBlock.id
      };

      const { data: clientRequest, error: crError } = await supabase
        .from('client_requests')
        .insert([clientRequestData])
        .select()
        .single();

      if (crError) throw crError;

      return { 
        data: { commitmentBlock, clientRequest }, 
        error: null 
      };
    } catch (error) {
      console.error('Error creating job:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Delete job and associated commitment block
   */
  async deleteJob(jobId) {
    try {
      // Get the commitment block ID first
      const { data: job } = await supabase
        .from('client_requests')
        .select('commitment_block_id')
        .eq('id', jobId)
        .single();

      if (!job) throw new Error('Job not found');

      // Delete client request first (due to foreign key)
      const { error: crError } = await supabase
        .from('client_requests')
        .delete()
        .eq('id', jobId);

      if (crError) throw crError;

      // Then delete commitment block
      const { error: cbError } = await supabase
        .from('commitment_blocks')
        .delete()
        .eq('id', job.commitment_block_id);

      if (cbError) throw cbError;

      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting job:', error);
      return { data: null, error: error.message };
    }
  }
};

export default jobService;