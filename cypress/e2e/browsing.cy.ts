describe('Movie Browsing and Discovery', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Home Page', () => {
    it('should display hero section', () => {
      cy.get('[data-testid="hero-section"]').should('be.visible');
    });

    it('should display movie carousels', () => {
      cy.get('[data-testid="movie-carousel"]').should('have.length.greaterThan', 0);
    });

    it('should load movie posters', () => {
      cy.get('img[alt*="movie"]').should('have.length.greaterThan', 0);
    });

    it('should handle image loading errors gracefully', () => {
      cy.visit('/');
      cy.get('img').each(($img) => {
        cy.wrap($img).should('be.visible');
      });
    });
  });

  describe('Categories', () => {
    it('should display category navigation', () => {
      cy.get('[data-testid="category-nav"]').should('be.visible');
    });

    it('should filter movies by category', () => {
      cy.contains('Action').click();
      cy.url().should('include', 'category=action');
      cy.get('[data-testid="movie-card"]').should('have.length.greaterThan', 0);
    });

    it('should display genre-specific content', () => {
      cy.contains('Comedy').click();
      cy.contains('Comedy Movies').should('be.visible');
    });
  });

  describe('Search Functionality', () => {
    it('should display search bar', () => {
      cy.get('[data-testid="search-input"]').should('be.visible');
    });

    it('should perform search query', () => {
      cy.get('[data-testid="search-input"]').type('Inception');
      cy.get('[data-testid="search-button"]').click();
      cy.url().should('include', 'search=Inception');
    });

    it('should display search results', () => {
      cy.get('[data-testid="search-input"]').type('Avatar');
      cy.get('[data-testid="search-button"]').click();
      cy.get('[data-testid="movie-card"]').should('have.length.greaterThan', 0);
    });

    it('should handle empty search results', () => {
      cy.get('[data-testid="search-input"]').type('xyznonexistentmovie123');
      cy.get('[data-testid="search-button"]').click();
      cy.contains('No results found').should('be.visible');
    });

    it('should debounce search input', () => {
      cy.get('[data-testid="search-input"]').type('Test');
      cy.wait(500);
      cy.get('[data-testid="search-input"]').type(' Movie');
      // Should not trigger search immediately
      cy.get('[data-testid="search-results"]').should('not.exist');
    });
  });

  describe('Movie Details', () => {
    it('should navigate to movie details page', () => {
      cy.get('[data-testid="movie-card"]').first().click();
      cy.url().should('include', '/movie/');
    });

    it('should display movie information', () => {
      cy.get('[data-testid="movie-card"]').first().click();
      cy.get('[data-testid="movie-title"]').should('be.visible');
      cy.get('[data-testid="movie-overview"]').should('be.visible');
      cy.get('[data-testid="movie-rating"]').should('be.visible');
    });

    it('should display movie metadata', () => {
      cy.get('[data-testid="movie-card"]').first().click();
      cy.get('[data-testid="release-date"]').should('be.visible');
      cy.get('[data-testid="duration"]').should('be.visible');
      cy.get('[data-testid="genres"]').should('be.visible');
    });

    it('should display cast information', () => {
      cy.get('[data-testid="movie-card"]').first().click();
      cy.get('[data-testid="cast-section"]').should('be.visible');
    });

    it('should display similar movies', () => {
      cy.get('[data-testid="movie-card"]').first().click();
      cy.get('[data-testid="similar-movies"]').should('be.visible');
    });
  });

  describe('Infinite Scrolling', () => {
    it('should load more content on scroll', () => {
      cy.visit('/browse');
      const initialCount = cy.get('[data-testid="movie-card"]').its('length');
      cy.scrollTo('bottom');
      cy.wait(1000);
      cy.get('[data-testid="movie-card"]').its('length').should('be.greaterThan', initialCount);
    });

    it('should show loading indicator during scroll', () => {
      cy.visit('/browse');
      cy.scrollTo('bottom');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
    });
  });

  describe('Lazy Loading', () => {
    it('should lazy load images', () => {
      cy.visit('/');
      cy.get('img[data-src]').should('have.length.greaterThan', 0);
    });

    it('should load images when in viewport', () => {
      cy.visit('/');
      cy.scrollTo('bottom');
      cy.get('img').should(($imgs) => {
        const loadedImages = $imgs.filter((i, img) => img.complete && img.naturalHeight !== 0);
        expect(loadedImages.length).to.be.greaterThan(0);
      });
    });
  });
});
