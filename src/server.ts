import { app } from './app'

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
  }

  console.log(`Server listening at ${address}`)
})
