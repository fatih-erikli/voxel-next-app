import LoginForm from "@/components/LoginForm";
import Navigation from "@/components/Navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      <div className="main">
        <LoginForm />
      </div>
    </>
  );
}
