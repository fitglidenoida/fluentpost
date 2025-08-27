import { notFound } from 'next/navigation'
import db from '@/lib/db'

interface Campaign {
  id: string
  name: string
  description: string
  status: string
  startDate: string
  endDate: string
  budget?: number
  analytics?: any[]
}

interface CampaignPageProps {
  params: Promise<{ id: string }>
}

async function getCampaignData(id: string): Promise<Campaign | null> {
  try {
    // Mock campaign data since Campaign table doesn't exist
    const campaign = null

    if (!campaign) return null

    // Return mock campaign
    return {
      id,
      name: 'Sample Campaign',
      description: 'This is a mock campaign since the Campaign table doesn\'t exist.',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      budget: 1000,
      analytics: []
    }
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return null
  }
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { id } = await params
  const campaign = await getCampaignData(id)

  if (!campaign) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {campaign.name}
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            {campaign.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {campaign.status}
              </span>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${campaign.budget?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Duration</h3>
              <p className="text-sm text-gray-600">
                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
            <p className="text-gray-600">
              Campaign analytics would be displayed here when the Campaign and Analytics tables exist.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}