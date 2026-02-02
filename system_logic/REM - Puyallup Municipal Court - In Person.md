---
title: A clear, descriptive title for the logic rule
tags: 
dependencies: 
status: active
created: 2025-08-05
last_updated: YYYY-MM-DD
category: REQ
created_datetime: 2025-10-06T21:09:30-07:00
last_edited_datetime: 2025-10-22T15:28:48-07:00
---
## Purpose
*High-level explanation of why this specific logic exists. What does it accomplish?:*
This is to remind the interpreter to not fill out an paperwork when arriving to the court and where to sit when they arrive.
## Trigger
*What event triggers this specific workflow?:*
Notion webhook where the "Court" property from Notion contains "Puyallup" & the Notion title field contains "In Person".
## Conditions
*These conditions must be met before the logic is executed. (Filter and Switch Nodes):*
Condition 1 (Organization): "Puyallup Municipal Court"
Condition 2 (Modality): In-Person
Condition 3 (Dependencies): Court Zoom approval

## Action
*What happens when all conditions are met? What is the outcome?*
The system composes and sends a customized email to the remind the interpreter that they confirmed their assignment tomorrow.
1. The system retrieves the [[INCOME/intercom/Interlingo/assets/TEMP-REM-Standard-Email]] for the `REM` category.
2. The system identifies the **`Modality`** of the `Commitment Block` as **In Person**.
3. The system retrieves the specific instruction block for **In Person** from [[Client Specifics - Puyallup Municipal Court|Client Specifics - Puyallup Municipal Court]]]
4. The system inserts the organization-specific instructions into the designated placeholder in the email template.
5. The system populates the rest of the template with the `Commitment Block` and `Client Request` details.
6. The system checks if the interpreter's timezone preference is filled.
	1. **If so, the system appends the "PDT" or "PST" timezone label to the time.**
7. The final, customized email is sent for approval to before sending to the confirmed interpreter.