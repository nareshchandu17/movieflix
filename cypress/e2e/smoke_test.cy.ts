describe('MovieFlix Smoke Tests', () => {
  it('should load home page', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('should display hero section', () => {
    cy.visit('/');
    cy.get('body').should('contain.text', 'Movieflix');
  });

  it('should navigate to search page', () => {
    cy.visit('/search');
    cy.url().should('include', '/search');
  });

  it('should navigate to pricing page', () => {
    cy.visit('/pricing');
    cy.url().should('include', '/pricing');
  });

  it('should navigate to watch party page', () => {
    cy.visit('/watch-party');
    cy.url().should('include', '/watch-party');
  });

  it('should handle 404 pages', () => {
    cy.visit('/non-existent-page', { failOnStatusCode: false });
    cy.get('body').should('be.visible');
  });
});
