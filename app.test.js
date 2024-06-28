const request = require('supertest');
const app = require('./app');

describe('GET /test-db-connection', () => {
    it('should connect to MongoDB successfully', async () => {
        const res = await request(app).get('/test-db-connection');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe('Connected to MongoDB');
    });
});

describe('GET /csrf', () => {
    it('should generate a CSRF token', async () => {
        const res = await request(app).get('/csrf');
        expect(res.statusCode).toEqual(200);
        expect(res.text).not.toBeNull();
    });
});

/*describe('POST /offers/validate', () => {
    it('should validate an offer with a valid location', async () => {
        const location = 'Ljubljana';

        const res = await request(app)
            .post('/offers/validate')
            .type('json')
            .send({ location });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('latitude');
        expect(res.body).toHaveProperty('longitude');
    });

    it('should return 404 for an invalid location', async () => {
        const location = 'NonexistentCity';

        const res = await request(app)
            .post('/offers/validate')
            .type('json')
            .send({ location });


        expect(res.statusCode).toEqual(404);
        expect(res.text).toBe('Location not found');
    });
});*/