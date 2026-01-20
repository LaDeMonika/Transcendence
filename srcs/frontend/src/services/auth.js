import { useAxios } from '@vueuse/integrations/useAxios'
import { client } from './client.js'

export const signin = async (email, password) => {
  const {data, execute } = useAxios('/testuser', { method: 'POST' }, client);
  await execute({ data: { email, password } });
  return data;
}

