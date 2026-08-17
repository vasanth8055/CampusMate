import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getMyPayments } from "@/features/payment/api/payment.api";
import { EmptyState } from "@/components/common/EmptyState";

export default function PaymentHistoryPage(){
  const { data } = useQuery({ queryKey: ['payments','me'], queryFn: getMyPayments });
  const payments = data?.data ?? [];

  return (
    <PageContainer>
      <PageHeader title="Payments" subtitle="Your payment history" />
      {payments.length===0 ? <EmptyState title="No payments" description="You have no recorded payments." /> : (
        <div className="space-y-2">{payments.map((p:any)=> <div key={p.id} className="rounded-card border p-3 bg-surface">Payment {p.id} • {p.amount}</div>)}</div>
      )}
    </PageContainer>
  );
}
