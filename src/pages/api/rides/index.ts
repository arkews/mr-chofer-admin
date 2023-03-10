import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { type NextApiRequest, type NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method === 'GET') {
    const supabase = createServerSupabaseClient({ req, res })
    const session = await supabase.auth.getSession()

    if (session === null) {
      res.status(401).json({ error: 'No existe sesión' })
      return
    }

    const { page, pageSize } = req.query
    const rawPage = parseInt(page as string, 10)
    const rawPageSize = parseInt(pageSize as string, 10)

    // Get today completed rides
    const { data, count, error } = await supabase
      .from('ride_history')
      .select('id, request_time, gender, affiliate_id, status, passengers:passenger_id(name), drivers:driver_id(name)', {
        count: 'estimated'
      })
      .order('id', { ascending: false })
      .range(rawPage * rawPageSize, (rawPage + 1) * rawPageSize)

    if (error !== null) {
      res.status(500).json({ error: error.message })
      return
    }

    res.status(200).json({
      rides: data,
      total: count
    })
  }
}

export default handler
