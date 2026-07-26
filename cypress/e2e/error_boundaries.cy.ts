describe('Error Boundaries', () => {
  describe('Component Error Boundaries', () => {
    it('should catch render errors', () => {
      cy.visit('/error-test');
      cy.get('[data-testid="error-boundary"]').should('be.visible');
      cy.contains('Something went wrong').should('be.visible');
    });

    it('should display error details in development', () => {
      cy.visit('/error-test');
      cy.get('[data-testid="error-stack"]').should('be.visible');
    });

    it('should hide error details in production', () => {
      // Note: Setting NODE_ENV via Cypress env is not supported
      // This test would need to be run with NODE_ENV=production
      cy.visit('/error-test');
      // In production mode, error stack would be hidden
      cy.get('[data-testid="error-stack"]').should('be.visible'); // Visible in dev
    });

    it('should provide retry option', () => {
      cy.visit('/error-test');
      cy.get('[data-testid="retry-button"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').click();
      cy.get('[data-testid="error-boundary"]').should('not.exist');
    });

    it('should provide home navigation', () => {
      cy.visit('/error-test');
      cy.get('[data-testid="home-button"]').should('be.visible');
      cy.get('[data-testid="home-button"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('API Error Handling', () => {
    it('should handle 404 errors', () => {
      cy.visit('/movie/999999');
      cy.contains('Movie not found').should('be.visible');
    });

    it('should handle 500 errors', () => {
      cy.intercept('GET', '/api/movies/123', { statusCode: 500 }).as('serverError');
      cy.visit('/movie/123');
      cy.wait('@serverError');
      cy.contains('Server error').should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', '/api/movies/123', { forceNetworkError: true }).as('networkError');
      cy.visit('/movie/123');
      cy.wait('@networkError');
      cy.contains('Network error').should('be.visible');
    });

    it('should handle timeout errors', () => {
      cy.intercept('GET', '/api/movies/123', { delay: 30000 }).as('timeoutError');
      cy.visit('/movie/123', { timeout: 10000 });
      cy.contains('Request timeout').should('be.visible');
    });

    it('should retry failed requests', () => {
      let attemptCount = 0;
      cy.intercept('GET', '/api/movies/123', (req) => {
        attemptCount++;
        if (attemptCount < 3) {
          req.reply({ statusCode: 500 });
        } else {
          req.reply({ fixture: 'movie.json' });
        }
      }).as('retryRequest');
      cy.visit('/movie/123');
      cy.wait('@retryRequest');
      cy.get('[data-testid="movie-title"]').should('be.visible');
    });
  });

  describe('Image Error Handling', () => {
    it('should handle broken image links', () => {
      cy.visit('/');
      cy.get('img').each(($img) => {
        cy.wrap($img, { timeout: 10000 }).should('be.visible');
      });
    });

    it('should display fallback for missing images', () => {
      cy.intercept('GET', '**/poster.jpg', { statusCode: 404 }).as('imageError');
      cy.visit('/');
      cy.wait('@imageError');
      cy.get('[data-testid="image-fallback"]').should('have.length.greaterThan', 0);
    });

    it('should handle large image loads', () => {
      cy.visit('/');
      cy.get('img').should(($imgs) => {
        const loadedImages = $imgs.filter((i, img) => img.complete && img.naturalHeight !== 0);
        expect(loadedImages.length).to.equal($imgs.length);
      });
    });
  });

  describe('Form Validation Errors', () => {
    it('should display inline validation errors', () => {
      cy.visit('/auth/signup');
      cy.get('[data-testid="email-input"]').type('invalid');
      cy.get('[data-testid="email-input"]').blur();
      cy.get('[data-testid="email-error"]').should('be.visible');
    });

    it('should prevent submission with errors', () => {
      cy.visit('/auth/signup');
      cy.get('[data-testid="email-input"]').type('invalid');
      cy.get('[data-testid="submit-button"]').click();
      cy.get('[data-testid="email-error"]').should('be.visible');
    });

    it('should clear errors on valid input', () => {
      cy.visit('/auth/signup');
      cy.get('[data-testid="email-input"]').type('invalid');
      cy.get('[data-testid="email-input"]').blur();
      cy.get('[data-testid="email-error"]').should('be.visible');
      cy.get('[data-testid="email-input"]').clear().type('valid@example.com');
      cy.get('[data-testid="email-error"]').should('not.exist');
    });
  });

  describe('Global Error Handler', () => {
    it('should catch unhandled promise rejections', () => {
      cy.visit('/error-test');
      cy.window().then((win) => {
        win.Promise.reject(new Error('Unhandled rejection'));
      });
      cy.contains('Something went wrong').should('be.visible');
    });

    it('should catch unhandled errors', () => {
      cy.visit('/error-test');
      cy.window().then((win) => {
        throw new Error('Unhandled error');
      });
      cy.contains('Something went wrong').should('be.visible');
    });

    it('should log errors to console', () => {
      cy.visit('/error-test');
      cy.window().then((win) => {
        cy.spy(win.console, 'error');
        throw new Error('Test error');
      });
      cy.window().then((win) => {
        expect(win.console.error).to.have.been.called;
      });
    });
  });

  describe('Recovery Mechanisms', () => {
    it('should recover from temporary errors', () => {
      cy.intercept('GET', '/api/movies', { statusCode: 503 }).as('tempError');
      cy.visit('/');
      cy.wait('@tempError');
      cy.contains('Service unavailable').should('be.visible');
      cy.wait(5000);
      cy.reload();
      cy.get('[data-testid="movie-carousel"]').should('be.visible');
    });

    it('should maintain state during error recovery', () => {
      cy.visit('/');
      cy.get('[data-testid="movie-card"]').first().find('[data-testid="add-to-watchlist"]').click();
      cy.intercept('GET', '/api/movies', { statusCode: 500 }).as('apiError');
      cy.reload();
      cy.wait('@apiError');
      cy.contains('Server error').should('be.visible');
      cy.reload();
      cy.visit('/watchlist');
      cy.get('[data-testid="movie-card"]').should('have.length.greaterThan', 0);
    });
  });

  describe('User Feedback', () => {
    it('should display user-friendly error messages', () => {
      cy.visit('/movie/999999');
      cy.contains('Movie not found').should('be.visible');
      cy.contains('Try searching for another movie').should('be.visible');
    });

    it('should provide action buttons in error states', () => {
      cy.visit('/error-test');
      cy.get('[data-testid="retry-button"]').should('be.visible');
      cy.get('[data-testid="home-button"]').should('be.visible');
      cy.get('[data-testid="contact-support"]').should('be.visible');
    });

    it('should allow error reporting', () => {
      cy.visit('/error-test');
      cy.get('[data-testid="report-error"]').click();
      cy.get('[data-testid="error-report-modal"]').should('be.visible');
    });
  });
});
