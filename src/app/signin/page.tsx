'use client';

import SignIn from '@/components/Auth/SignIn';
import StarField from '@/components/StarField';

export default function SignInPage() {
  return (
    <>
      <StarField starCount={150} />
      <SignIn />
    </>
  );
}