import { afterAll, beforeAll, describe, it, beforeEach } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'
import { app } from '../../../src/app'

describe('Meals routes', () => {
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

  it('should be able to list all meals an user', async () => {
    const response = await request(app.server)
      .post('/user')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Dish simple',
        description: 'what a simple dish',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    await request(app.server).get('/meal').set('Cookie', cookies).expect(200)
  })

  it('should be able to get a meal by id', async () => {
    const response = await request(app.server)
      .post('/user')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Dish simple',
        description: 'what a simple dish',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    const responseMeals = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = responseMeals.body.meals[0].id

    await request(app.server)
      .get(`/meal/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  it('should be able to create a meal', async () => {
    const response = await request(app.server)
      .post('/user')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Dish simple',
        description: 'what a simple dish',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)
  })

  it('should be able to update a meal', async () => {
    const response = await request(app.server)
      .post('/user')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Dish simple',
        description: 'what a simple dish',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    const responseMeals = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = responseMeals.body.meals[0].id

    await request(app.server)
      .put(`/meal/${mealId}`)
      .send({
        name: 'Dish 2',
        description: 'what a simple dish',
        isOnDiet: false,
      })
      .set('Cookie', cookies)
      .expect(200)
  })

  it('should be able to delete an meal', async () => {
    const response = await request(app.server)
      .post('/user')
      .send({
        name: 'John Doe',
      })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meal')
      .send({
        name: 'Dish simple',
        description: 'what a simple dish',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    const responseMeals = await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = responseMeals.body.meals[0].id

    await request(app.server)
      .delete(`/meal/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })
})
