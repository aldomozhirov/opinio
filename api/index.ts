import express from 'express'
import bot from '../bot'
import {findReviewById, findReviewBySlug} from '../services/reviews'

const app = express()

app.use(express.json())
app.use(bot.webhookCallback('/telegraf'))

app.get('/health', async (req, res) => {
  res.json({ health: 'ok' })
})

app.get('/reviews/:slug', async (req, res) => {
  res.json(findReviewBySlug(req.params.slug))
})

export default {
  path: '/api',
  handler: app
}
