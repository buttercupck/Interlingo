---
created_datetime: 2025-10-06T21:09:30-07:00
last_edited_datetime: 2025-10-22T15:28:48-07:00
---
*/
 * Professional B2B interpretation scheduling design
 * Inspired by Calendly and modern scheduling tools
 */

/* Typography - Modern B2B scheduling tools */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');

/* CSS Variables - Design Tokens */
:root {
    /* Primary Color Palette - Professional Communication Focus */
    --primary-blue: #1B365C;      /* Deep professional blue - trust & reliability */
    --primary-light: #2D4A6B;     /* Lighter variant for hover states */
    --primary-lighter: #EBF1F7;   /* Very light blue for backgrounds */
    
    /* Secondary Colors - Language & Communication Theme */
    --secondary-teal: #0D7377;    /* Teal for accents - communication/translation */
    --secondary-green: #14A085;   /* Success green - confirmed appointments */
    --secondary-purple: #6366F1;  /* Modern purple for highlights */
    
    /* System Colors */
    --success: #10B981;     /* Success actions - booking confirmed */
    --warning: #F59E0B;     /* Warning states - pending review */
    --danger: #EF4444;      /* Error states - failed/cancelled */
    --info: #3B82F6;        /* Information - general alerts */
    
    /* Neutral Scale - Calendly Inspired */
    --gray-50: #F9FAFB;
    --gray-100: #F3F4F6;
    --gray-200: #E5E7EB;
    --gray-300: #D1D5DB;
    --gray-400: #9CA3AF;
    --gray-500: #6B7280;
    --gray-600: #4B5563;
    --gray-700: #374151;
    --gray-800: #1F2937;
    --gray-900: #111827;
    
    /* Typography Scales */
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-secondary: 'Poppins', sans-serif;
    
    /* Font Sizes - Modular Scale 1.25x */
    --text-xs: 0.75rem;      /* 12px */
    --text-sm: 0.875rem;     /* 14px */
    --text-base: 1rem;       /* 16px */
    --text-lg: 1.125rem;     /* 18px */
    --text-xl: 1.25rem;      /* 20px */
    --text-2xl: 1.5rem;      /* 24px */
    --text-3xl: 1.875rem;    /* 30px */
    --text-4xl: 2.25rem;     /* 36px */
    
    /* Spacing System - 8px grid */
    --space-1: 0.25rem;   /* 4px */
    --space-2: 0.5rem;    /* 8px */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-5: 1.25rem;   /* 20px */
    --space-6: 1.5rem;    /* 24px */
    --space-8: 2rem;      /* 32px */
    --space-10: 2.5rem;   /* 40px */
    --space-12: 3rem;     /* 48px */
    --space-16: 4rem;     /* 64px */
    
    /* Border Radius */
    --radius-sm: 0.25rem;   /* 4px */
    --radius-md: 0.375rem;  /* 6px */
    --radius-lg: 0.5rem;    /* 8px */
    --radius-xl: 0.75rem;   /* 12px */
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-primary);
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--gray-700);
    background-color: var(--gray-50);
}

/* Layout Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-6);
}

/* Typography Components */
.heading-1 {
    font-family: var(--font-secondary);
    font-size: var(--text-4xl);
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: var(--space-6);
}

.heading-2 {
    font-family: var(--font-secondary);
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--gray-800);
    margin-bottom: var(--space-4);
}

.heading-3 {
    font-family: var(--font-primary);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--gray-800);
    margin-bottom: var(--space-3);
}

.heading-4 {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--gray-700);
    margin-bottom: var(--space-2);
}

.body-large {
    font-size: var(--text-lg);
    line-height: 1.7;
    color: var(--gray-600);
}

.body-base {
    font-size: var(--text-base);
    line-height: 1.6;
    color: var(--gray-600);
}

.body-small {
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--gray-500);
}

.caption {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--gray-400);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Button Components */
.button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-sm);
    font-weight: 500;
    border-radius: var(--radius-md);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    font-family: var(--font-primary);
}

.button-primary {
    background-color: var(--primary-blue);
    color: white;
}

.button-primary:hover {
    background-color: var(--primary-light);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.button-secondary {
    background-color: var(--secondary-teal);
    color: white;
}

.button-secondary:hover {
    background-color: #0A5D61;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.button-success {
    background-color: var(--success);
    color: white;
}

.button-success:hover {
    background-color: #059669;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.button-warning {
    background-color: var(--warning);
    color: white;
}

.button-warning:hover {
    background-color: #D97706;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.button-danger {
    background-color: var(--danger);
    color: white;
}

.button-danger:hover {
    background-color: #DC2626;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.button-outline {
    background-color: transparent;
    color: var(--primary-blue);
    border: 1px solid var(--primary-blue);
}

.button-outline:hover {
    background-color: var(--primary-lighter);
}

.button-ghost {
    background-color: transparent;
    color: var(--gray-600);
}

.button-ghost:hover {
    background-color: var(--gray-100);
}

/* Button Groups */
.button-group {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
    margin: var(--space-4) 0;
}

/* Input Components */
.input-group {
    margin-bottom: var(--space-4);
}

.input-label {
    display: block;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--gray-700);
    margin-bottom: var(--space-2);
}

.input {
    width: 100%;
    padding: var(--space-3);
    font-size: var(--text-base);
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-md);
    background-color: white;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(27, 54, 92, 0.1);
}

.select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}

/* Card Components */
.card {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
    margin-bottom: var(--space-4);
}

.card-header {
    border-bottom: 1px solid var(--gray-200);
    padding-bottom: var(--space-4);
    margin-bottom: var(--space-4);
}

.card-title {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--gray-800);
}

/* Status Badges */
.badge {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-xs);
    font-weight: 500;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.badge-success {
    background-color: #D1FAE5;
    color: #065F46;
}

.badge-warning {
    background-color: #FEF3C7;
    color: #92400E;
}

.badge-danger {
    background-color: #FEE2E2;
    color: #991B1B;
}

.badge-info {
    background-color: #DBEAFE;
    color: #1E40AF;
}

/* Layout Grid System */
.grid {
    display: grid;
    gap: var(--space-6);
}

.grid-2 {
    grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
    grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
    grid-template-columns: repeat(4, 1fr);
}

/* Color Display Components */
.color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin: var(--space-6) 0;
}

.color-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
}

.color-swatch {
    width: 100%;
    height: 80px;
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
}

.color-name {
    font-weight: 600;
    color: var(--gray-800);
    font-size: var(--text-sm);
}

.color-value {
    font-family: 'Monaco', monospace;
    font-size: var(--text-xs);
    color: var(--gray-500);
    margin-top: var(--space-1);
}

/* Component Showcase Styles */
.examples-section {
    margin: var(--space-8) 0;
}

.component-showcase {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    margin: var(--space-4) 0;
    border: 1px solid var(--gray-200);
}

.showcase-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--gray-800);
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--gray-200);
}

/* Email Interface Components */
.email-preview {
    border: 1px solid var(--gray-300);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: white;
}

.email-header {
    background: var(--gray-100);
    padding: var(--space-4);
    border-bottom: 1px solid var(--gray-300);
}

.email-field {
    margin-bottom: var(--space-2);
    font-size: var(--text-sm);
}

.email-field strong {
    color: var(--gray-700);
    display: inline-block;
    width: 80px;
}

.email-body {
    padding: var(--space-4);
    font-family: 'Monaco', monospace;
    font-size: var(--text-sm);
    line-height: 1.6;
    white-space: pre-wrap;
}

/* Form Styles */
.form-section {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
}

/* Table Styles */
.table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
}

.table th,
.table td {
    padding: var(--space-4);
    text-align: left;
    border-bottom: 1px solid var(--gray-200);
}

.table th {
    background-color: var(--gray-100);
    font-weight: 600;
    color: var(--gray-800);
}

.table tbody tr:hover {
    background-color: var(--gray-50);
}

/* Alert Components */
.alert {
    padding: var(--space-4);
    border-radius: var(--radius-md);
    margin: var(--space-4) 0;
    font-size: var(--text-sm);
}

.alert-success {
    background-color: #D1FAE5;
    color: #065F46;
    border: 1px solid #A7F3D0;
}

.alert-warning {
    background-color: #FEF3C7;
    color: #92400E;
    border: 1px solid #FDE68A;
}

.alert-danger {
    background-color: #FEE2E2;
    color: #991B1B;
    border: 1px solid #FECACA;
}

.alert-info {
    background-color: #DBEAFE;
    color: #1E40AF;
    border: 1px solid #BFDBFE;
}

/* Loading States */
.loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--gray-200);
    border-radius: 50%;
    border-top-color: var(--primary-blue);
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: var(--space-4);
    }
    
    .grid-2, 
    .grid-3, 
    .grid-4 {
        grid-template-columns: 1fr;
    }
    
    .button-group {
        flex-direction: column;
        align-items: stretch;
    }
    
    .button {
        justify-content: center;
    }
    
    .color-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .heading-1 {
        font-size: var(--text-3xl);
    }
    
    .heading-2 {
        font-size: var(--text-2xl);
    }
    
    .card,
    .component-showcase,
    .form-section {
        padding: var(--space-4);
    }
}

/* Utility Classes */
.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

.flex {
    display: flex;
}

.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.hidden {
    display: none;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Spacing Utilities */
.mt-1 { margin-top: var(--space-1); }
.mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mt-6 { margin-top: var(--space-6); }
.mt-8 { margin-top: var(--space-8); }

.mb-1 { margin-bottom: var(--space-1); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-3 { margin-bottom: var(--space-3); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-6 { margin-bottom: var(--space-6); }
.mb-8 { margin-bottom: var(--space-8); }