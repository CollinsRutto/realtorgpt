import React from 'react';
import StarField from '@/components/StarField';
import ShootingStars from '@/components/ShootingStars';
import LoadingAnimation from '@/components/LoadingAnimation';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  loading?: boolean;
}

export default function DashboardLayout({ children, loading = false }: DashboardLayoutProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <StarField starCount={150} />
      <ShootingStars delay={5} />
      {children}
    </div>
  );
}