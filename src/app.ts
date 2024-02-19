import fastify from 'fastify'
import cookies from '@fastify/cookie'
import { userRoutes } from './http/routes/user'
import { mealsRoutes } from './http/routes/meals'

export const app = fastify()

app.register(cookies)

app.register(userRoutes, {
  prefix: '/user',
})
app.register(mealsRoutes, {
  prefix: '/meal',
})
