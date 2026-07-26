describe('Authentication Flow', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('User Registration', () => {
    it('should navigate to registration page', () => {
      cy.visit('/');
      cy.contains('Sign Up').click();
      cy.url().should('include', '/auth/signup');
    });

    it('should display registration form', () => {
      cy.visit('/auth/signup');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('input[type="text"]').should('be.visible');
      cy.contains('Sign Up').should('be.visible');
    });

    it('should validate email format', () => {
      cy.visit('/auth/signup');
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="password"]').type('TestPassword123!');
      cy.get('input[type="text"]').type('Test User');
      cy.contains('Sign Up').click();
      cy.contains('Invalid email').should('be.visible');
    });

    it('should validate password strength', () => {
      cy.visit('/auth/signup');
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('weak');
      cy.get('input[type="text"]').type('Test User');
      cy.contains('Sign Up').click();
      cy.contains('Password must be at least 8 characters').should('be.visible');
    });
  });

  describe('OAuth Authentication', () => {
    it('should display Google OAuth button', () => {
      cy.visit('/auth/login');
      cy.contains('Continue with Google').should('be.visible');
    });

    it('should handle OAuth redirect', () => {
      cy.visit('/auth/login');
      cy.contains('Continue with Google').click();
      // OAuth will redirect to Google - we can't test full flow without real credentials
      cy.url().should('include', 'accounts.google.com');
    });
  });

  describe('Login Flow', () => {
    it('should display login form', () => {
      cy.visit('/auth/login');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.contains('Sign In').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/auth/login');
      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.contains('Sign In').click();
      cy.contains('Invalid credentials').should('be.visible');
    });

    it('should redirect to dashboard after successful login', () => {
      cy.visit('/auth/login');
      // This would need real credentials or mocked auth
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password);
      cy.contains('Sign In').click();
      // Should redirect to home or dashboard
      cy.url().should('not.include', '/auth/login');
    });
  });

  describe('JWT Token Handling', () => {
    it('should store JWT token in cookies after login', () => {
      cy.visit('/auth/login');
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password);
      cy.contains('Sign In').click();
      cy.getCookies().should('have.length.greaterThan', 0);
    });

    it('should include JWT in API requests', () => {
      cy.login(); // Custom command
      cy.request('/api/user/profile').its('status').should('eq', 200);
    });
  });

  describe('Profile Selection', () => {
    it('should display profile selection if multiple profiles exist', () => {
      cy.login();
      cy.visit('/');
      // Check if profile selection modal appears
      cy.get('[data-testid="profile-selection"]').should('be.visible');
    });

    it('should allow creating new profile', () => {
      cy.login();
      cy.visit('/account/profiles');
      cy.contains('Add Profile').click();
      cy.get('input[placeholder="Profile Name"]').type('Kids Profile');
      cy.contains('Create').click();
      cy.contains('Kids Profile').should('be.visible');
    });

    it('should switch between profiles', () => {
      cy.login();
      cy.visit('/');
      cy.get('[data-testid="profile-card"]').first().click();
      cy.url().should('not.include', '/profiles');
    });
  });

  describe('Session Management', () => {
    it('should maintain session across page refreshes', () => {
      cy.login();
      cy.visit('/');
      cy.reload();
      cy.url().should('not.include', '/auth/login');
    });

    it('should logout successfully', () => {
      cy.login();
      cy.visit('/');
      cy.contains('Sign Out').click();
      cy.url().should('include', '/auth/login');
    });

    it('should clear session data on logout', () => {
      cy.login();
      cy.visit('/');
      cy.contains('Sign Out').click();
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit('/account');
      cy.url().should('include', '/auth/login');
    });
  });
});
