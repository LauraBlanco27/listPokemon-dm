import { LitElement } from 'lit-element';

export class ListPokemonDm extends LitElement {
  
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
    } catch (error) {
      console.error('Error al obtener los Pokémon:', error);
      this.loading = false; 
    }
  }

  
}
