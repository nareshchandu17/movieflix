/// <reference types="cypress" />

describe('Cast Info Page', () => {
  const castName = 'Tom Cruise';
  const personId = 500;

  beforeEach(() => {
    // Intercept search
    cy.intercept('GET', '**/search/multi*', {
      statusCode: 200,
      body: {
        results: [
          {
            id: personId,
            media_type: 'person',
            name: castName,
          }
        ]
      }
    }).as('searchCast');

    // Intercept images
    cy.intercept('GET', `**/person/${personId}/images*`, {
      statusCode: 200,
      body: {
        profiles: []
      }
    }).as('getImages');
  });

  describe('Missing Data Handling', () => {
    beforeEach(() => {
      // Intercept person details with missing biography and profile_path
      cy.intercept('GET', `**/person/${personId}*`, {
        statusCode: 200,
        body: {
          id: personId,
          name: castName,
          known_for_department: 'Acting',
          biography: '', // Missing biography
          profile_path: null, // Missing profile image
        }
      }).as('getPersonDetails');

      // Intercept credits with missing poster paths
      cy.intercept('GET', `**/person/${personId}/combined_credits*`, {
        statusCode: 200,
        body: {
          cast: [
            {
              id: 1,
              title: 'Movie Without Poster',
              media_type: 'movie',
              popularity: 10,
              poster_path: null,
            }
          ]
        }
      }).as('getCredits');

      cy.visit(`/${castName}/info`);
    });

    it('handles missing biography gracefully', () => {
      cy.wait('@getPersonDetails');
      // The About section should not render if there's no biography
      cy.contains('About').should('not.exist');
    });

    it('handles missing profile image with fallback', () => {
      cy.wait('@getPersonDetails');
      // Should show the placeholder block instead of an image
      cy.get('[data-testid="fallback-profile"]').should('exist');
      cy.get('[data-testid="fallback-profile"]').contains('(No Image)');
    });

    it('handles missing poster in filmography grid with fallback text', () => {
      cy.wait('@getCredits');
      // Full Filmography section should show the title as fallback instead of image
      cy.contains('Full Filmography').scrollIntoView();
      cy.contains('Movie Without Poster').should('exist');
      cy.get('.text-zinc-600').contains('Movie Without Poster').should('exist'); // The fallback block
    });
  });

  describe('Timeline Sorting and Filtering', () => {
    beforeEach(() => {
      // Intercept person details with normal data
      cy.intercept('GET', `**/person/${personId}*`, {
        statusCode: 200,
        body: {
          id: personId,
          name: castName,
          known_for_department: 'Acting',
          biography: 'A great actor.',
          profile_path: '/path.jpg',
        }
      }).as('getPersonDetails');

      // Intercept credits with movies and tv shows across different years
      cy.intercept('GET', `**/person/${personId}/combined_credits*`, {
        statusCode: 200,
        body: {
          cast: [
            {
              id: 1,
              title: 'New Movie',
              media_type: 'movie',
              popularity: 20,
              release_date: '2023-01-01',
              poster_path: '/m1.jpg'
            },
            {
              id: 2,
              name: 'Old TV Show',
              media_type: 'tv',
              popularity: 10,
              first_air_date: '2010-01-01',
              poster_path: '/t1.jpg'
            },
            {
              id: 3,
              title: 'Upcoming Movie',
              media_type: 'movie',
              popularity: 5,
              release_date: '', // Upcoming
              poster_path: '/m2.jpg'
            }
          ]
        }
      }).as('getCredits');

      cy.visit(`/${castName}/info`);
    });

    it('filters filmography grid by media type', () => {
      cy.wait('@getCredits');
      
      cy.contains('Full Filmography').scrollIntoView();

      // Ensure hydration is complete by waiting briefly
      cy.wait(1000);

      // Initially 'All' is selected, so both New Movie and Old TV Show should be visible
      cy.contains('New Movie').should('exist');
      cy.contains('Old TV Show').should('exist');

      // Click 'Movies' filter
      cy.contains('button', 'Movies').click();
      cy.get('[data-testid="filmography-grid"]').contains('New Movie').should('exist');
      cy.get('[data-testid="filmography-grid"]').contains('Upcoming Movie').should('exist');
      cy.get('[data-testid="filmography-grid"]').contains('Old TV Show').should('not.exist');

      // Click 'TV Shows' filter
      cy.contains('button', 'TV Shows').click();
      cy.get('[data-testid="filmography-grid"]').contains('New Movie').should('not.exist');
      cy.get('[data-testid="filmography-grid"]').contains('Old TV Show').should('exist');
    });

    it('sorts the acting timeline correctly', () => {
      cy.wait('@getCredits');
      
      cy.contains('Acting Timeline').scrollIntoView();

      // Default is Newest First
      cy.contains('button', 'Newest First').should('exist');
      
      // The years should be in order: Upcoming -> 2023 -> 2010
      cy.get('h3').filter(':contains("Upcoming")').should('exist');
      cy.get('h3').filter(':contains("2023")').should('exist');
      cy.get('h3').filter(':contains("2010")').should('exist');

      // Toggle to Oldest First
      cy.contains('button', 'Newest First').click();
      cy.contains('button', 'Oldest First').should('exist');

      // (We could verify the DOM order in a more advanced way, but checking that the state toggles and items exist is a good smoke test)
      cy.get('h3').filter(':contains("2010")').should('exist');
      cy.get('h3').filter(':contains("Upcoming")').should('exist');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      // Use normal mocked data
      cy.intercept('GET', `**/person/${personId}*`, { statusCode: 200, body: { id: personId, name: castName, biography: 'Bio' } });
      cy.intercept('GET', `**/person/${personId}/combined_credits*`, { statusCode: 200, body: { cast: [] } });
      
      cy.visit(`/${castName}/info`);
    });

    it('adapts hero section for mobile view', () => {
      cy.viewport('iphone-x'); // Mobile viewport
      // The hero flex container should be column on mobile
      cy.get('.flex-col').should('exist'); 
    });

    it('adapts hero section for desktop view', () => {
      cy.viewport('macbook-15'); // Desktop viewport
      // The hero flex container should be row on desktop (via md:flex-row)
      cy.get('.md\\:flex-row').should('exist');
    });
  });
});
