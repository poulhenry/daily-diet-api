import { afterAll, beforeAll, describe, it, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'
import { app } from '../../../src/app'

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create an user', async () => {
    await request(app.server)
      .post('/user')
      .send({
        name: 'John Doe',
      })
      .expect(201)
  })

  it('should be able to list all users', async () => {
    await request(app.server).get('/user').expect(200)
  })

  it('should be able indetify an existing user', async () => {
    const response = await request(app.server)
      .post('/user')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining('sessionId')]),
    )
  })

  it('should be able get metrics an user', async () => {
    const responseUser = await request(app.server)
      .post('/user')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    const cookies = responseUser.get('Set-Cookie')

    const users = await request(app.server).get('/user').expect(200)
    const userId = users.body.users[0].id

    const response = await request(app.server)
      .get(`/user/${userId}/metrics`)
      .set('Cookie', cookies)

    expect(response.body.metrics).toEqual(
      expect.objectContaining({
        onDient: expect.any(Number),
        offDiet: expect.any(Number),
        total: expect.any(Number),
        bestSequence: expect.any(Number),
      }),
    )
  })
})
