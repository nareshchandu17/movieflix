describe('WebSocket Connections', () => {
  describe('Pusher Connection', () => {
    it('should initialize Pusher client', () => {
      cy.visit('/watch-party');
      cy.window().then((win) => {
        expect(win.Pusher).to.exist;
      });
    });

    it('should connect to Pusher server', () => {
      cy.visit('/watch-party');
      cy.contains('Connected', { timeout: 10000 }).should('be.visible');
    });

    it('should handle connection errors', () => {
      cy.visit('/watch-party');
      cy.window().then((win) => {
        cy.stub(win.Pusher, 'connect').throws(new Error('Connection failed'));
      });
      cy.contains('Connection failed').should('be.visible');
    });

    it('should reconnect on disconnect', () => {
      cy.visit('/watch-party');
      cy.contains('Connected').should('be.visible');
      cy.window().then((win) => {
        win.Pusher.disconnect();
      });
      cy.contains('Reconnecting', { timeout: 5000 }).should('be.visible');
      cy.contains('Connected', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Channel Subscription', () => {
    it('should subscribe to watch party channel', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        expect(win.Pusher.channels).to.have.property('presence-watch-party-test-room');
      });
    });

    it('should handle subscription success', () => {
      cy.visit('/watch-party/room/test-room');
      cy.contains('Joined room').should('be.visible');
    });

    it('should handle subscription error', () => {
      cy.visit('/watch-party/room/invalid-room');
      cy.contains('Failed to join room').should('be.visible');
    });

    it('should unsubscribe on leave', () => {
      cy.visit('/watch-party/room/test-room');
      cy.contains('Leave Room').click();
      cy.window().then((win) => {
        expect(win.Pusher.channels).to.not.have.property('presence-watch-party-test-room');
      });
    });
  });

  describe('Event Handling', () => {
    it('should receive chat messages', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        win.Pusher.trigger('client-chat-message', {
          user: 'Test User',
          message: 'Hello!'
        });
      });
      cy.contains('Hello!').should('be.visible');
    });

    it('should receive playback events', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        win.Pusher.trigger('client-playback-sync', {
          action: 'play',
          timestamp: 12345
        });
      });
      cy.get('[data-testid="video-player"]').should('have.prop', 'paused', false);
    });

    it('should receive user join events', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        win.Pusher.trigger('pusher:member_added', {
          id: 'user-123',
          info: { name: 'New User' }
        });
      });
      cy.contains('New User joined').should('be.visible');
    });

    it('should receive user leave events', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        win.Pusher.trigger('pusher:member_removed', {
          id: 'user-123'
        });
      });
      cy.contains('User left').should('be.visible');
    });
  });

  describe('Event Broadcasting', () => {
    it('should broadcast chat messages', () => {
      cy.visit('/watch-party/room/test-room');
      cy.get('[data-testid="chat-input"]').type('Test message');
      cy.get('[data-testid="send-chat"]').click();
      cy.window().then((win) => {
        const spy = cy.spy(win.Pusher, 'trigger');
        expect(spy).to.have.been.calledWith('client-chat-message');
      });
    });

    it('should broadcast playback events', () => {
      cy.visit('/watch-party/room/test-room');
      cy.get('[data-testid="play-button"]').click();
      cy.window().then((win) => {
        const spy = cy.spy(win.Pusher, 'trigger');
        expect(spy).to.have.been.calledWith('client-playback-sync');
      });
    });

    it('should handle broadcast errors', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        cy.stub(win.Pusher, 'trigger').throws(new Error('Broadcast failed'));
      });
      cy.get('[data-testid="chat-input"]').type('Test message');
      cy.get('[data-testid="send-chat"]').click();
      cy.contains('Failed to send message').should('be.visible');
    });
  });

  describe('Presence Channels', () => {
    it('should track online users', () => {
      cy.visit('/watch-party/room/test-room');
      cy.get('[data-testid="online-count"]').should('be.visible');
    });

    it('should update user count on join', () => {
      cy.visit('/watch-party/room/test-room');
      const initialCount = cy.get('[data-testid="online-count"]').invoke('text');
      cy.window().then((win) => {
        win.Pusher.trigger('pusher:member_added', { id: 'user-123' });
      });
      cy.get('[data-testid="online-count"]').invoke('text').should('not.equal', initialCount);
    });

    it('should update user count on leave', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        win.Pusher.trigger('pusher:member_added', { id: 'user-123' });
      });
      const initialCount = cy.get('[data-testid="online-count"]').invoke('text');
      cy.window().then((win) => {
        win.Pusher.trigger('pusher:member_removed', { id: 'user-123' });
      });
      cy.get('[data-testid="online-count"]').invoke('text').should('not.equal', initialCount);
    });
  });

  describe('Authentication', () => {
    it('should authenticate with Pusher', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        expect(win.Pusher.config.auth).to.exist;
      });
    });

    it('should handle auth failures', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        cy.stub(win.Pusher, 'authorize').rejects(new Error('Auth failed'));
      });
      cy.contains('Authentication failed').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('should handle high-frequency events', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        for (let i = 0; i < 100; i++) {
          win.Pusher.trigger('client-playback-sync', { action: 'seek', timestamp: i });
        }
      });
      cy.get('[data-testid="video-player"]').should('be.visible');
    });

    it('should debounce rapid events', () => {
      cy.visit('/watch-party/room/test-room');
      cy.window().then((win) => {
        for (let i = 0; i < 10; i++) {
          win.Pusher.trigger('client-chat-message', { message: `Message ${i}` });
        }
      });
      cy.get('[data-testid="chat-messages"]').should('have.length.lessThan', 10);
    });
  });
});
