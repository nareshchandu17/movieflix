describe('API Endpoints', () => {
  const authToken = 'test-token';

  describe('Authentication Endpoints', () => {
    it('should register new user', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/register',
        body: {
          email: 'test@example.com',
          password: 'TestPassword123!',
          name: 'Test User'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('token');
      });
    });

    it('should login user', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'test@example.com',
          password: 'TestPassword123!'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
      });
    });

    it('should validate token', () => {
      cy.request({
        method: 'GET',
        url: '/api/auth/validate',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should logout user', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/logout',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe('Movie Endpoints', () => {
    it('should get movie list', () => {
      cy.request('/api/movies').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('should get movie by ID', () => {
      cy.request('/api/movies/123').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('title');
      });
    });

    it('should search movies', () => {
      cy.request('/api/movies/search?q=action').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('should get movies by category', () => {
      cy.request('/api/movies/category/action').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('should get trending movies', () => {
      cy.request('/api/movies/trending').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

  describe('User Endpoints', () => {
    it('should get user profile', () => {
      cy.request({
        method: 'GET',
        url: '/api/user/profile',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('email');
      });
    });

    it('should update user profile', () => {
      cy.request({
        method: 'PUT',
        url: '/api/user/profile',
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: {
          name: 'Updated Name'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should get user watchlist', () => {
      cy.request({
        method: 'GET',
        url: '/api/user/watchlist',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('should add to watchlist', () => {
      cy.request({
        method: 'POST',
        url: '/api/user/watchlist',
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: {
          movieId: '123'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('should remove from watchlist', () => {
      cy.request({
        method: 'DELETE',
        url: '/api/user/watchlist/123',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe('Comment Endpoints', () => {
    it('should get movie comments', () => {
      cy.request('/api/comments/movie/123').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('should add comment', () => {
      cy.request({
        method: 'POST',
        url: '/api/comments',
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: {
          movieId: '123',
          text: 'Great movie!'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('should delete comment', () => {
      cy.request({
        method: 'DELETE',
        url: '/api/comments/456',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe('Rating Endpoints', () => {
    it('should get movie ratings', () => {
      cy.request('/api/ratings/movie/123').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('average');
      });
    });

    it('should submit rating', () => {
      cy.request({
        method: 'POST',
        url: '/api/ratings',
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: {
          movieId: '123',
          rating: 4
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for unauthorized requests', () => {
      cy.request({
        method: 'GET',
        url: '/api/user/profile',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should return 404 for non-existent resources', () => {
      cy.request({
        method: 'GET',
        url: '/api/movies/999999',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('should return 400 for invalid requests', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/register',
        body: {
          email: 'invalid-email'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('should return 500 for server errors', () => {
      cy.request({
        method: 'GET',
        url: '/api/error-test',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(500);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', () => {
      const requests = Array(11).fill(null).map(() =>
        cy.request({
          method: 'GET',
          url: '/api/movies/search?q=test',
          failOnStatusCode: false
        })
      );

      cy.wrap(Promise.all(requests)).then((responses: any) => {
        const lastResponse = responses[responses.length - 1];
        expect(lastResponse.status).to.eq(429);
      });
    });
  });
});
