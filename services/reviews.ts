// @ts-ignore
import { v4 as uuidv4 } from 'uuid'
import cryptoRandomString from 'crypto-random-string';
import { reviews } from '../store'

type User = {
  firstName: string | undefined,
  lastName: string | undefined,
  username: string | undefined,
  avatar: string | undefined,
}

type Review = {
  id?: string,
  slug?: string,
  text: string,
  sender: User,
  recipient: User,
  source: string,
  forwardedAt: number,
  sentAt: number,
  originalData: any
}

export const saveReview = (review: Review) => {
  const id = uuidv4();
  const slug = cryptoRandomString({length: 12, type: 'base64'});
  const newReview = { id, slug, ...review };
  reviews.push(newReview);
  return newReview;
}

export const findReviewById = (id: string): Review => {
  return reviews.find((review: Review) => review.id === id)
}

export const findReviewBySlug = (slug: string): Review => {
  return reviews.find((review: Review) => review.slug === slug)
}
