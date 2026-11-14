/**Pokemon API journey: find Pikachu, follow its form URL, verify its type is electric.
 * Runs as a Checkly Multistep check (matched by *.multistep.spec.ts).
 * 
 * 1. Added await to the three expect(response).toBeOK() lines.
 *    toBeOk returns a promise. Without await a failed status check
 *    wasn't reliably reported and the test carried on
 * 
 * 2. Changed .forms to be .forms[0].url
 *    .forms is a list so the object needs to be selected
 *    before obtaining properties
 * 
 * 3. Changed .type to be .type.name
 *    .type is an object containing both name and url
 *    Follow on comparison could not pass without defining name
 */
import { test, expect } from "@playwright/test"

const baseUrl = "https://pokeapi.co/api/v2/"

test("get favorite pokemon and verify type", async ({ request }) => {
  let favoritePokemon;
  let pokemonFormURL;

  await test.step("get favorite pokemon", async () => {

    const response = await request.get(`${baseUrl}pokemon?limit=50&offset=0`)
    await expect(response).toBeOK()

    const data = await response.json()
    favoritePokemon = data.results.find(pokemon => pokemon.name === "pikachu");
  })

  await test.step("get pokemon form", async () => {
    const response = await request.get(`${favoritePokemon.url}`)
    await expect(response).toBeOK()

    const pokemonForm = await response.json()
    pokemonFormURL = pokemonForm.forms[0].url
  })

  await test.step("verify pokemon type", async () => {
    const response = await request.get(`${pokemonFormURL}`)
    await expect(response).toBeOK()

    const pokemonForm = await response.json()
    const pokemonType = pokemonForm.types[0].type.name
    expect(pokemonType).toBe('electric')
  })
})
