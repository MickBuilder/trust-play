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

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is authenticated, redirect to dashboard
  if (user) {
    return (
      <script>
        {`window.location.href = '/dashboard'`}
      </script>
    )
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
