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
To filter the list of potential interpreters, ensuring that only those compatible with the `Commitment Block`'s modality are considered. This is especially critical for In-Person assignments.

## Trigger
This logic is executed by the system after the [[ASSIGN - Filter - Language]] rule has generated a preliminary list of candidates.

## Conditions
1. The `Modality` of the `Commitment Block` must match the interpreter's stated capabilities (e.g., In-Person, Zoom, Phone).
2. If the `Modality` is "In-Person," the interpreter's profile must pass the `DATA-InterpreterLocation-PDT-PST.md` rule, confirming they are local.

## Action
The system removes all interpreters who are incompatible with the modality from the candidate list. For In-Person jobs, this includes any interpreters who are not local.

## Dependencies
- This rule relies on a filtered list of interpreters being provided by the [[ASSIGN - Filter - Language]] logic.
- It relies on the `DATA-InterpreterLocation-PDT-PST.md` rule for its "In-Person" condition.
- The output of this rule is a refined list that is passed to the [[ASSIGN - Prioritization - Certification]] logic.