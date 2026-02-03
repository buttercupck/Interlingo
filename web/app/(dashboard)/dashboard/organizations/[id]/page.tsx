'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Edit, Building2, MapPin, User as UserIcon } from 'lucide-react';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function OrganizationDetailPage() {
  const params = useParams();
  const organizationId = params?.id as string;

  const { data: organization, isLoading, error } = useOrganization(organizationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <Building2 className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Organization Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  {error instanceof Error ? error.message : 'This organization could not be loaded'}
                </p>
              </div>
              <Link href="/dashboard/organizations">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Organizations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/dashboard/organizations">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Organizations
          </Button>
        </Link>

        {/* Hero Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                <Building2 className="h-12 w-12" />
              </div>

              {/* Name, Badges, Quick Actions */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                      {organization.name}
                    </h1>
                    <div className="flex items-center gap-2">
                      {organization.type && (
                        <Badge variant="secondary" className="text-sm">
                          {organization.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  {organization.email && (
                    <a href={`mailto:${organization.email}`}>
                      <Button variant="default" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </a>
                  )}
                  {organization.phone && (
                    <a href={`tel:${organization.phone}`}>
                      <Button variant="default" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            {organization.address && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h3>
                <div className="text-sm">
                  <p>{organization.address}</p>
                  {(organization.city || organization.state || organization.zip) && (
                    <p className="mt-1">
                      {organization.city}
                      {organization.city && (organization.state || organization.zip) && ', '}
                      {organization.state} {organization.zip}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Two-Column Grid: Organization Details + Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Organization Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {organization.type && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Type</div>
                  <div className="text-sm mt-1">{organization.type}</div>
                </div>
              )}
              {organization.phone && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Main Phone</div>
                  <div className="text-sm mt-1">{organization.phone}</div>
                </div>
              )}
              {organization.email && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Main Email</div>
                  <div className="text-sm mt-1">{organization.email}</div>
                </div>
              )}
              {organization.address && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Full Address</div>
                  <div className="text-sm mt-1">
                    <p>{organization.address}</p>
                    {(organization.city || organization.state || organization.zip) && (
                      <p className="mt-1">
                        {organization.city}
                        {organization.city && (organization.state || organization.zip) && ', '}
                        {organization.state} {organization.zip}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Primary Contact
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {organization.contact_name ? (
                <>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Contact Name</div>
                    <div className="text-sm mt-1">{organization.contact_name}</div>
                  </div>
                  {organization.contact_email && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Contact Email</div>
                      <div className="text-sm mt-1">{organization.contact_email}</div>
                    </div>
                  )}
                  {organization.contact_phone && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Contact Phone</div>
                      <div className="text-sm mt-1">{organization.contact_phone}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No primary contact information available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes Section */}
        {organization.notes && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Notes</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{organization.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
