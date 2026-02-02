---
title: A clear, descriptive title for the logic rule
tags: 
dependencies: []
status: active
created: 2025-07-31
last_updated: YYYY-MM-DD
category: REM
created_datetime: 2025-10-06T21:09:30-07:00
last_edited_datetime: 2025-10-22T15:28:48-07:00
---
## Purpose 
_High-level explanation of why this specific logic exists. What does it accomplish?:_ It serves as the **default** reminder logic for organizations that do not have their own specific rules. It reminds the interpreter that they are confirmed with an organization and to follow the standard, client-agnostic instructions.

## Trigger 
_What event triggers this specific workflow?:_ 
When an assignment is confirmed and scheduled for tomorrow, and no other organization-specific reminder rules apply.

## Conditions 
_These conditions must be met before the logic is executed. (Filter and Switch Nodes):_
- Condition 1 (Organization): This rule is a fallback and has no specific organization condition. 
- Condition 2 (Modality): Zoom

## Action 
*What happens when all conditions are met? What is the outcome?*
The system composes and sends a customized email to remind the interpreter that they confirmed their assignment tomorrow.

1. The system retrieves the [[INCOME/intercom/Interlingo/assets/TEMP-REM-Standard-Email]] for the `REM` category.
2. The system retrieves the specific instruction block for **Zoom** from [[Standard Zoom Confirmation (Interpreter)]].
3. The system inserts the standard Zoom instructions into the designated placeholder in the email template.
4. The system populates the rest of the template with the `Commitment Block` and `Client Request` details.
5. - The system checks if the interpreter's timezone preference is filled.
6. **If so, the system appends the "PDT" or "PST" timezone label to the time.**
7. The final, customized email is sent to the confirmed interpreter.