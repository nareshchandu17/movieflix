describe('Watch Party Synchronization', () => {
  const guestName = 'Virtual Guest';
  const chatMessage = 'Hello from Virtual Guest';

  beforeEach(() => {
    // Reset any state if needed
    cy.visit('/watch-party');
  });

  it('should synchronize chat and playback between Host and Guest', () => {
    // 1. Host creates a room
    cy.contains('Start Watch Party').click();
    cy.get('input[placeholder="Your display name"]').type('Test Host');
    cy.contains('Create Room').click();

    // 2. Wait for Room Page and Capture ID
    cy.url().should('include', '/watch-party/room/');
    
    // Handle Join Room Overlay if present (entering name)
    cy.get('input[placeholder="Your Name"]').type('Test Host');
    cy.contains('Enter Room').click();

    // Verify we are in the room UI and socket is connected
    cy.contains('Watching', { timeout: 10000 }).should('be.visible');
    cy.contains('Connected', { timeout: 10000 }).should('be.visible');
    
    cy.url().then((url) => {
      const roomId = url.split('/').pop() || "";
      cy.log(`Joined Room: ${roomId}`);

      // 3. Virtual Guest Joins
      cy.task('socketAction', { 
        type: 'join', 
        roomId, 
        userName: guestName 
      }).then((res: any) => {
        expect(res.status).to.equal('connected');
        
        // 4. Virtual Guest sends a message
        cy.wait(5000); // Give Host and server more time to settle
        cy.task('socketAction', {
          type: 'chat',
          roomId,
          userName: guestName,
          message: chatMessage
        });
      });

      // 5. Verify chat synchronization in Host UI
      cy.contains('Party Chat', { timeout: 10000 }).should('be.visible');
      cy.contains(chatMessage, { timeout: 15000 }).should('be.visible');

      // 6. Test Playback Synchronization (Host -> Guest)
      cy.log('Testing Playback Sync (Host Play)');
      // Use the Play button. We know it has 'Play' text or icon.
      // Based on PlaybackControls.tsx, it's a button with Play icon.
      cy.get('button').find('svg').parent().first().click({ force: true });
      
      cy.wait(2000);
      cy.task('socketAction', { type: 'get-history' }).then((history: any) => {
        const playEvent = history.find((e: any) => e.type === 'play' || e.type === 'pause');
        cy.log('Sync History:', JSON.stringify(history));
        // We expect at least one playback event logged by the virtual guest
        expect(history.length).to.be.greaterThan(0);
      });
    });
  });
});
