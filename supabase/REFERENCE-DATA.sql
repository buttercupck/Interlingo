-- Interlingo Reference Data Population
-- Run this SQL directly in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste this → Run

-- ============================================
-- 1. ORGANIZATIONS (Common Washington Courts)
-- ============================================

INSERT INTO organizations (name, abbreviation, city, state)
VALUES
  ('Fife Municipal Court', 'FIFE', 'Fife', 'WA'),
  ('Auburn Municipal Court', 'AUBURN', 'Auburn', 'WA'),
  ('Federal Way Municipal Court', 'FED WAY', 'Federal Way', 'WA'),
  ('Tacoma Municipal Court', 'TACOMA', 'Tacoma', 'WA')
ON CONFLICT (abbreviation) DO NOTHING;

-- ============================================
-- 2. LOCATIONS (Create default locations for each org)
-- ============================================

-- FIFE
INSERT INTO locations (organization_id, name, address, city, state)
SELECT
  id,
  'Fife Municipal Court',
  'Fife, WA',
  'Fife',
  'WA'
FROM organizations
WHERE abbreviation = 'FIFE'
  AND NOT EXISTS (
    SELECT 1 FROM locations
    WHERE organization_id = organizations.id
  );

-- AUBURN
INSERT INTO locations (organization_id, name, address, city, state)
SELECT
  id,
  'Auburn Municipal Court',
  'Auburn, WA',
  'Auburn',
  'WA'
FROM organizations
WHERE abbreviation = 'AUBURN'
  AND NOT EXISTS (
    SELECT 1 FROM locations
    WHERE organization_id = organizations.id
  );

-- FEDERAL WAY
INSERT INTO locations (organization_id, name, address, city, state)
SELECT
  id,
  'Federal Way Municipal Court',
  'Federal Way, WA',
  'Federal Way',
  'WA'
FROM organizations
WHERE abbreviation = 'FED WAY'
  AND NOT EXISTS (
    SELECT 1 FROM locations
    WHERE organization_id = organizations.id
  );

-- TACOMA
INSERT INTO locations (organization_id, name, address, city, state)
SELECT
  id,
  'Tacoma Municipal Court',
  'Tacoma, WA',
  'Tacoma',
  'WA'
FROM organizations
WHERE abbreviation = 'TACOMA'
  AND NOT EXISTS (
    SELECT 1 FROM locations
    WHERE organization_id = organizations.id
  );

-- ============================================
-- 3. COURT PROGRAMS (Meeting Types)
-- ============================================

INSERT INTO court_programs (name, description)
VALUES
  ('ARR', 'Arraignment'),
  ('PEI', 'Pre-Examination Interview'),
  ('PRETRIAL', 'Pretrial Hearing'),
  ('TRIAL', 'Trial'),
  ('SENTENCING', 'Sentencing Hearing'),
  ('REVIEW', 'Review Hearing'),
  ('STATUS', 'Status Conference'),
  ('MOTION', 'Motion Hearing')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. VERIFY RESULTS
-- ============================================

-- Check organizations
SELECT 'Organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
-- Check locations
SELECT 'Locations', COUNT(*) FROM locations
UNION ALL
-- Check court programs
SELECT 'Court Programs', COUNT(*) FROM court_programs
UNION ALL
-- Check languages (should already exist)
SELECT 'Languages', COUNT(*) FROM languages;

-- ============================================
-- 5. VIEW CREATED DATA
-- ============================================

-- Organizations with their locations
SELECT
  o.abbreviation,
  o.name as org_name,
  l.name as location_name,
  l.city || ', ' || l.state as address
FROM organizations o
LEFT JOIN locations l ON l.organization_id = o.id
ORDER BY o.abbreviation;

-- All court programs
SELECT * FROM court_programs ORDER BY name;
