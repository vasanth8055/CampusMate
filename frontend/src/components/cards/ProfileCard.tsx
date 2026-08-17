import { Mail, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type ProfileCardProps = {
  id?: string | number;
  name: string;
  avatarUrl?: string;
  college?: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  badges?: string[]; // custom verification/labels
  onEdit?: () => void;
  onMessage?: () => void;
  loading?: boolean;
  className?: string;
};

export function ProfileCard({ id, name, avatarUrl, college, email, phone, verified = false, badges, onEdit, onMessage, loading = false, className }: ProfileCardProps) {
  return (
    <Card loading={loading} className={cn("w-full", className)} aria-labelledby={id ? `profile-${id}-name` : undefined}>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar name={name} src={avatarUrl} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle id={id ? `profile-${id}-name` : undefined} className="truncate">{name}</CardTitle>
              {verified ? <Badge variant="verified" size="sm">Verified</Badge> : null}
            </div>

            {college ? <div className="text-small text-foreground-secondary">{college}</div> : null}

            <div className="mt-2 flex flex-col gap-1 text-small text-foreground-secondary">
              {email ? (
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{email}</div>
              ) : null}

              {phone ? (
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{phone}</div>
              ) : null}
            </div>

            {badges && badges.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.map((b) => (
                  <Badge key={b} variant="default" size="sm">{b}</Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-center gap-3">
          {onMessage ? (
            <Button variant="outline" onClick={onMessage} aria-label={`Message ${name}`}>Message</Button>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            {onEdit ? (
              <Button variant="primary" onClick={onEdit} aria-label={`Edit profile of ${name}`}>Edit</Button>
            ) : null}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ProfileCard;
