import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../../middlewares/check-session-id-exits'
import { knex } from '../../database'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.get('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId
    const user = await knex('users').where('session_id', sessionId).first()

    if (!user) {
      return reply.status(400).send({
        error: 'User not found',
      })
    }

    const meals = await knex('meals').where('user_id', user.id).select('*')

    return reply.status(200).send({
      meals,
    })
  })

  app.get('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)
    const meal = await knex('meals').where('id', id).first()

    if (!meal) {
      return reply.status(404).send({
        error: 'Meal not found',
      })
    }

    return reply.send({ meal })
  })

  app.post('/', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
    })

    const { name, description, isOnDiet } = bodySchema.parse(request.body)

    const sessionId = request.cookies.sessionId

    const user = await knex('users').where('session_id', sessionId).first()

    if (!user) {
      return reply.status(400).send({
        error: 'User not found',
      })
    }

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_on_diet: isOnDiet,
      user_id: user.id,
    })

    return reply.status(201).send()
  })

  app.put('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      name: z.string(),
      description: z.string().nullable(),
      isOnDiet: z.boolean(),
    })

    const { id } = getMealParamsSchema.parse(request.params)
    const { name, description, isOnDiet } = bodySchema.parse(request.body)

    await knex('meals').where('id', id).update({
      name,
      description,
      is_on_diet: isOnDiet,
    })

    return reply.status(200).send()
  })

  app.delete('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    await knex('meals').where('id', id).delete()

    return reply.status(204).send()
  })
}
