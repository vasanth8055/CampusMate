import AuthLayout from "@/layouts/AuthLayout";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back 👋"
      subtitle="Login to continue your CampusMate journey."
    >
      <LoginForm />
    </AuthLayout>
  );
}