import { SignUp } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/Navbar';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </div>
    </div>
  );
}
