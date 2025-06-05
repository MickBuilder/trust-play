import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">TrustPlay</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Terms of Service</CardTitle>
            <p className="text-gray-400">Last updated: January 2025</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="space-y-6 text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using TrustPlay, you accept and agree to be bound by the terms and provision of this agreement.
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Use License</h2>
                <p>
                  Permission is granted to temporarily use TrustPlay for personal, non-commercial transitory viewing only.
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained in TrustPlay</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. User Conduct</h2>
                <p>
                  Users must provide accurate ratings and maintain respectful behavior within the community.
                  Any abuse of the rating system or harassment of other users will result in account suspension.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Privacy</h2>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service,
                  to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us through our support channels.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 