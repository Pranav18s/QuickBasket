import AuthForm from "../../components/auth/AuthForm";

export const metadata = { title: "Sign in | QuickBasket" };

export default function Page() {
  return <AuthForm mode="login" />;
}
