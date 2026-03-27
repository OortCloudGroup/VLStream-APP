import { request } from '@/utils/service'

export const fetchData = () => {
  return request({
    url: './table.json',
    method: 'get'
  })
}
