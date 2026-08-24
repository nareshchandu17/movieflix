/* eslint-disable @typescript-eslint/no-namespace */
declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
    loginAsAdmin(): Chainable<void>;
  }
}

Cypress.Commands.add('login', () => {
  cy.request('/api/auth/csrf').then((csrfResponse) => {
    cy.request({
      method: 'POST',
      url: '/api/auth/callback/credentials',
      form: true,
      body: {
        email: 'test@example.com',
        password: 'TestPassword123!',
        csrfToken: csrfResponse.body.csrfToken,
        json: 'true'
      }
    });
  });
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.request('/api/auth/csrf').then((csrfResponse) => {
    cy.request({
      method: 'POST',
      url: '/api/auth/callback/credentials',
      form: true,
      body: {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        csrfToken: csrfResponse.body.csrfToken,
        json: 'true'
      }
    }).then(() => {
      window.localStorage.setItem('role', 'admin');
    });
  });
});
