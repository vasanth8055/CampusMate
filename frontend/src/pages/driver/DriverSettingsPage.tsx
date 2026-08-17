import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function DriverSettingsPage(){
  const navigate = useNavigate();
  return (
    <PageContainer>
      <PageHeader title="Driver settings" subtitle="Manage your driver preferences" />
      <div className="rounded-card border p-4 bg-surface space-y-4">
        <div className="text-sm text-foreground-secondary">Settings that affect your driver experience.</div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/profile')}>Edit profile</Button>
          <Button variant="outline" onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/driver/dashboard'))}>Back</Button>
        </div>
      </div>
    </PageContainer>
  );
}
