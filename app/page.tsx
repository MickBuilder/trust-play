import { createClient } from '@/lib/supabase/server'
import {
  Navigation,
  HeroSection,
  FeaturesSection,
  FloatingCards,
  HowItWorksSection,
  CTASection,
  Footer
} from '@/components/landing'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <FloatingCards />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  )
}
