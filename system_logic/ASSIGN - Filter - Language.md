---
document_type: Logic Rule
silo: intercom
topic: Client Management
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
This rule ensures that the system's list of potential interpreters for a job is filtered to include only those who are a direct language match for the `Client Request`.

## Trigger
This logic is executed automatically by the system when a new `Commitment Block` and `Client Request` are created, and an interpreter needs to be sourced.

## Conditions
1. The requested `language` from the `Client Request` must have a corresponding entry in the interpreter's profile (e.g., "Spanish," "Swahili," etc.).
2. The interpreter's language certification for that specific language must be marked as `registered` or `certified`.
3. If non
## Action
The system generates a preliminary list of all interpreters who meet the language match criteria.

## Dependencies
- This rule is a foundational filter for the `ASSIGN-Workflow-Sourcing.md` logic.
- It relies on data from the `Commitment Block` and `Client Request` entities.