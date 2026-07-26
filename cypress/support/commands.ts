/* eslint-disable @typescript-eslint/no-namespace */
declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
    loginAsAdmin(): Chainable<void>;
  }
}

Cypress.Commands.add('login', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: 'test@example.com',
      password: 'TestPassword123!'
    }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
  });
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: 'admin@example.com',
      password: 'AdminPassword123!'
    }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('role', 'admin');
  });
});
