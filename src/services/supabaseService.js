import { supabase } from '../lib/supabase';

// Job/Client Request Operations
export const jobService = {
  // Get all jobs with related data
  async getAllJobs() {
    const { data, error } = await supabase
      .from('client_requests')
      .select(`
        *,
        commitment_blocks (
          *,
          interpreters (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          locations (
            *,
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
    return data;
  },

  // Get single job by ID
  async getJobById(jobId) {
    const { data, error } = await supabase
      .from('client_requests')
      .select(`
        *,
        commitment_blocks (
          *,
          interpreters (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          locations (
            *,
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
      .eq('id', jobId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update job details
  async updateJob(jobId, updates) {
    const { data, error } = await supabase
      .from('client_requests')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create new job
  async createJob(jobData) {
    const { data, error } = await supabase
      .from('client_requests')
      .insert([jobData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete job
  async deleteJob(jobId) {
    const { error } = await supabase
      .from('client_requests')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
    return true;
  }
};

// Commitment Block Operations
export const commitmentBlockService = {
  // Assign interpreter to commitment block
  async assignInterpreter(commitmentBlockId, interpreterId) {
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
    return data;
  },

  // Update commitment block details
  async updateCommitmentBlock(commitmentBlockId, updates) {
    const { data, error } = await supabase
      .from('commitment_blocks')
      .update(updates)
      .eq('id', commitmentBlockId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create new commitment block
  async createCommitmentBlock(blockData) {
    const { data, error } = await supabase
      .from('commitment_blocks')
      .insert([blockData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Interpreter Operations
export const interpreterService = {
  // Get all interpreters
  async getAllInterpreters() {
    const { data, error } = await supabase
      .from('interpreters')
      .select(`
        *,
        interpreter_languages (
          language_id,
          proficiency_rank,
          certification,
          languages (
            id,
            name
          )
        )
      `)
      .order('first_name');

    if (error) throw error;
    return data;
  },

  // Get interpreters by language
  async getInterpretersByLanguage(languageId) {
    const { data, error } = await supabase
      .from('interpreters')
      .select(`
        *,
        interpreter_languages!inner (
          language_id,
          proficiency_rank,
          certification
        )
      `)
      .eq('interpreter_languages.language_id', languageId)
      .order('first_name');

    if (error) throw error;
    return data;
  },

  // Get interpreter by ID
  async getInterpreterById(interpreterId) {
    const { data, error } = await supabase
      .from('interpreters')
      .select(`
        *,
        interpreter_languages (
          language_id,
          proficiency_rank,
          certification,
          languages (
            id,
            name
          )
        )
      `)
      .eq('id', interpreterId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new interpreter
  async createInterpreter(interpreterData) {
    const { data, error } = await supabase
      .from('interpreters')
      .insert([interpreterData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update interpreter
  async updateInterpreter(interpreterId, updates) {
    const { data, error } = await supabase
      .from('interpreters')
      .update(updates)
      .eq('id', interpreterId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Language Operations
export const languageService = {
  // Get all languages
  async getAllLanguages() {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Create new language
  async createLanguage(languageData) {
    const { data, error } = await supabase
      .from('languages')
      .insert([languageData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Location Operations
export const locationService = {
  // Get all locations
  async getAllLocations() {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        organizations (
          id,
          name,
          abbreviation
        )
      `)
      .order('name');

    if (error) throw error;
    return data;
  },

  // Get location by ID
  async getLocationById(locationId) {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        organizations (
          id,
          name,
          abbreviation
        )
      `)
      .eq('id', locationId)
      .single();

    if (error) throw error;
    return data;
  }
};

// Court Program Operations
export const programService = {
  // Get all court programs
  async getAllPrograms() {
    const { data, error } = await supabase
      .from('court_programs')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Create new program
  async createProgram(programData) {
    const { data, error } = await supabase
      .from('court_programs')
      .insert([programData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Organization Operations
export const organizationService = {
  // Get all organizations
  async getAllOrganizations() {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Get organization by ID
  async getOrganizationById(orgId) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) throw error;
    return data;
  }
};

// Assignment Logic Service
export const assignmentService = {
  // Get eligible interpreters for a job based on language and modality
  async getEligibleInterpreters(languageId, modality = null) {
    let query = supabase
      .from('interpreters')
      .select(`
        *,
        interpreter_languages!inner (
          language_id,
          proficiency_rank,
          certification,
          languages (
            id,
            name
          )
        )
      `)
      .eq('interpreter_languages.language_id', languageId);

    // Filter by modality preferences if specified
    if (modality && modality !== 'any') {
      query = query.contains('modality_preferences', [modality]);
    }

    // Order by certification (certified first) and then by proficiency rank
    query = query.order('interpreter_languages.certification', { ascending: false })
                 .order('interpreter_languages.proficiency_rank', { ascending: true })
                 .order('first_name');

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Check interpreter availability for a specific time slot
  async checkInterpreterAvailability(interpreterId, startTime, endTime) {
    const { data, error } = await supabase
      .from('commitment_blocks')
      .select('id, start_time, end_time')
      .eq('interpreter_id', interpreterId)
      .or(`and(start_time.lte.${startTime},end_time.gte.${startTime}),and(start_time.lte.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`);

    if (error) throw error;
    return data.length === 0; // Return true if no conflicts found
  }
};

// Dashboard Analytics Service
export const analyticsService = {
  // Get job statistics
  async getJobStats() {
    const { data: allJobs, error: allError } = await supabase
      .from('client_requests')
      .select('id, created_at, commitment_blocks(status)');

    if (allError) throw allError;

    const stats = {
      total: allJobs.length,
      pending: 0,
      assigned: 0,
      confirmed: 0,
      cancelled: 0,
      thisWeek: 0,
      thisMonth: 0
    };

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    allJobs.forEach(job => {
      const createdDate = new Date(job.created_at);
      const status = job.commitment_blocks?.[0]?.status || 'pending';

      stats[status.toLowerCase()]++;

      if (createdDate >= weekAgo) stats.thisWeek++;
      if (createdDate >= monthAgo) stats.thisMonth++;
    });

    return stats;
  },

  // Get interpreter utilization
  async getInterpreterUtilization() {
    const { data, error } = await supabase
      .from('interpreters')
      .select(`
        id,
        first_name,
        last_name,
        commitment_blocks(id, status, start_time)
      `);

    if (error) throw error;

    return data.map(interpreter => ({
      ...interpreter,
      totalAssignments: interpreter.commitment_blocks.length,
      activeAssignments: interpreter.commitment_blocks.filter(cb => 
        cb.status === 'confirmed' || cb.status === 'assigned'
      ).length
    }));
  }
};

// Email Template Service
export const emailTemplateService = {
  // Generate email content based on job data and template type
  generateEmailContent(job, templateType) {
    const commitmentBlock = job.commitment_blocks?.[0];
    const interpreter = commitmentBlock?.interpreters;
    const location = commitmentBlock?.locations;

    const templateData = {
      interpreterName: interpreter ? `${interpreter.first_name} ${interpreter.last_name}` : '[INTERPRETER NAME]',
      organization: location?.organizations?.name || location?.name || '[ORGANIZATION]',
      date: commitmentBlock?.start_time ? new Date(commitmentBlock.start_time).toLocaleDateString() : '[DATE]',
      time: commitmentBlock?.start_time ? new Date(commitmentBlock.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '[TIME]',
      modality: commitmentBlock?.modality || '[MODALITY]',
      language: job.languages?.name || '[LANGUAGE]',
      duration: commitmentBlock?.duration || '[DURATION]',
      location: location?.name || '[LOCATION]',
      clientName: job.client_name || '[CLIENT NAME]',
      caseNumber: job.case_number || '[CASE NUMBER]',
      meetingType: job.meeting_type || '[MEETING TYPE]',
      charges: job.charges || '',
      zoomInformation: location?.zoom_link ? `Zoom Link: ${location.zoom_link}` : '',
      recipientEmail: interpreter?.email || ''
    };

    return templateData;
  },

  // Validate required fields for email template
  validateEmailData(job, templateType) {
    const missing = [];
    const commitmentBlock = job.commitment_blocks?.[0];
    const interpreter = commitmentBlock?.interpreters;
    const location = commitmentBlock?.locations;

    if (!interpreter) missing.push('Interpreter not assigned');
    if (!commitmentBlock?.start_time) missing.push('Date/time not set');
    if (!commitmentBlock?.modality) missing.push('Modality not specified');
    if (!job.languages?.name) missing.push('Language not specified');
    if (!location) missing.push('Location not specified');
    if (!job.client_name) missing.push('Client name missing');

    if (templateType === 'REQ' && !commitmentBlock?.duration) {
      missing.push('Duration not specified');
    }

    return missing;
  }
};