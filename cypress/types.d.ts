declare global {
  interface Window {
    Pusher?: any;
  }
}

declare namespace Cypress {
  interface Chainable {
    task(event: string, arg?: any): Chainable<any>;
  }
}

export {};
