'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, Edit, User as UserIcon } from 'lucide-react';
import { useInterpreters } from '@/lib/hooks/useInterpreters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnavailabilityManager } from '@/components/interpreters/UnavailabilityManager';

export default function InterpreterProfilePage() {
  const params = useParams();
  const interpreterId = params?.id as string;

  const { data: interpreters, isLoading, error } = useInterpreters();
  const interpreter = interpreters?.find((i) => i.id === interpreterId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading interpreter profile...</p>
        </div>
      </div>
    );
  }

  if (error || !interpreter) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <UserIcon className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Interpreter Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  {error instanceof Error ? error.message : 'This interpreter could not be loaded'}
                </p>
              </div>
              <Link href="/dashboard/interpreters">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Interpreters
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract language data
  const languages = interpreter.interpreter_languages || [];
  const certifications = languages.map((il: any) => il.certification).filter(Boolean);
  const hasCertified = certifications.includes('Certified');
  const hasRegistered = certifications.includes('Registered');
  const highestCert = hasCertified ? 'Certified' : hasRegistered ? 'Registered' : null;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/dashboard/interpreters">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Interpreters
          </Button>
        </Link>

        {/* Hero Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {interpreter.first_name?.[0]}{interpreter.last_name?.[0]}
              </div>

              {/* Name, Badges, Quick Actions */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                      {interpreter.first_name} {interpreter.last_name}
                    </h1>
                    <div className="flex items-center gap-2">
                      {highestCert && (
                        <Badge variant={highestCert === 'Certified' ? 'default' : 'secondary'} className="text-sm">
                          {highestCert}
                        </Badge>
                      )}
                      {interpreter.is_local && (
                        <Badge variant="outline" className="text-sm">
                          Local
                        </Badge>
                      )}
                      {interpreter.is_agency && (
                        <Badge variant="outline" className="text-sm">
                          Agency
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  {interpreter.email && (
                    <a href={`mailto:${interpreter.email}`}>
                      <Button variant="default" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </a>
                  )}
                  {interpreter.phone && (
                    <a href={`tel:${interpreter.phone}`}>
                      <Button variant="default" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Mark Unavailable
                  </Button>
                </div>
              </div>
            </div>

            {/* Language Badges */}
            {languages.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Languages & Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map((il: any) => (
                    <Badge key={il.id} variant="secondary" className="text-sm">
                      {il.language?.name}
                      {il.certification && ` (${il.certification})`}
                      {il.preference_rank === 1 && ' ⭐'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Two-Column Grid: Professional Details + Contact/Agency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Professional Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Professional Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {interpreter.license_number && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">License Number</div>
                  <div className="text-sm mt-1">{interpreter.license_number}</div>
                </div>
              )}
              {interpreter.rate && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Rate</div>
                  <div className="text-sm mt-1">{interpreter.rate}</div>
                </div>
              )}
              {interpreter.timezone && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Timezone</div>
                  <div className="text-sm mt-1">{interpreter.timezone}</div>
                </div>
              )}
              {interpreter.modality_preferences && interpreter.modality_preferences.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Modality Preferences</div>
                  <div className="flex gap-2 mt-1">
                    {interpreter.modality_preferences.map((modality) => (
                      <Badge key={modality} variant="outline" className="text-xs">
                        {modality}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Agency Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Contact Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {interpreter.email && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="text-sm mt-1">{interpreter.email}</div>
                </div>
              )}
              {interpreter.phone && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Phone</div>
                  <div className="text-sm mt-1">{interpreter.phone}</div>
                </div>
              )}
              {(interpreter.city || interpreter.state) && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Location</div>
                  <div className="text-sm mt-1">
                    {interpreter.city}{interpreter.city && interpreter.state && ', '}{interpreter.state}
                  </div>
                </div>
              )}
              {interpreter.is_agency && (
                <>
                  {interpreter.agency_name && (
                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium text-muted-foreground">Agency Name</div>
                      <div className="text-sm mt-1">{interpreter.agency_name}</div>
                    </div>
                  )}
                  {interpreter.agency_contact_email && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Agency Email</div>
                      <div className="text-sm mt-1">{interpreter.agency_contact_email}</div>
                    </div>
                  )}
                  {interpreter.agency_contact_phone && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Agency Phone</div>
                      <div className="text-sm mt-1">{interpreter.agency_contact_phone}</div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Unavailability Calendar */}
        <UnavailabilityManager interpreterId={interpreter.id} />

        {/* Internal Notes */}
        {interpreter.internal_notes && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Internal Notes</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{interpreter.internal_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
