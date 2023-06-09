import Navigation from "@/components/Navigation";
import RegistationForm from "@/components/RegistrationForm";

export default function Home() {
  return (
    <>
      <Navigation />
      <div className="main">
        <RegistationForm />
      </div>
    </>
  );
}
