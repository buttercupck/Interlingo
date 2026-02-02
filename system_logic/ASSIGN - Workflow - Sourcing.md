---
document_type: Logic Rule
silo: intercom
topic: Interpreter Management
sub_topics: 
location_type: 
applies_to_process: 
status: Active
modified: 2025-08-06
date_created: 2025-08-06
created_datetime: 2025-10-06T21:09:30-07:00
last_edited_datetime: 2025-10-22T15:28:48-07:00
---
## Purpose
To document the end-to-end process of how the system sources and presents a final, prioritized list of interpreter candidates to the Internal Coordinator for an unassigned job.

## Trigger
A new `Commitment Block` and `Client Request` are created and require an interpreter assignment.

## Conditions
1. The system has identified that a new interpreter needs to be sourced.

## Action
The system performs the following sequence of actions to present a final list of candidates:
1.  The system first applies the [[ASSIGN - Filter - Language]] rule to generate a list of all language-compatible interpreters.
2.  Next, the system refines this list by applying the [[ASSIGN - Filter - Modality]] rule.
3.  Finally, the system applies the [[ASSIGN - Prioritization - Certification]] rule to rank the remaining candidates.
4.  The system presents this final, prioritized list to the Internal Coordinator in a user interface. The Coordinator then initiates the `REQ-` workflow by selecting an interpreter from this list.

## Dependencies
- This rule is dependent on the [[ASSIGN - Filter - Language]], [[ASSIGN - Filter - Modality]], and `ASSIGN-Prioritization-Certification.md]] logic rules.
- It is the entry point for the `REQ-` workflow, which handles outreach.