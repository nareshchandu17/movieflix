describe('User Dashboard', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Dashboard Overview', () => {
    it('should display user dashboard', () => {
      cy.visit('/account');
      cy.get('[data-testid="user-dashboard"]').should('be.visible');
    });

    it('should display user profile information', () => {
      cy.visit('/account');
      cy.get('[data-testid="user-name"]').should('be.visible');
      cy.get('[data-testid="user-email"]').should('be.visible');
    });

    it('should display subscription status', () => {
      cy.visit('/account');
      cy.get('[data-testid="subscription-status"]').should('be.visible');
    });
  });

  describe('Profile Management', () => {
    it('should display profile settings', () => {
      cy.visit('/account/profile');
      cy.get('[data-testid="profile-settings"]').should('be.visible');
    });

    it('should update profile picture', () => {
      cy.visit('/account/profile');
      cy.get('[data-testid="avatar-upload"]').should('be.visible');
      const fixtureFile = 'profile.jpg';
      cy.get('[data-testid="avatar-upload"]').selectFile(fixtureFile);
      cy.get('[data-testid="save-avatar"]').click();
      cy.contains('Profile picture updated').should('be.visible');
    });

    it('should update display name', () => {
      cy.visit('/account/profile');
      cy.get('[data-testid="name-input"]').clear().type('Updated Name');
      cy.get('[data-testid="save-profile"]').click();
      cy.contains('Profile updated successfully').should('be.visible');
    });

    it('should update email', () => {
      cy.visit('/account/profile');
      cy.get('[data-testid="email-input"]').clear().type('newemail@example.com');
      cy.get('[data-testid="save-profile"]').click();
      cy.contains('Verification email sent').should('be.visible');
    });
  });

  describe('Account Settings', () => {
    it('should display account settings', () => {
      cy.visit('/account/settings');
      cy.get('[data-testid="account-settings"]').should('be.visible');
    });

    it('should change password', () => {
      cy.visit('/account/settings');
      cy.get('[data-testid="current-password"]').type('OldPassword123!');
      cy.get('[data-testid="new-password"]').type('NewPassword123!');
      cy.get('[data-testid="confirm-password"]').type('NewPassword123!');
      cy.get('[data-testid="change-password"]').click();
      cy.contains('Password changed successfully').should('be.visible');
    });

    it('should validate password confirmation', () => {
      cy.visit('/account/settings');
      cy.get('[data-testid="current-password"]').type('OldPassword123!');
      cy.get('[data-testid="new-password"]').type('NewPassword123!');
      cy.get('[data-testid="confirm-password"]').type('DifferentPassword123!');
      cy.get('[data-testid="change-password"]').click();
      cy.contains('Passwords do not match').should('be.visible');
    });

    it('should enable two-factor authentication', () => {
      cy.visit('/account/settings');
      cy.get('[data-testid="enable-2fa"]').click();
      cy.get('[data-testid="2fa-qr-code"]').should('be.visible');
    });
  });

  describe('Subscription Management', () => {
    it('should display subscription plans', () => {
      cy.visit('/account/subscription');
      cy.get('[data-testid="subscription-plans"]').should('be.visible');
    });

    it('should upgrade subscription', () => {
      cy.visit('/account/subscription');
      cy.get('[data-testid="plan-premium"]').click();
      cy.get('[data-testid="upgrade-button"]').click();
      cy.url().should('include', '/checkout');
    });

    it('should cancel subscription', () => {
      cy.visit('/account/subscription');
      cy.get('[data-testid="cancel-subscription"]').click();
      cy.contains('Are you sure').should('be.visible');
      cy.get('[data-testid="confirm-cancel"]').click();
      cy.contains('Subscription cancelled').should('be.visible');
    });

    it('should display billing history', () => {
      cy.visit('/account/subscription');
      cy.get('[data-testid="billing-history"]').should('be.visible');
    });
  });

  describe('Notification Preferences', () => {
    it('should display notification settings', () => {
      cy.visit('/account/notifications');
      cy.get('[data-testid="notification-settings"]').should('be.visible');
    });

    it('should enable email notifications', () => {
      cy.visit('/account/notifications');
      cy.get('[data-testid="email-notifications"]').check();
      cy.get('[data-testid="save-notifications"]').click();
      cy.contains('Preferences saved').should('be.visible');
    });

    it('should disable push notifications', () => {
      cy.visit('/account/notifications');
      cy.get('[data-testid="push-notifications"]').uncheck();
      cy.get('[data-testid="save-notifications"]').click();
      cy.contains('Preferences saved').should('be.visible');
    });
  });

  describe('Playback History', () => {
    it('should display watch history', () => {
      cy.visit('/account/history');
      cy.get('[data-testid="watch-history"]').should('be.visible');
    });

    it('should clear watch history', () => {
      cy.visit('/account/history');
      cy.get('[data-testid="clear-history"]').click();
      cy.contains('Are you sure').should('be.visible');
      cy.get('[data-testid="confirm-clear"]').click();
      cy.contains('History cleared').should('be.visible');
    });

    it('should remove specific history item', () => {
      cy.visit('/account/history');
      cy.get('[data-testid="history-item"]').first().find('[data-testid="remove-item"]').click();
      cy.contains('Item removed').should('be.visible');
    });
  });

  describe('Device Management', () => {
    it('should display connected devices', () => {
      cy.visit('/account/devices');
      cy.get('[data-testid="device-list"]').should('be.visible');
    });

    it('should remove device', () => {
      cy.visit('/account/devices');
      cy.get('[data-testid="device-item"]').first().find('[data-testid="remove-device"]').click();
      cy.contains('Device removed').should('be.visible');
    });

    it('should sign out all devices', () => {
      cy.visit('/account/devices');
      cy.get('[data-testid="sign-out-all"]').click();
      cy.contains('Are you sure').should('be.visible');
      cy.get('[data-testid="confirm-signout"]').click();
      cy.contains('All devices signed out').should('be.visible');
    });
  });
});
