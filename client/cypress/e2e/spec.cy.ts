/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import moment from "moment";

Cypress.Commands.add('logout', () => {
    cy.get('#root > div > div > div > div > div.css-view-175oi2r.r-flex-13awgt0 > div:nth-child(2) > div.css-view-175oi2r.r-bottom-1p0dtai.r-left-1d2f490.r-position-u8s1d.r-right-zchlnj.r-top-ipm5af.r-pointerEvents-12vffkv > div:nth-child(2) > div > div > div > div.css-view-175oi2r.r-flex-13awgt0 > div > div:nth-child(5) > div > div > img').click();
    cy.get('.r-transitionProperty-1i6wzkk > .css-text-1rynq56').click();
    cy.title().should('not.equal', 'Home');
});

Cypress.Commands.add('login', (username:string, motDePasse:string) => {
    cy.get('.r-fontSize-1ra0lkn').contains('Connexion');
    cy.get(':nth-child(3) > .css-textinput-11aywtz').clear(); //On reset les inputs 
    cy.get(':nth-child(4) > .css-textinput-11aywtz').clear(); //On reset les inputs
    cy.get(':nth-child(3) > .css-textinput-11aywtz').type(username);
    cy.get(':nth-child(4) > .css-textinput-11aywtz').type(motDePasse);
    cy.get('.r-touchAction-1otgn73').click();
    cy.title().should('eq', 'Home');
});

Cypress.Commands.add('register', (username:string, motDePasse:string) => {
    cy.get('.r-fontSize-1ra0lkn').contains('Connexion');
    cy.get('.css-text-1rynq56.r-cursor-1loqt21').click();
    cy.get('.r-fontSize-1ra0lkn').contains('Inscription');
    cy.get(':nth-child(3) > .css-textinput-11aywtz').clear(); //On reset les inputs 
    cy.get(':nth-child(4) > .css-textinput-11aywtz').clear(); //On reset les inputs
    cy.get(':nth-child(3) > .css-textinput-11aywtz').type(username);
    cy.get(':nth-child(4) > .css-textinput-11aywtz').type(motDePasse);
    cy.get('.r-touchAction-1otgn73').click();
    cy.title().should('eq', 'Home');
});


describe('Test 1', () => {
    it('Inscription, connexion et creation de partie', () => {
        cy.visit('http://localhost:19006/');

        //Inscription
        cy.get('.css-text-1rynq56.r-cursor-1loqt21').click();
        cy.get('.r-fontSize-1ra0lkn').contains('Inscription');
        cy.get(':nth-child(3) > .css-textinput-11aywtz').type('bat');
        cy.get(':nth-child(4) > .css-textinput-11aywtz').type('man');
        cy.get('.r-touchAction-1otgn73').click();
        cy.title().should('eq', 'Home');

        //Logout
        cy.get('#root > div > div > div > div > div.css-view-175oi2r.r-flex-13awgt0 > div:nth-child(2) > div.css-view-175oi2r.r-bottom-1p0dtai.r-left-1d2f490.r-position-u8s1d.r-right-zchlnj.r-top-ipm5af.r-pointerEvents-12vffkv > div:nth-child(2) > div > div > div > div.css-view-175oi2r.r-flex-13awgt0 > div > div:nth-child(5) > div > div > img').click();
        
        cy.get('.r-transitionProperty-1i6wzkk > .css-text-1rynq56').click();
        cy.title().should('not.equal', 'Home');

        //Connection 
        cy.get('.css-text-1rynq56.r-cursor-1loqt21').click();
        cy.get('.r-fontSize-1ra0lkn').contains('Connexion');
        cy.get(':nth-child(3) > .css-textinput-11aywtz').clear(); //On reset les inputs 
        cy.get(':nth-child(4) > .css-textinput-11aywtz').clear(); //On reset les inputs
        cy.get(':nth-child(3) > .css-textinput-11aywtz').type('bat');
        cy.get(':nth-child(4) > .css-textinput-11aywtz').type('man');
        cy.get('.r-touchAction-1otgn73').click();
        cy.title().should('eq', 'Home');

        //Création d'une partie
        cy.get('.r-backgroundColor-9lim0t').click();
        cy.title().should('eq', 'CreateGame');
        cy.get('#field-3-input').clear().type('2');
        cy.get('#field-24-input').clear().type('2');
        cy.get('.r-WebkitOverflowScrolling-150rngu > :nth-child(1) > .r-backgroundColor-17lboc3 > .r-backgroundColor-9lim0t').click();
        cy.title().should('eq', 'Home');

        cy.get(':nth-child(2) > .css-textHasAncestor-1qaijid').contains('bat'); //Createur de la partie
        // A VOIR //cy.get('.r-backgroundColor-17lboc3 > :nth-child(1) > .r-alignItems-1awozwy').contains('1/20'); //NB joueurs

        // //Nouveau User
        cy.logout('');
        cy.register('ro', 'bin');
        cy.get('.r-alignItems-obd0qt > .r-touchAction-1otgn73 > .r-alignItems-1awozwy > .css-view-175oi2r > .css-text-1rynq56').click(); //Rejoindre la partie
        cy.get('.r-alignItems-obd0qt > .r-touchAction-1otgn73').contains('Quitter'); //Verification du changement
    });
});
