---
created_datetime: 2025-10-28T15:31:49-07:00
last_edited_datetime: 2025-10-28T15:31:49-07:00
---
### **1. Layout & Structure**

1. **Two-column responsive layout** — Move from stacked blocks to a cleaner layout. Card-based grouping replace plain section borders with Material/Glass-style cards. Cards for Job Info, Organization, and Interpreter. Note, collapse right column (Draft Email) into a tab or accordion labeled “Email” on mobile.
    - **Left Column: Job Details (Primary Data)**
	    - **Purpose:** This column is for structured information and job metadata.
		1. **Job Overview Card**:
		    - **Header:** Job Title should be {{language}} — {{currentlyAssignedInterpreter}} {{modality}} (e.g., “Spanish – Aida Zoom”)
			    - Fallback when interpreter is missing → `{{language}} — Unassigned ({{modality}})`.
		    - **Subheader:** Status badge, dropdown option (Initial/ Pending / Confirmed / Missing Info)
		    - **Quick facts row:**
	        - Date & Time
	        - Duration - Only display if it's more than 2 hours (e.g "3 hours")
	        - Modality - dropdown option (Zoom / In-person / Phone)
		2. **Organization & Location Card**
			- Organization name (linked to organization profile)
			- Courtroom (if applicable)
			- Program (if applicable)
			- Address or Zoom room field
		3. **Interpreter Card**
			- Dropdown of available interpreters
			- Assigned interpreter name (linked to interpreter profile)
			- Language
			- Contact email
			- Status (Assigned / Pending / Unavailable)
			- Dropdown to assign or reassign interpreter
		4. **Job Notes / Attachments**
			- “Add Note” button for private notes
		    - Upload or view court order PDFs, .docs
	- **Right Column: Draft Email Panel**
		- **Purpose:** Always visible email workspace connected to job data.
		1. **Header:** “Draft Email” with dropdown for templates
		    - **Sticky action bar** — Rename REQ to Request, CONFRIM to Confirm, and REM to Reminder. Then keep buttons in a persistent bar at the top-right corner to trigger template creation.
		    - Load template → auto-populates subject and body fields
		2. **Smart Merge Fields**
		    - Dynamic tokens (e.g., `{{interpreter_name}}`, `{{zoom_link}}`, `{{organization_name}}`)
		    - Gray text placeholders for missing data  → e.g., “{{zoom_link}} (missing)”
		3. **Editable Fields**
		    - **Subject:** Editable input, auto-fills from template
		    - **Body:** Plain-text-first approach with an optional WYSIWYG toggle for bold or links. Reason: ensures consistent copy-paste into Apple Mail.
		4. **Action Buttons**
			- **Primary button:** “Copy to Clipboard” (always reliable).
			- **Secondary button:** “Open in Mail” → triggers the `mailto:` flow for convenience.
			 **Reason**: This hybrid approach gives the user one-click access to Apple Mail but still supports manual paste workflows
		5. Include **“Mark Sent” behavior**:
			- When clicked, it auto-updates job status badge (e.g., Request → Pending, Confirm → Confirmed, Reminder → Reminded).
			- Add timestamp and user info (e.g., “Confirmed email sent by {{admin_name}} on {{timestamp}}”)
		6. **Missing Information Alert**
		    - Yellow banner listing missing interpreter, Zoom link, etc.
		    - Inline prompts to “Assign Interpreter” or “Add Zoom Link”

### **2. Data Completeness & Automation**

2. **Highlight missing fields automatically** — e.g., a red ⚠️ banner listing missing Zoom link or interpreter.
3. **Auto-detect interpreter assignment status** — If none assigned, offer “Assign Interpreter” CTA with dropdown of available interpreters.
4. **Dynamic job status badge** — Replace static “INITIAL” text with a drop down color-coded badge:
    - `Initial, Pending`, `Confirmed`, `Reminded`, `Canceled`, `Needs Info`.
### **3. Communication Enhancements**

5. **Integrated email composer** — Replace plain text draft box with:
    - Editable subject and body.
    - Templating with merge fields (`{{interpreter_name}}`, `{{zoom_link}}`, etc.).
    - “Copy to Clipboard” option.
6. **Smart copy link** — Instead of raw text, use a styled “Copy Email” button with feedback (✓ Copied).
7. **Add "Mark Sent"** - For Request, Confirmation, and Reminder emails
### **4. Visual Design & Branding**

8. **Modern typography** — Reference [[Interlingo Design System CSS]]
9. **Consistent button palette** — Reference [[Interlingo Design System CSS]]