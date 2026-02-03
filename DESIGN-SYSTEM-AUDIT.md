# Interlingo Design System Audit & Redesign Plan

**Date:** 2026-02-02
**Production URL:** https://interlingo.augeo.one
**Reference Design:** Organizations Page (`app/(dashboard)/dashboard/organizations/page.tsx`)

---

## Executive Summary

This audit identifies significant visual inconsistencies across the Interlingo dashboard pages. While the **Organizations page** demonstrates a modern, cohesive design using shadcn/ui components, the **Jobs Board**, **Job Detail**, and **Interpreters** pages utilize a completely different design system with custom CSS variables, legacy utility classes, and inconsistent patterns.

**Primary Issue:** Multiple design systems coexist, creating a fragmented user experience.

---

## 🎨 Design System Extraction (Organizations Page)

### **Visual Language**

The Organizations page represents the **target design language** for the entire application:

#### **1. Layout Architecture**
- **Container:** `container mx-auto p-6 space-y-6`
- **Vertical spacing:** Consistent `space-y-6` for section separation
- **Grid system:** `grid gap-4 md:grid-cols-2 lg:grid-cols-3` (responsive 3-column grid)
- **Padding standards:** `p-6` for page padding, `px-6 py-4` for card content

#### **2. Typography Hierarchy**
```tsx
// Page Title (H1)
className="text-3xl font-bold tracking-tight"

// Subtitle/Description
className="text-muted-foreground mt-1"

// Card Title (H3)
className="font-semibold text-lg mt-2"

// Body Text
className="text-sm"

// Muted Text
className="text-muted-foreground"

// Labels (uppercase)
className="text-xs font-mono"  // For badges
```

#### **3. Color Palette (shadcn/ui Semantic Tokens)**
```css
--background: 0 0% 100%
--foreground: 0 0% 8%
--card: 0 0% 100%
--primary: 0 0% 10%
--secondary: 0 0% 96%
--muted: 0 0% 96%
--muted-foreground: 0 0% 34%
--accent: 0 0% 96%
--destructive: 0 84.2% 60.2%
--border: 0 0% 0% / 10%
--radius: 0.5rem
```

#### **4. Component Library (shadcn/ui)**

**Card Component:**
```tsx
<Card className="flex flex-col">
  <CardHeader>{/* Title & badges */}</CardHeader>
  <CardContent className="flex-1 space-y-2 text-sm">
    {/* Main content */}
  </CardContent>
  <CardFooter className="gap-2">
    {/* Action buttons */}
  </CardFooter>
</Card>
```

**Button Variants:**
- `variant="default"` - Primary action (dark background)
- `variant="outline"` - Secondary action (border only)
- `size="sm"` - Compact buttons for cards

**Badge Component:**
```tsx
<Badge variant="secondary" className="text-xs font-mono">
  {abbreviation}
</Badge>
```

**Input with Icon:**
```tsx
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input placeholder="Search..." className="pl-9" />
</div>
```

**Select Dropdown:**
```tsx
<Select value={filterType} onValueChange={setFilterType}>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Filter by type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Types</SelectItem>
  </SelectContent>
</Select>
```

#### **5. Loading States**
```tsx
// Skeleton Cards
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {Array.from({ length: 6 }).map((_, i) => (
    <Card key={i}>
      <CardHeader>
        <div className="h-6 w-20 bg-muted animate-pulse rounded" />
        <div className="h-5 w-3/4 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  ))}
</div>
```

#### **6. Empty States**
```tsx
<Card>
  <CardContent className="py-12">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <Building2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold">No Organizations Found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your search or filter
        </p>
      </div>
      <Button onClick={handleAddNew}>Add Organization</Button>
    </div>
  </CardContent>
</Card>
```

#### **7. Error States**
```tsx
<Card className="border-red-200 bg-red-50">
  <CardContent className="pt-6">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-red-100 p-3">
        <Building2 className="h-6 w-6 text-red-600" />
      </div>
      <div>
        <h3 className="font-semibold text-red-900">Error Loading Organizations</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
      </div>
      <Button onClick={fetchOrganizations} variant="outline" size="sm">
        Retry
      </Button>
    </div>
  </CardContent>
</Card>
```

---

## 🚨 Visual Inconsistencies Analysis

### **Jobs Board Page Issues**

#### **❌ Design System Conflicts**

1. **Typography Classes:**
   - Uses: `heading-1`, `heading-2`, `heading-3`, `body-base`, `body-small`, `caption`
   - Should use: Tailwind utilities (`text-3xl font-bold tracking-tight`, `text-muted-foreground`)

2. **Component Styles:**
   - Uses: Custom `.card` class
   - Should use: shadcn/ui `<Card>` component

3. **Button Styles:**
   - Uses: `.button`, `.bg-secondary-teal`, hardcoded hover colors
   - Should use: shadcn/ui `<Button variant="default">`

4. **Color Variables:**
   - Uses: `--secondary-teal`, `--gray-600`, inline color values
   - Should use: `text-muted-foreground`, `bg-secondary`, semantic tokens

5. **Badge Implementation:**
   - Uses: `.badge-info`, `.badge-warning`, `.badge-success`, `.badge-danger`
   - Should use: shadcn/ui `<Badge>` with proper variants

#### **❌ Layout Inconsistencies**

1. **Container:** Uses `space-y-6` (good) but missing `container mx-auto` wrapper
2. **Header:** Different structure than Organizations page
3. **Table Design:** Raw HTML table with custom classes instead of cards

#### **❌ Interaction Patterns**

1. **No loading skeleton** - uses spinner instead
2. **Empty state** uses emoji (📋) instead of Lucide icon
3. **Missing search/filter UI** - Organizations page has robust filtering

---

### **Interpreters Page Issues**

#### **❌ Design System Conflicts**

1. **Typography Classes:**
   - Uses: `heading-1`, `heading-4`, `body-base`, `body-small`, `caption`
   - Inline styles: `style={{ color: 'var(--gray-600)' }}`
   - Should use: Tailwind semantic classes

2. **Form Elements:**
   - Uses: `.input`, `.select` custom classes
   - Should use: shadcn/ui `<Input>`, `<Select>` components

3. **Loading State:**
   - Uses: Custom `.loading` class with inline styles
   - Should use: shadcn/ui skeleton or spinner pattern

4. **InterpreterCard Component:**
   - Uses: Custom `.card` class with CSS variables
   - Mixed badge implementations (`.badge-success`, `.badge-info`)
   - Should use: shadcn/ui Card component structure

5. **FilterBar Component:**
   - Uses: Custom `.select` with inline `minHeight: '120px'`
   - Uses: `.button-ghost` custom class
   - Should use: shadcn/ui components

#### **❌ Layout Inconsistencies**

1. **Container:** Uses `.container` class instead of `container mx-auto`
2. **Grid:** Uses inline styles for min-height instead of Tailwind utilities
3. **Spacing:** `py-8` for page padding vs `p-6` in Organizations

---

### **Job Detail Page Issues**

#### **❌ Design System Conflicts**

1. **Typography:**
   - Uses: `.heading-2` custom class
   - Should use: `text-3xl font-bold tracking-tight`

2. **Colors:**
   - Hardcoded: `bg-[#1B365C]`, `bg-[#2D4A6B]`, `.text-secondary`
   - Should use: `bg-primary`, `text-primary`, semantic tokens

3. **Components:**
   - Uses: Raw `<details>` HTML with custom styling
   - Missing Card components for sections
   - Inconsistent shadow and border patterns

4. **Layout:**
   - Uses: `max-w-7xl mx-auto` (good) but missing container
   - Grid: `grid-cols-2` hardcoded without responsive breakpoints

#### **❌ Interaction Issues**

1. **Loading state:** Custom spinner instead of skeleton
2. **Error state:** Raw div styling instead of Card component
3. **Back link:** Custom color classes instead of semantic tokens

---

## 📊 Detailed Page-by-Page Redesign Plan

### **1. Jobs Board Page Redesign**

#### **Current State:**
- Legacy custom classes (`heading-1`, `body-base`, `.card`)
- Table-based layout (not responsive friendly)
- Custom color variables (--secondary-teal)
- Inconsistent with Organizations page

#### **Target Design:**

**Header Section:**
```tsx
<div className="container mx-auto p-6 space-y-6">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Jobs Board</h1>
      <p className="text-muted-foreground mt-1">
        {jobs?.length || 0} active interpreter assignments
      </p>
    </div>
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      New Job
    </Button>
  </div>
</div>
```

**Search & Filters (match Organizations):**
```tsx
<div className="flex gap-4">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      placeholder="Search jobs by language, organization, interpreter..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-9"
    />
  </div>
  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Filter by status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Statuses</SelectItem>
      <SelectItem value="Initial">Initial</SelectItem>
      <SelectItem value="Pending">Pending</SelectItem>
      <SelectItem value="Confirmed">Confirmed</SelectItem>
      <SelectItem value="Completed">Completed</SelectItem>
      <SelectItem value="Cancelled">Cancelled</SelectItem>
    </SelectContent>
  </Select>
  {(searchQuery || statusFilter !== 'all') && (
    <Button variant="outline" onClick={clearFilters}>
      Clear
    </Button>
  )}
</div>
```

**Results Count:**
```tsx
<p className="text-sm text-muted-foreground">
  Showing {filteredJobs.length} of {jobs.length} jobs
</p>
```

**Card-Based Layout (replacing table):**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {jobs.map((job) => (
    <Card key={job.id} className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Badge variant={getStatusVariant(job.status)}>
            {job.status}
          </Badge>
          {isUpcoming && (
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Upcoming
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-lg mt-2">
          {language}
        </h3>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm">
        {/* Date/Time */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(startTime, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{format(startTime, 'h:mm a')}</span>
        </div>

        {/* Organization */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span className="truncate">{organization}</span>
        </div>

        {/* Interpreter */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className={interpreterName === 'Unassigned' ? 'italic text-muted-foreground' : ''}>
            {interpreterName}
          </span>
        </div>

        {/* Modality */}
        {job.modality && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Video className="h-4 w-4" />
            <span>{job.modality}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>
```

**Loading State (skeleton cards):**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {Array.from({ length: 6 }).map((_, i) => (
    <Card key={i}>
      <CardHeader>
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  ))}
</div>
```

**Empty State:**
```tsx
<Card>
  <CardContent className="py-12">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold">No Jobs Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Get started by creating your first interpreter assignment
        </p>
      </div>
      <Button onClick={handleNewJob}>
        <Plus className="mr-2 h-4 w-4" />
        Create First Job
      </Button>
    </div>
  </CardContent>
</Card>
```

#### **Key Improvements:**
- ✅ Card-based layout (mobile responsive)
- ✅ Consistent search/filter UI
- ✅ Lucide icons instead of emojis
- ✅ shadcn/ui components throughout
- ✅ Semantic color tokens
- ✅ Skeleton loading states
- ✅ Badge status indicators
- ✅ Better visual hierarchy

---

### **2. Job Detail Page Redesign**

#### **Current Issues:**
- Hardcoded colors (#1B365C, #2D4A6B)
- Raw `<details>` elements
- Mixed typography classes
- Inconsistent grid layouts

#### **Target Design:**

**Page Container:**
```tsx
<div className="container mx-auto p-6 space-y-6">
  {/* Back button */}
  <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/jobs')}>
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back to Jobs Board
  </Button>

  {/* Page Title */}
  <div>
    <h1 className="text-3xl font-bold tracking-tight">
      {languageNames} — {interpreterName} {modality}
    </h1>
    <p className="text-muted-foreground mt-1">
      Job ID: {job.id}
    </p>
  </div>
</div>
```

**Two-Column Grid (responsive):**
```tsx
<div className="grid gap-6 md:grid-cols-2">
  {/* Job Overview Card */}
  <Card>
    <CardHeader>
      <h2 className="font-semibold text-lg">Job Overview</h2>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Content from JobOverviewCard */}
    </CardContent>
  </Card>

  {/* Organization & Location Card */}
  <Card>
    <CardHeader>
      <h2 className="font-semibold text-lg">Organization & Location</h2>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Content from OrganizationLocationCard */}
    </CardContent>
  </Card>
</div>
```

**Interpreter Management (full-width card):**
```tsx
<Card>
  <CardHeader>
    <h2 className="font-semibold text-lg">Interpreter Management</h2>
  </CardHeader>
  <CardContent>
    <InterpreterManagement job={job} />
  </CardContent>
</Card>
```

**Collapsible Sections (using shadcn/ui Collapsible):**
```tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

<Collapsible>
  <Card>
    <CollapsibleTrigger className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="font-semibold text-lg">
          <Mail className="inline-block mr-2 h-5 w-5" />
          Email Composer
        </h2>
        <ChevronDown className="h-4 w-4 transition-transform" />
      </CardHeader>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <CardContent>
        <EmailComposer job={job} />
      </CardContent>
    </CollapsibleContent>
  </Card>
</Collapsible>
```

**Loading State:**
```tsx
<div className="flex items-center justify-center min-h-[60vh]">
  <Card className="w-full max-w-md">
    <CardContent className="pt-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    </CardContent>
  </Card>
</div>
```

**Error State:**
```tsx
<div className="container mx-auto p-6">
  <Card className="border-red-200 bg-red-50">
    <CardContent className="pt-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-red-100 p-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-red-900">Job Not Found</h3>
          <p className="text-sm text-red-700 mt-1">
            {error instanceof Error ? error.message : 'This job could not be loaded'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs Board
        </Button>
      </div>
    </CardContent>
  </Card>
</div>
```

#### **Key Improvements:**
- ✅ Consistent card-based layout
- ✅ Semantic color tokens (no hardcoded colors)
- ✅ shadcn/ui Collapsible component
- ✅ Responsive grid with proper breakpoints
- ✅ Unified typography system
- ✅ Lucide icons for visual consistency

---

### **3. Interpreters Page Redesign**

#### **Current Issues:**
- Custom CSS variables in inline styles
- Legacy `.card`, `.input`, `.select`, `.button` classes
- Emoji icons (🌐, 📍, ✉️, ☎️, 📋)
- Inconsistent grid spacing

#### **Target Design:**

**Page Header:**
```tsx
<div className="container mx-auto p-6 space-y-6">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Interpreter Directory</h1>
      <p className="text-muted-foreground mt-1">
        {filteredCount} of {totalCount} interpreters
      </p>
    </div>
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Interpreter
    </Button>
  </div>
</div>
```

**Search Bar:**
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input
    type="search"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search by name, email, language, or city..."
    className="pl-9"
  />
</div>
```

**Filter Section (using shadcn/ui):**
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-lg">Filters</h2>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Clear all
        </Button>
      )}
    </div>
  </CardHeader>
  <CardContent>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Language Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Languages ({filters.languages?.length ?? 0} selected)
        </label>
        <Select multiple value={filters.languages ?? []} onValueChange={handleLanguageChange}>
          {/* Options */}
        </Select>
      </div>

      {/* Certification Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Certifications ({filters.certifications?.length ?? 0} selected)
        </label>
        <Select multiple value={filters.certifications ?? []} onValueChange={handleCertificationChange}>
          {/* Options */}
        </Select>
      </div>

      {/* Modality Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Modalities ({filters.modalities?.length ?? 0} selected)
        </label>
        <Select multiple value={filters.modalities ?? []} onValueChange={handleModalityChange}>
          {/* Options */}
        </Select>
      </div>

      {/* City Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Cities ({filters.cities?.length ?? 0} selected)
        </label>
        <Select multiple value={filters.cities ?? []} onValueChange={handleCityChange}>
          {/* Options */}
        </Select>
      </div>
    </div>

    {/* Toggle Filters */}
    <div className="flex gap-4 mt-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.isLocal ?? false}
          onChange={handleLocalToggle}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm">Local interpreters only</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.isAgency ?? false}
          onChange={handleAgencyToggle}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm">Show agencies</span>
      </label>
    </div>
  </CardContent>
</Card>
```

**Sort Controls:**
```tsx
<div className="flex items-center gap-4">
  <label className="text-sm font-medium">Sort by:</label>
  <Select value={`${sort.field}-${sort.direction}`} onValueChange={handleSortChange}>
    <SelectTrigger className="w-[200px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
      <SelectItem value="certification-desc">Certification (Highest first)</SelectItem>
      <SelectItem value="languageCount-desc">Language Count (Most first)</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Interpreter Card Redesign:**
```tsx
<Card className="flex flex-col hover:shadow-lg transition-shadow duration-200">
  <CardHeader>
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg truncate">
          {interpreter.first_name} {interpreter.last_name}
        </h3>

        {/* Certification Badge */}
        {highestCert !== 'Non-certified' && (
          <Badge variant={highestCert === 'Certified' ? 'default' : 'secondary'} className="mt-1">
            {highestCert === 'Certified' ? (
              <>
                <Star className="mr-1 h-3 w-3" />
                Certified
              </>
            ) : (
              <>
                <Check className="mr-1 h-3 w-3" />
                Registered
              </>
            )}
          </Badge>
        )}
      </div>
    </div>
  </CardHeader>

  <CardContent className="flex-1 space-y-4 text-sm">
    {/* Languages */}
    {languages.length > 0 && (
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Languages
        </h4>
        <ul className="space-y-1">
          {displayLanguages.map((il) => (
            <li key={il.id} className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <span>
                {il.language?.name}
                {il.certification && (
                  <span className="ml-2 text-muted-foreground">
                    ({il.certification})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        {remainingCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            +{remainingCount} more {remainingCount === 1 ? 'language' : 'languages'}
          </p>
        )}
      </div>
    )}

    {/* Location */}
    {(interpreter.city || interpreter.state) && (
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>
          {interpreter.city}
          {interpreter.city && interpreter.state && ', '}
          {interpreter.state}
        </span>
        {interpreter.is_local && (
          <Badge variant="outline" className="ml-2">
            Local
          </Badge>
        )}
      </div>
    )}

    {/* Contact Information */}
    <div className="space-y-2 pt-4 border-t">
      {interpreter.email && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{interpreter.email}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(interpreter.email!, 'Email');
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}

      {interpreter.phone && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{interpreter.phone}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(interpreter.phone!, 'Phone');
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  </CardContent>

  <CardFooter className="gap-2">
    {interpreter.email && (
      <Button
        variant="default"
        size="sm"
        className="flex-1"
        asChild
        onClick={(e) => e.stopPropagation()}
      >
        <a href={`mailto:${interpreter.email}`}>
          <Mail className="mr-2 h-4 w-4" />
          Email
        </a>
      </Button>
    )}

    {interpreter.phone && (
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        asChild
        onClick={(e) => e.stopPropagation()}
      >
        <a href={`tel:${interpreter.phone}`}>
          <Phone className="mr-2 h-4 w-4" />
          Call
        </a>
      </Button>
    )}
  </CardFooter>

  {/* Agency Badge */}
  {interpreter.is_agency && interpreter.agency_name && (
    <div className="px-6 pb-4 pt-0">
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Agency: {interpreter.agency_name}
        </p>
      </div>
    </div>
  )}
</Card>
```

**Grid Layout:**
```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {filteredInterpreters.map((interpreter) => (
    <InterpreterCard key={interpreter.id} interpreter={interpreter} />
  ))}
</div>
```

**Empty State:**
```tsx
<Card>
  <CardContent className="py-12">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold">No Interpreters Found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {hasActiveFilters
            ? 'No interpreters match your current search or filters'
            : 'Get started by adding your first interpreter to the directory'}
        </p>
      </div>
      {hasActiveFilters ? (
        <Button variant="outline" onClick={clearFilters}>
          Clear filters
        </Button>
      ) : (
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add First Interpreter
        </Button>
      )}
    </div>
  </CardContent>
</Card>
```

#### **Key Improvements:**
- ✅ Replace all emojis with Lucide icons
- ✅ Use shadcn/ui components exclusively
- ✅ Consistent card structure with Organizations page
- ✅ Remove all inline CSS variable styles
- ✅ Unified spacing and grid system
- ✅ Semantic color tokens throughout
- ✅ Proper icon sizing and alignment

---

## 🎯 Design Tokens & Shared Patterns

### **Design Tokens to Establish**

```typescript
// typography.ts
export const typography = {
  pageTitle: "text-3xl font-bold tracking-tight",
  pageSubtitle: "text-muted-foreground mt-1",
  sectionTitle: "font-semibold text-lg",
  cardTitle: "font-semibold text-lg mt-2",
  bodyText: "text-sm",
  mutedText: "text-sm text-muted-foreground",
  labelText: "text-xs font-medium uppercase tracking-wide",
  badgeText: "text-xs font-mono",
};

// spacing.ts
export const spacing = {
  pageContainer: "container mx-auto p-6 space-y-6",
  cardGrid: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
  cardContent: "space-y-2 text-sm",
  sectionSpacing: "space-y-6",
};

// components.ts
export const patterns = {
  iconWithText: "flex items-center gap-2",
  searchInput: "relative flex-1",
  searchIcon: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
  avatar: "flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold",
};
```

### **Component Patterns**

#### **1. Page Header Pattern**
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
    <p className="text-muted-foreground mt-1">{description}</p>
  </div>
  <Button>{actionLabel}</Button>
</div>
```

#### **2. Search + Filter Pattern**
```tsx
<div className="flex gap-4">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input placeholder={placeholder} className="pl-9" />
  </div>
  <Select>{/* filter options */}</Select>
  {hasFilters && <Button variant="outline">Clear</Button>}
</div>
```

#### **3. Results Count Pattern**
```tsx
<p className="text-sm text-muted-foreground">
  Showing {filtered} of {total} {entityName}
</p>
```

#### **4. Empty State Pattern**
```tsx
<Card>
  <CardContent className="py-12">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      <Button>{actionLabel}</Button>
    </div>
  </CardContent>
</Card>
```

#### **5. Loading Skeleton Pattern**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {Array.from({ length: 6 }).map((_, i) => (
    <Card key={i}>
      <CardHeader>
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  ))}
</div>
```

#### **6. Error State Pattern**
```tsx
<Card className="border-red-200 bg-red-50">
  <CardContent className="pt-6">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <div>
        <h3 className="font-semibold text-red-900">{errorTitle}</h3>
        <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
      </div>
      <Button variant="outline" size="sm" onClick={retryAction}>
        Retry
      </Button>
    </div>
  </CardContent>
</Card>
```

---

## 🚀 Implementation Strategy

### **Phase 1: Foundation (Week 1)**

**Remove legacy CSS variables:**
1. Identify all custom CSS variables in globals.css (--primary-blue, --secondary-teal, --gray-*, etc.)
2. Create migration map to shadcn/ui semantic tokens
3. Update all inline `style={{ color: 'var(--xyz)' }}` to Tailwind classes

**Typography cleanup:**
1. Remove custom classes (heading-1, heading-2, body-base, etc.)
2. Replace with Tailwind utilities
3. Create shared typography constants

**Component inventory:**
1. Audit all custom `.card`, `.button`, `.badge`, `.input` classes
2. Replace with shadcn/ui components
3. Update import statements

### **Phase 2: Jobs Board Redesign (Week 2)**

1. ✅ Implement new page header with consistent structure
2. ✅ Add search + filter UI (match Organizations page)
3. ✅ Convert table to card-based grid layout
4. ✅ Replace custom badges with shadcn/ui Badge component
5. ✅ Add skeleton loading states
6. ✅ Update empty state with proper Card structure
7. ✅ Replace emojis with Lucide icons
8. ✅ Test responsive breakpoints (mobile, tablet, desktop)

### **Phase 3: Job Detail Redesign (Week 2-3)**

1. ✅ Update page container and spacing
2. ✅ Convert hardcoded colors to semantic tokens
3. ✅ Replace `<details>` with shadcn/ui Collapsible
4. ✅ Add responsive grid breakpoints
5. ✅ Update loading and error states
6. ✅ Audit sub-components (JobOverviewCard, OrganizationLocationCard, etc.)
7. ✅ Ensure consistent Card component usage

### **Phase 4: Interpreters Page Redesign (Week 3-4)**

1. ✅ Update page header and search bar
2. ✅ Redesign FilterBar component with shadcn/ui Select
3. ✅ Completely rebuild InterpreterCard component
4. ✅ Replace all emojis with Lucide icons
5. ✅ Remove inline CSS variable styles
6. ✅ Update grid spacing and breakpoints
7. ✅ Add proper skeleton loading
8. ✅ Test filter interactions

### **Phase 5: Testing & Polish (Week 4)**

1. ✅ Cross-browser testing (Chrome, Firefox, Safari)
2. ✅ Responsive testing (mobile, tablet, desktop)
3. ✅ Accessibility audit (keyboard navigation, screen readers)
4. ✅ Performance optimization (lazy loading, code splitting)
5. ✅ Dark mode support (verify all semantic tokens work)
6. ✅ Final visual QA across all pages

---

## 📋 Component Migration Checklist

### **shadcn/ui Components Needed**

**Already Installed:**
- ✅ Card (CardHeader, CardContent, CardFooter)
- ✅ Button
- ✅ Badge
- ✅ Input
- ✅ Select (SelectTrigger, SelectValue, SelectContent, SelectItem)

**To Add:**
- [ ] Collapsible (for Job Detail page)
- [ ] Skeleton (for loading states - can use DIY approach)
- [ ] Tabs (if needed for future features)
- [ ] Dropdown Menu (for action menus)
- [ ] Dialog (for modals)
- [ ] Toast (for notifications)
- [ ] Avatar (for interpreter profiles)

### **Lucide Icons Needed**

```typescript
import {
  Search,
  Plus,
  Building2,
  MapPin,
  Tag,
  Calendar,
  Clock,
  User,
  Video,
  ArrowLeft,
  AlertCircle,
  Mail,
  Phone,
  Copy,
  Check,
  Star,
  Languages,
  Users,
  ChevronDown,
  X,
} from 'lucide-react';
```

---

## 🎨 Visual Design Principles

### **Consistency**
- Single component library (shadcn/ui)
- Unified color system (semantic tokens)
- Standardized spacing (Tailwind utilities)
- Consistent typography hierarchy

### **Clarity**
- Clear visual hierarchy (text sizes, weights, colors)
- Meaningful icons (Lucide instead of emojis)
- Proper contrast ratios (WCAG AA compliance)
- Readable text spacing

### **Responsiveness**
- Mobile-first design approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Card-based layouts (better than tables on mobile)
- Flexible grids with gap spacing

### **Accessibility**
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus states on interactive elements
- Screen reader friendly

### **Performance**
- Minimal custom CSS
- Tailwind JIT compilation
- Component lazy loading
- Optimized icon imports

---

## 📝 Next Steps

1. **Designer Review:** Review this document and approve design direction
2. **Stakeholder Approval:** Present redesign mockups to user
3. **Component Library Audit:** Ensure all shadcn/ui components are installed
4. **Create Shared Constants:** Build typography, spacing, and pattern libraries
5. **Begin Phase 1:** Start with foundation cleanup (CSS variables, typography)
6. **Iterative Implementation:** Tackle one page at a time with user feedback
7. **Testing:** Comprehensive QA after each phase

---

**Document Version:** 1.0
**Last Updated:** 2026-02-02
**Next Review:** After Phase 1 completion
