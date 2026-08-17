import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorState } from "@/components/common/ErrorState";
import { getCurrentUser, updateCurrentUser } from "@/features/profile/api/profile.api";
import type { UpdateUserRequest } from "@/features/profile/types/profile.types";

export default function SettingsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["user", "current"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const [formValues, setFormValues] = useState<UpdateUserRequest>({});

  useEffect(() => {
    if (data?.data) {
      setFormValues({
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        phoneNumber: data.data.phoneNumber,
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: () => {
      toast.success("Profile settings saved.");
      refetch();
    },
    onError: () => {
      toast.error("Unable to save settings. Please try again.");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateMutation.mutate(formValues);
  };

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Home", href: "/dashboard" }]} current="Settings" />
      <PageHeader title="Settings" subtitle="Appearance, notifications, and account controls." />

      {isLoading ? (
        <div className="rounded-card border border-border-dashed bg-surface p-10 text-center text-foreground-secondary">Loading settings...</div>
      ) : isError ? (
        <ErrorState title="Unable to load settings" message="Please refresh or try again later." />
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <Card className="rounded-card border border-border bg-surface">
            <CardContent className="space-y-6">
              <div>
                <CardTitle className="text-lg">Account details</CardTitle>
                <p className="mt-2 text-sm text-foreground-secondary">Update your name and phone number for better commute matching.</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Input
                  label="First name"
                  value={formValues.firstName ?? ""}
                  onChange={(event) => setFormValues((current) => ({ ...current, firstName: event.target.value }))}
                />
                <Input
                  label="Last name"
                  value={formValues.lastName ?? ""}
                  onChange={(event) => setFormValues((current) => ({ ...current, lastName: event.target.value }))}
                />
              </div>

              <Input
                label="Phone number"
                value={formValues.phoneNumber ?? ""}
                onChange={(event) => setFormValues((current) => ({ ...current, phoneNumber: event.target.value }))}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" loading={updateMutation.isPending}>
                Save changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="rounded-card border border-border bg-surface">
            <CardContent className="space-y-4">
              <div>
                <CardTitle className="text-lg">Account actions</CardTitle>
                <p className="mt-2 text-sm text-foreground-secondary">Manage your Rider profile preferences and account security.</p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-card border border-border-subtle bg-surface-subtle p-4">
                  <p className="text-small text-foreground-secondary">Email</p>
                  <p className="mt-1 font-medium text-foreground">{data?.data.email}</p>
                </div>
                <div className="rounded-card border border-border-subtle bg-surface-subtle p-4">
                  <p className="text-small text-foreground-secondary">Role</p>
                  <p className="mt-1 font-medium text-foreground">{data?.data.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {isError ? (
        <div className="mt-4">
          <Button variant="secondary" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : null}
    </PageContainer>
  );
}
