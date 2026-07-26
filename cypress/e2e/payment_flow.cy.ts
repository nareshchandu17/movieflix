describe('Payment Flow', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Subscription Plans', () => {
    it('should display available plans', () => {
      cy.visit('/pricing');
      cy.get('[data-testid="plan-card"]').should('have.length.greaterThan', 0);
    });

    it('should display plan features', () => {
      cy.visit('/pricing');
      cy.get('[data-testid="plan-features"]').should('be.visible');
    });

    it('should compare plans', () => {
      cy.visit('/pricing');
      cy.get('[data-testid="compare-plans"]').click();
      cy.get('[data-testid="comparison-table"]').should('be.visible');
    });
  });

  describe('Checkout Process', () => {
    it('should initiate checkout', () => {
      cy.visit('/pricing');
      cy.get('[data-testid="plan-premium"]').click();
      cy.get('[data-testid="subscribe-button"]').click();
      cy.url().should('include', '/checkout');
    });

    it('should display checkout form', () => {
      cy.visit('/checkout?plan=premium');
      cy.get('[data-testid="checkout-form"]').should('be.visible');
      cy.get('[data-testid="card-number-input"]').should('be.visible');
      cy.get('[data-testid="expiry-input"]').should('be.visible');
      cy.get('[data-testid="cvv-input"]').should('be.visible');
    });

    it('should validate card number', () => {
      cy.visit('/checkout?plan=premium');
      cy.get('[data-testid="card-number-input"]').type('invalid');
      cy.get('[data-testid="submit-payment"]').click();
      cy.contains('Invalid card number').should('be.visible');
    });

    it('should validate expiry date', () => {
      cy.visit('/checkout?plan=premium');
      cy.get('[data-testid="card-number-input"]').type('4242424242424242');
      cy.get('[data-testid="expiry-input"]').type('13/25');
      cy.get('[data-testid="submit-payment"]').click();
      cy.contains('Invalid expiry date').should('be.visible');
    });

    it('should validate CVV', () => {
      cy.visit('/checkout?plan=premium');
      cy.get('[data-testid="card-number-input"]').type('4242424242424242');
      cy.get('[data-testid="expiry-input"]').type('12/25');
      cy.get('[data-testid="cvv-input"]').type('12');
      cy.get('[data-testid="submit-payment"]').click();
      cy.contains('Invalid CVV').should('be.visible');
    });
  });

  describe('Payment Processing', () => {
    it('should process successful payment', () => {
      cy.visit('/checkout?plan=premium');
      cy.get('[data-testid="card-number-input"]').type('4242424242424242');
      cy.get('[data-testid="expiry-input"]').type('12/25');
      cy.get('[data-testid="cvv-input"]').type('123');
      cy.get('[data-testid="submit-payment"]').click();
      cy.contains('Payment successful').should('be.visible');
    });

    it('should handle payment failure', () => {
      cy.visit('/checkout?plan=premium');
      cy.get('[data-testid="card-number-input"]').type('4000000000000002');
      cy.get('[data-testid="expiry-input"]').type('12/25');
      cy.get('[data-testid="cvv-input"]').type('123');
      cy.get('[data-testid="submit-payment"]').click();
      cy.contains('Payment failed').should('be.visible');
    });

    it('should display loading state during payment', () => {
      cy.visit('/checkout?plan=premium');
      cy.get('[data-testid="card-number-input"]').type('4242424242424242');
      cy.get('[data-testid="expiry-input"]').type('12/25');
      cy.get('[data-testid="cvv-input"]').type('123');
      cy.get('[data-testid="submit-payment"]').click();
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
    });
  });

  describe('Post-Payment', () => {
    it('should redirect to success page', () => {
      cy.visit('/checkout?plan=premium');
      cy.get('[data-testid="card-number-input"]').type('4242424242424242');
      cy.get('[data-testid="expiry-input"]').type('12/25');
      cy.get('[data-testid="cvv-input"]').type('123');
      cy.get('[data-testid="submit-payment"]').click();
      cy.url().should('include', '/payment/success');
    });

    it('should update subscription status', () => {
      cy.visit('/checkout?plan=premium');
      cy.get('[data-testid="card-number-input"]').type('4242424242424242');
      cy.get('[data-testid="expiry-input"]').type('12/25');
      cy.get('[data-testid="cvv-input"]').type('123');
      cy.get('[data-testid="submit-payment"]').click();
      cy.visit('/account');
      cy.get('[data-testid="subscription-status"]').should('contain', 'Premium');
    });

    it('should send confirmation email', () => {
      cy.visit('/checkout?plan=premium');
      cy.get('[data-testid="card-number-input"]').type('4242424242424242');
      cy.get('[data-testid="expiry-input"]').type('12/25');
      cy.get('[data-testid="cvv-input"]').type('123');
      cy.get('[data-testid="submit-payment"]').click();
      cy.contains('Confirmation email sent').should('be.visible');
    });
  });

  describe('Webhook Handling', () => {
    it('should handle Razorpay webhook', () => {
      cy.request({
        method: 'POST',
        url: '/api/webhooks/razorpay',
        body: {
          event: 'payment.captured',
          payload: {
            payment_id: 'pay_test123',
            order_id: 'order_test123',
            amount: 99900
          }
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should verify webhook signature', () => {
      cy.request({
        method: 'POST',
        url: '/api/webhooks/razorpay',
        headers: {
          'X-Razorpay-Signature': 'test-signature'
        },
        body: {
          event: 'payment.captured'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe('Refund Process', () => {
    it('should request refund', () => {
      cy.visit('/account/subscription');
      cy.get('[data-testid="request-refund"]').click();
      cy.contains('Refund requested').should('be.visible');
    });

    it('should display refund status', () => {
      cy.visit('/account/subscription');
      cy.get('[data-testid="refund-status"]').should('be.visible');
    });
  });
});
