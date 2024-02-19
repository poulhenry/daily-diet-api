import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'
import { knex } from '../../database'
import { checkSessionIdExists } from '../../middlewares/check-session-id-exits'

export async function userRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const users = await knex('users').select('*')

    return { users }
  })

  app.post('/', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
    })

    const { name } = bodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get(
    '/:id/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMetricsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMetricsParamsSchema.parse(request.params)

      const meals = await knex('meals')
        .where('user_id', id)
        .orderBy('created_at', 'desc')
        .select('*')

      const mealsAmount = meals.length
      const mealsOnDiet = meals.filter((meal) => meal.is_on_diet).length
      const mealsOffDiet = meals.filter((meal) => !meal.is_on_diet).length

      const { bestSequence } = meals.reduce(
        (acc, meal) => {
          if (meal.is_on_diet) {
            acc.lastSequence += 1
          } else {
            acc.lastSequence = 0
          }

          if (acc.lastSequence > acc.bestSequence) {
            acc.bestSequence = acc.lastSequence
          }

          return acc
        },
        { bestSequence: 0, lastSequence: 0 },
      )

      const metrics = {
        onDient: mealsOnDiet,
        offDiet: mealsOffDiet,
        total: mealsAmount,
        bestSequence,
      }

      return reply.send({
        metrics,
      })
    },
  )
}
