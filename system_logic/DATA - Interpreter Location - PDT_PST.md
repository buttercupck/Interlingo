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
To determine if an interpreter is considered **local** and therefore eligible for In-Person assignments. This is a foundational rule that other logic notes will call upon.

## Trigger
This logic is executed by a calling workflow (e.g., [[ASSIGN - Filter - Modality]]) that needs to determine an interpreter's location status.

## Conditions
1. The system checks the `timezone_preference` field in the interpreter's profile.
2. The value of this field must be `PDT` or `PST`.

## Action
The rule returns a boolean value:
- **`TRUE`** if the interpreter's timezone preference is `PDT/PST`. The interpreter is considered local.
- **`FALSE`** if the interpreter's timezone preference is not `PDT/PST`. The interpreter is considered non-local.

## Dependencies
- This is a foundational rule and has no dependencies on other logic notes.
- It is a key dependency for the [[ASSIGN - Filter - Modality]] rule.