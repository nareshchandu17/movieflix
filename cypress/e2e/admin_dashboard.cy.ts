describe('Admin Dashboard', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  describe('Dashboard Access', () => {
    it('should redirect non-admin users', () => {
      cy.login();
      cy.visit('/admin');
      cy.url().should('include', '/unauthorized');
    });

    it('should allow admin access', () => {
      cy.loginAsAdmin();
      cy.visit('/admin');
      cy.url().should('include', '/admin');
    });

    it('should display admin dashboard', () => {
      cy.visit('/admin');
      cy.get('[data-testid="admin-dashboard"]').should('be.visible');
    });
  });

  describe('User Management', () => {
    it('should display user list', () => {
      cy.visit('/admin/users');
      cy.get('[data-testid="user-table"]').should('be.visible');
    });

    it('should search users', () => {
      cy.visit('/admin/users');
      cy.get('[data-testid="user-search"]').type('test@example.com');
      cy.get('[data-testid="user-row"]').should('have.length.greaterThan', 0);
    });

    it('should view user details', () => {
      cy.visit('/admin/users');
      cy.get('[data-testid="user-row"]').first().click();
      cy.get('[data-testid="user-details"]').should('be.visible');
    });

    it('should ban user', () => {
      cy.visit('/admin/users');
      cy.get('[data-testid="user-row"]').first().find('[data-testid="ban-button"]').click();
      cy.contains('User banned successfully').should('be.visible');
    });

    it('should unban user', () => {
      cy.visit('/admin/users');
      cy.get('[data-testid="user-row"]').first().find('[data-testid="unban-button"]').click();
      cy.contains('User unbanned successfully').should('be.visible');
    });
  });

  describe('Content Management', () => {
    it('should display content list', () => {
      cy.visit('/admin/content');
      cy.get('[data-testid="content-table"]').should('be.visible');
    });

    it('should add new movie', () => {
      cy.visit('/admin/content/add');
      cy.get('[data-testid="movie-form"]').should('be.visible');
      cy.get('[data-testid="title-input"]').type('Test Movie');
      cy.get('[data-testid="submit-button"]').click();
      cy.contains('Movie added successfully').should('be.visible');
    });

    it('should edit movie', () => {
      cy.visit('/admin/content');
      cy.get('[data-testid="content-row"]').first().find('[data-testid="edit-button"]').click();
      cy.get('[data-testid="title-input"]').clear().type('Updated Title');
      cy.get('[data-testid="submit-button"]').click();
      cy.contains('Movie updated successfully').should('be.visible');
    });

    it('should delete movie', () => {
      cy.visit('/admin/content');
      cy.get('[data-testid="content-row"]').first().find('[data-testid="delete-button"]').click();
      cy.contains('Are you sure').should('be.visible');
      cy.get('[data-testid="confirm-delete"]').click();
      cy.contains('Movie deleted successfully').should('be.visible');
    });
  });

  describe('Analytics', () => {
    it('should display user statistics', () => {
      cy.visit('/admin/analytics');
      cy.get('[data-testid="user-stats"]').should('be.visible');
    });

    it('should display viewing statistics', () => {
      cy.visit('/admin/analytics');
      cy.get('[data-testid="viewing-stats"]').should('be.visible');
    });

    it('should display revenue statistics', () => {
      cy.visit('/admin/analytics');
      cy.get('[data-testid="revenue-stats"]').should('be.visible');
    });

    it('should filter by date range', () => {
      cy.visit('/admin/analytics');
      cy.get('[data-testid="date-range-picker"]').should('be.visible');
      cy.get('[data-testid="start-date"]').type('2024-01-01');
      cy.get('[data-testid="end-date"]').type('2024-12-31');
      cy.get('[data-testid="apply-filter"]').click();
      cy.get('[data-testid="analytics-chart"]').should('be.visible');
    });
  });

  describe('Settings', () => {
    it('should display settings page', () => {
      cy.visit('/admin/settings');
      cy.get('[data-testid="admin-settings"]').should('be.visible');
    });

    it('should update site settings', () => {
      cy.visit('/admin/settings');
      cy.get('[data-testid="site-name-input"]').clear().type('MovieFlix Test');
      cy.get('[data-testid="save-settings"]').click();
      cy.contains('Settings saved successfully').should('be.visible');
    });

    it('should manage API keys', () => {
      cy.visit('/admin/settings');
      cy.get('[data-testid="api-keys-section"]').should('be.visible');
    });
  });
});
