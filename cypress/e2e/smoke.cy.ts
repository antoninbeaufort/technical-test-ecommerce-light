import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    // cy.cleanupUser();
  });

  it("should display products", () => {
    cy.visitAndCheck("/");
    cy.get(".cypress-product").should("have.length", 3);

    cy.visitAndCheck("/produits/t-shirt-simple");
    cy.visitAndCheck("/produits/t-shirt-a-motif-montagnes");
    cy.visitAndCheck("/produits/t-shirt-a-motif-points");
  });

  it("should allow to pick color, size and quantity", () => {
    cy.visitAndCheck("/produits/t-shirt-simple");
    cy.findByRole("radio", { name: "Blanc" }).click();
    cy.findByRole("radio", { name: "L" }).click();
    cy.findByRole("button", { name: /ajouter au panier/i }).click();
    cy.findByLabelText(/quantité/i).select("3");
    cy.get("#cart-count").should("contain", "3");
  });

  it("should allow you to add a product to cart", () => {
    cy.visitAndCheck("/produits/t-shirt-simple");
    cy.findByRole("button", { name: /ajouter au panier/i }).click();
    cy.get("#cart-count").should("contain", "1");
  });

  it("should allow you to go to checkout", () => {
    cy.visitAndCheck("/produits/t-shirt-simple");
    cy.findByRole("button", { name: /ajouter au panier/i }).click();
    cy.get("[href='/panier']").click();
    cy.findByRole("button", { name: /procéder au paiement/i }).click();
    cy.location("pathname").should("eq", "/commander");
  });

  it("should allow you to checkout and display confirmation page", () => {
    cy.visitAndCheck("/produits/t-shirt-simple");
    cy.findByRole("button", { name: /ajouter au panier/i }).click();
    cy.get("[href='/panier']").click();
    cy.findByRole("button", { name: /procéder au paiement/i }).click();
    cy.location("pathname").should("eq", "/commander");
    // fill form
    cy.get(".cypress-checkout-form").within(($form) => {
      cy.findAllByLabelText(/^Adresse e-mail$/i)
        .first()
        .type(`${faker.internet.userName()}@example.com`);
    });
    cy.findByLabelText(/Prénom/i).type(faker.name.firstName());
    cy.findAllByLabelText(/^Nom$/i).first().type(faker.name.lastName());
    cy.findByLabelText(/Entreprise/i).type(faker.company.name());
    cy.findByLabelText(/^Adresse$/i).type(faker.address.streetAddress());
    cy.findByLabelText(/Résidence/i).type(faker.address.secondaryAddress());
    cy.findByLabelText(/Code postal/i).type(faker.address.zipCode());
    cy.findByLabelText(/Ville/i).type(faker.address.city());
    cy.findByLabelText(/Téléphone/i).type(faker.phone.number());
    cy.findByLabelText(/Numéro de carte/i).type(
      faker.random.numeric(
        faker.datatype.number({
          min: 10,
          max: 19,
        })
      )
    );
    cy.findAllByLabelText(/^Nom$/i).eq(1).type(faker.name.fullName());
    cy.findByLabelText(/Date d'expiration/i).type(
      faker.date
        .future()
        .toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
        .slice(-5)
    );
    cy.findByLabelText(/CVC/i).type(faker.finance.creditCardCVV());

    cy.findByRole("button", { name: /confirmer la commande/i }).click();
    cy.location("pathname").should("contains", "confirmation-de-commande");
  });

  it("should allow you checkout and simulate an error", () => {
    cy.visitAndCheck("/produits/t-shirt-simple");
    cy.findByRole("button", { name: /ajouter au panier/i }).click();
    cy.get("[href='/panier']").click();
    cy.findByRole("button", { name: /procéder au paiement/i }).click();
    cy.location("pathname").should("eq", "/commander");
    // fill form
    cy.get(".cypress-checkout-form").within(($form) => {
      cy.findAllByLabelText(/^Adresse e-mail$/i)
        .first()
        .type(`${faker.internet.userName()}@example.com`);
    });
    cy.findByLabelText(/Prénom/i).type(faker.name.firstName());
    cy.findAllByLabelText(/^Nom$/i).first().type(faker.name.lastName());
    cy.findByLabelText(/Entreprise/i).type(faker.company.name());
    cy.findByLabelText(/^Adresse$/i).type(faker.address.streetAddress());
    cy.findByLabelText(/Résidence/i).type(faker.address.secondaryAddress());
    cy.findByLabelText(/Code postal/i).type(faker.address.zipCode());
    cy.findByLabelText(/Ville/i).type(faker.address.city());
    cy.findByLabelText(/Téléphone/i).type(faker.phone.number());
    cy.findByLabelText(/Numéro de carte/i).type(
      faker.random.numeric(
        faker.datatype.number({
          min: 10,
          max: 19,
        })
      )
    );
    cy.findAllByLabelText(/^Nom$/i).eq(1).type(faker.name.fullName());
    cy.findByLabelText(/Date d'expiration/i).type(
      faker.date
        .future()
        .toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
        .slice(-5)
    );
    cy.findByLabelText(/CVC/i).type(faker.finance.creditCardCVV());

    cy.findByRole("switch", { name: /simuler une erreur/i }).click();
    cy.findByRole("button", { name: /confirmer la commande/i }).click();
    cy.findAllByText(/erreur/i).should("exist");
  });
});
