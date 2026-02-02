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
To rank a list of qualified interpreters for a specific job, ensuring the highest-credentialed candidates are prioritized first. This rule is applied after the initial filtering process has been completed.

## Trigger
This logic is executed by the system after the [[ASSIGN - Filter - Language]], [[ASSIGN - Filter - Modality]], and other filter rules have generated a list of potential interpreter candidates.

## Conditions
1. A preliminary list of interpreters who are a language and modality match has been generated.
2. The interpreter's profile contains a `Certification` status (`Certified`, `Registered`, or `Neither`).

## Action
The system applies a tiered ranking to the filtered list of interpreters. The order of priority is:
1.  **Certified (Cert):** Highest priority.
2.  **Registered (Reg):** Second priority.
3.  **Neither:** Lowest priority.

## Dependencies
- This rule is dependent on a filtered list of interpreters being provided by the [[ASSIGN - Filter - Language]] and [[ASSIGN - Filter - Modality]] logic rules.
- The output of this rule is a prioritized list of candidates that is passed to the [[ASSIGN - Workflow - Sourcing]] logic for final presentation to the Internal Coordinator.