'use client';

import SignUp from '@/components/Auth/SignUp';
import StarField from '@/components/StarField';

export default function SignUpPage() {
  return (
    <>
      <StarField starCount={150} />
      <SignUp />
    </>
  );
}