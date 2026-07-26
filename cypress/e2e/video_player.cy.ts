describe('Video Player', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Player Initialization', () => {
    it('should load video player', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="video-player"]').should('be.visible');
    });

    it('should display video controls', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="play-button"]').should('be.visible');
      cy.get('[data-testid="pause-button"]').should('be.visible');
      cy.get('[data-testid="volume-control"]').should('be.visible');
      cy.get('[data-testid="fullscreen-button"]').should('be.visible');
    });

    it('should display progress bar', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="progress-bar"]').should('be.visible');
    });
  });

  describe('Playback Controls', () => {
    it('should play video', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="play-button"]').click();
      cy.get('[data-testid="video-player"]').should('have.prop', 'paused', false);
    });

    it('should pause video', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="play-button"]').click();
      cy.wait(2000);
      cy.get('[data-testid="pause-button"]').click();
      cy.get('[data-testid="video-player"]').should('have.prop', 'paused', true);
    });

    it('should seek video', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="progress-bar"]').click(50, 0);
      cy.get('[data-testid="current-time"]').should('not.equal', '0:00');
    });

    it('should adjust volume', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="volume-control"]').click(75, 0);
      cy.get('[data-testid="video-player"]').should('have.prop', 'volume').and('be.closeTo', 0.75, 0.1);
    });

    it('should mute video', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="mute-button"]').click();
      cy.get('[data-testid="video-player"]').should('have.prop', 'muted', true);
    });

    it('should enter fullscreen', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="fullscreen-button"]').click();
      cy.document().should('have.prop', 'fullscreenElement').and('not.be.null');
    });
  });

  describe('Quality Settings', () => {
    it('should display quality options', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="quality-button"]').click();
      cy.get('[data-testid="quality-options"]').should('be.visible');
    });

    it('should change video quality', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="quality-button"]').click();
      cy.contains('1080p').click();
      cy.contains('Quality changed to 1080p').should('be.visible');
    });
  });

  describe('Subtitle Support', () => {
    it('should display subtitle options', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="subtitle-button"]').click();
      cy.get('[data-testid="subtitle-options"]').should('be.visible');
    });

    it('should enable subtitles', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="subtitle-button"]').click();
      cy.contains('English').click();
      cy.get('[data-testid="video-player"]').should('have.prop', 'textTracks').and('have.length.greaterThan', 0);
    });
  });

  describe('Picture-in-Picture', () => {
    it('should support PiP mode', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="pip-button"]').click();
      cy.document().should('have.prop', 'pictureInPictureElement').and('not.be.null');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should pause/play with spacebar', () => {
      cy.visit('/movie/123');
      cy.get('body').type(' ');
      cy.get('[data-testid="video-player"]').should('have.prop', 'paused', false);
      cy.get('body').type(' ');
      cy.get('[data-testid="video-player"]').should('have.prop', 'paused', true);
    });

    it('should seek with arrow keys', () => {
      cy.visit('/movie/123');
      cy.get('[data-testid="play-button"]').click();
      cy.get('body').type('{rightarrow}');
      cy.get('[data-testid="current-time"]').should('not.equal', '0:00');
    });

    it('should adjust volume with up/down arrows', () => {
      cy.visit('/movie/123');
      cy.get('body').type('{arrowup}');
      cy.get('[data-testid="video-player"]').should('have.prop', 'volume').and('be.greaterThan', 0);
    });
  });

  describe('Error Handling', () => {
    it('should handle video load errors', () => {
      cy.visit('/movie/invalid');
      cy.get('[data-testid="video-error"]').should('be.visible');
      cy.contains('Unable to load video').should('be.visible');
    });

    it('should display retry button on error', () => {
      cy.visit('/movie/invalid');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should recover from network errors', () => {
      cy.visit('/movie/123');
      cy.intercept('GET', '**/video.mp4', { forceNetworkError: true }).as('networkError');
      cy.get('[data-testid="play-button"]').click();
      cy.wait('@networkError');
      cy.get('[data-testid="video-error"]').should('be.visible');
    });
  });
});
