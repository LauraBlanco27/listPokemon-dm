import { LitElement } from 'lit-element';

export class PokemonListDm extends LitElement {
  async fetchPokemon(limit = 100, offset = 0) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      const pokemonList = data.results;
      return await Promise.all(
        pokemonList.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          const pokemonDetails = await res.json();
          return {
            name: pokemonDetails.name,
            image: pokemonDetails.sprites.front_default,
            types: pokemonDetails.types.map(typeInfo => typeInfo.type.name).join(', ')
          };
        })
      );
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
      return [];
    }
  }

  async fetchPokemonDetails(pokemonName) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}/`);
      const data = await response.json();
      const pokemonDetails = {
        name: data.name,
        image: data.sprites.front_default,
        types: data.types.map(typeInfo => typeInfo.type.name).join(', '),
      };

      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}/`);
      const speciesData = await speciesResponse.json();
      const evolutionChainUrl = speciesData.evolution_chain.url;

      const evolutionResponse = await fetch(evolutionChainUrl);
      const evolutionData = await evolutionResponse.json();
      const evolutions = await this.extractEvolutionsWithImages(evolutionData.chain);

      return { pokemonDetails, evolutions };
    } catch (error) {
      console.error('Error fetching Pokémon details:', error);
      return { pokemonDetails: {}, evolutions: [] };
    }
  }

  async extractEvolutionsWithImages(chain) {
    const evolutions = [];

    const extractEvolution = async (current) => {
      const evolutionName = current.species.name;
      const evolutionImage = await this.fetchPokemonImage(evolutionName);
      evolutions.push({ name: evolutionName, image: evolutionImage });

      for (const evolution of current.evolves_to) {
        await extractEvolution(evolution);
      }
    };

    await extractEvolution(chain);
    return evolutions;
  }

  async fetchPokemonImage(evolutionName) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolutionName}/`);
      const data = await response.json();
      return data.sprites.front_default;
    } catch (error) {
      console.error(`Error fetching image of ${evolutionName}:`, error);
      return '';
    }
  }
}

window.customElements.define('pokemon-list-dm', PokemonListDm);