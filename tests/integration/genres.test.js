const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')
const { User } = require('../../models/users')
const { Genre } = require('../../models/genres')
const { server } = require('../../app')
const { genres, populateGenres } = require('./seed')

describe('/api/genres', () => {
  beforeEach(populateGenres)

  afterEach(async () => {
    await Genre.deleteMany()
  })

  describe('GET /', () => {
    it('should return all genres', done => {
      
      request(server)
        .get('/api/genres/')
        .expect(200)
        .expect(res => {
          expect(res.body.length).toBe(2)
          expect(res.body.some(genre => genre.name === 'genre1')).toBeTruthy()
          expect(res.body.some(genre => genre.name === 'genre2')).toBeTruthy()
        })
        .end(done)
    })
  })

  describe('GET /:id', () => {
    it('should return genre if valid id is passed', done => {
    
      request(server)
        .get(`/api/genres/${genres[0]._id}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('name', genres[0].name)
        })
        .end(done)
    })

    it('should return 404 if invalid id is passed', done => {
      request(server)
        .get(`/api/genres/1`)
        .expect(404)
        .end(done)
    })

    it('should return 404 if invalid id is passed', done => {
      const id = new ObjectId()
      request(server)
        .get(`/api/genres/${ id }`)
        .expect(404)
        .end(done)
    })
  })

  describe('POST /', () => {
    it('should return 401 if client is not logged in', done => {
      request(server)
        .post('/api/genres')
        .send({ name: 'genre' })
        .expect(401)
        .end(done)
    })

    it('should return 400 if genre is less than 5 characters', done => {
      const token = new User().createAuthToken()

      request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name: '1234' })
        .expect(400)
        .end(done)
    })

    it('should return 400 if genre is more than 50 characters', done => {
      const token = new User().createAuthToken()
      const name = new Array(52).join('a')
      request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name: name })
        .expect(400)
        .end(done)
    })

    it('should save the genre if it is valid', done => {
      const token = new User().createAuthToken()
      const genre = { name: 'genre1' }

      request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send(genre)
        .expect(200)
        .end(async (err, res) => {
          if (err) return done(err.message)

          const foundGenre = await Genre.find(genre)
          expect(foundGenre).not.toBeNull()
          done()
        })
    })

    it('should return the genre if it is valid', done => {
      const token = new User().createAuthToken()
      const genre = { name: 'genre1' }

      request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send(genre)
        .expect(200)
        .end(async (err, res) => {
          if (err) return done(err.message)

          expect(res.body).toHaveProperty('_id')
          expect(res.body).toHaveProperty('name', 'genre1')
          done()
        })
    })
  })
})