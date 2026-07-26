describe('User Features', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Watchlist', () => {
    it('should add movie to watchlist', () => {
      cy.visit('/');
      cy.get('[data-testid="movie-card"]').first().find('[data-testid="add-to-watchlist"]').click();
      cy.contains('Added to watchlist').should('be.visible');
    });

    it('should display watchlist page', () => {
      cy.visit('/watchlist');
      cy.get('[data-testid="watchlist-container"]').should('be.visible');
    });

    it('should remove movie from watchlist', () => {
      cy.visit('/watchlist');
      cy.get('[data-testid="movie-card"]').first().find('[data-testid="remove-from-watchlist"]').click();
      cy.contains('Removed from watchlist').should('be.visible');
    });

    it('should persist watchlist across sessions', () => {
      cy.visit('/');
      cy.get('[data-testid="movie-card"]').first().find('[data-testid="add-to-watchlist"]').click();
      cy.reload();
      cy.visit('/watchlist');
      cy.get('[data-testid="movie-card"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Favorites', () => {
    it('should add movie to favorites', () => {
      cy.visit('/');
      cy.get('[data-testid="movie-card"]').first().find('[data-testid="add-to-favorites"]').click();
      cy.contains('Added to favorites').should('be.visible');
    });

    it('should display favorites page', () => {
      cy.visit('/favorites');
      cy.get('[data-testid="favorites-container"]').should('be.visible');
    });

    it('should remove movie from favorites', () => {
      cy.visit('/favorites');
      cy.get('[data-testid="movie-card"]').first().find('[data-testid="remove-from-favorites"]').click();
      cy.contains('Removed from favorites').should('be.visible');
    });
  });

  describe('Continue Watching', () => {
    it('should display continue watching section', () => {
      cy.visit('/');
      cy.get('[data-testid="continue-watching"]').should('be.visible');
    });

    it('should resume from last watched position', () => {
      cy.visit('/');
      cy.get('[data-testid="continue-watching"]').find('[data-testid="movie-card"]').first().click();
      cy.get('[data-testid="video-player"]').should('be.visible');
      // Check if video starts from saved position
      cy.get('[data-testid="current-time"]').should('not.equal', '0:00');
    });

    it('should update continue watching after watching', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="video-player"]').should('be.visible');
      cy.wait(5000); // Watch for 5 seconds
      cy.visit('/');
      cy.get('[data-testid="continue-watching"]').should('be.visible');
    });
  });

  describe('Comments', () => {
    it('should display comments section', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="comments-section"]').should('be.visible');
    });

    it('should allow adding comments', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="comment-input"]').type('Great movie!');
      cy.get('[data-testid="submit-comment"]').click();
      cy.contains('Great movie!').should('be.visible');
    });

    it('should display existing comments', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="comment-item"]').should('have.length.greaterThan', 0);
    });

    it('should validate comment input', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="comment-input"]').type('a');
      cy.get('[data-testid="submit-comment"]').click();
      cy.contains('Comment must be at least').should('be.visible');
    });
  });

  describe('Ratings', () => {
    it('should display rating stars', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="rating-stars"]').should('be.visible');
    });

    it('should allow rating movies', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="rating-star"]').eq(3).click();
      cy.contains('Rating submitted').should('be.visible');
    });

    it('should display average rating', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="average-rating"]').should('be.visible');
    });

    it('should update rating on re-rate', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="rating-star"]').eq(4).click();
      cy.get('[data-testid="rating-star"]').eq(5).click();
      cy.contains('Rating updated').should('be.visible');
    });
  });

  describe('Notifications', () => {
    it('should display notification bell', () => {
      cy.visit('/');
      cy.get('[data-testid="notification-bell"]').should('be.visible');
    });

    it('should show notification dropdown', () => {
      cy.visit('/');
      cy.get('[data-testid="notification-bell"]').click();
      cy.get('[data-testid="notification-dropdown"]').should('be.visible');
    });

    it('should display unread count', () => {
      cy.visit('/');
      cy.get('[data-testid="notification-count"]').should('be.visible');
    });

    it('should mark notifications as read', () => {
      cy.visit('/');
      cy.get('[data-testid="notification-bell"]').click();
      cy.get('[data-testid="notification-item"]').first().click();
      cy.get('[data-testid="notification-count"]').should('not.exist');
    });
  });
});
