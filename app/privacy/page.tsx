import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
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
            <CardTitle className="text-2xl font-bold text-white">Privacy Policy</CardTitle>
            <p className="text-gray-400">Last updated: January 2025</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="space-y-6 text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us when you create an account, participate in rating sessions,
                  and communicate with us. This includes your name, email address, profile information, and ratings data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
                <p>
                  We use the information we collect to provide, maintain, and improve our services, including:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Creating and managing your account</li>
                  <li>Processing and displaying player ratings</li>
                  <li>Communicating with you about the service</li>
                  <li>Detecting and preventing fraud and abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
                  except as described in this policy. We may share information with service providers who assist us in operating
                  our platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized access,
                  alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
                <p>
                  You have the right to access, update, or delete your personal information. You may also opt out of certain
                  communications from us. Contact us if you wish to exercise these rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us through our support channels.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 