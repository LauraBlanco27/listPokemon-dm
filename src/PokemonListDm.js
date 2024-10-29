import { LitElement, html } from 'lit-element';

export class PokemonListDm extends LitElement {
  

  async fetchPokemon(limit = 100, offset = 0) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      const data = await response.json(); 
      const pokemonList = data.results; 
      this.arrayPokemon = await Promise.all(
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
      this.loading = false;
      return this.arrayPokemon; 
    } catch (error) {
      this.loading = false; 
      return []; 
    }
  }


  async fetchPokemonDetails(pokemonName) {
    try {
      // Cambia la URL para que use el nombre en lugar del ID
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}/`);
      const data = await response.json();
      const pokemonDetails = {
        name: data.name,
        image: data.sprites.front_default,
        types: data.types.map(typeInfo => typeInfo.type.name).join(', '),
      };
  
      // Obtener la URL de la cadena evolutiva usando la especie del Pokémon
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}/`);
      const speciesData = await speciesResponse.json();
      const evolutionChainUrl = speciesData.evolution_chain.url;
  
      // Obtener la cadena evolutiva y extraer las evoluciones con sus imágenes
      const evolutionResponse = await fetch(evolutionChainUrl);
      const evolutionData = await evolutionResponse.json();
      const evolutions = await this.extractEvolutionsWithImages(evolutionData.chain);
  
      return { pokemonDetails, evolutions };
    } catch (error) {
      console.error('Error al obtener detalles del Pokémon:', error);
      return { pokemonDetails: {}, evolutions: [] };
    }
  }

  async extractEvolutionsWithImages(chain) {
    const evolutions = [];
    let current = chain;

    while (current) {
      const evolutionName = current.species.name;
      const evolutionImage = await this.fetchPokemonImage(evolutionName);
      evolutions.push({ name: evolutionName, image: evolutionImage });
      current = current.evolves_to[0];
    }

    return evolutions;
  }

  async fetchPokemonImage(evolutionName) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolutionName}/`);
      const data = await response.json();
      return data.sprites.front_default;
    } catch (error) {
      console.error(`Error al obtener imagen de ${evolutionName}:`, error);
      return '';
    }
  }
}