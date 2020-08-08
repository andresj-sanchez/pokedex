const pokedexModel = (() => {
    const Pokemon = class {
        constructor(id, name, types, sprites, height, weight, moves){
            this.id = id;
            this.name = name;
            this.types = types.map(type => type.type.name);
            this.sprites = sprites;
            this.heightDm = height;
            this.heightMetres = formatNumber(height * 0.1);
            this.heightFeets = formatNumber(height / 3.048);
            this.weightHg = weight;
            this.weightKg = formatNumber(weight / 10);
            this.weightLb = formatNumber(weight / 4.536);
            this.moves = moves.map(move => move.move.name);
        }
    };

    const Pokedex = class {
        constructor(){
            this.pokemonsArray = [];
        }

        async requestPokemons(){
            const apiUri = 'https://pokeapi.co/api/v2/pokemon/';
            const minPokemons = 6;
            const promises = [];
            
            const start = this.pokemonsArray.length;
            const end = start + minPokemons;

            for(let i = (start + 1); i <= end; i++){
                promises.push(axios.get(`${apiUri}${i}`).then(res => res.data));
            }
            const data = await axios.all(promises);
            console.log({data});
            data.forEach(pokemon => {
                const pokemonObj = new Pokemon(pokemon.id, pokemon.name, pokemon.types, pokemon.sprites, pokemon.height, pokemon.weight, pokemon.moves);
                this.pokemonsArray.push(pokemonObj);
            });
            console.log(this.pokemonsArray);
            console.log({start, end});
            return this.pokemonsArray.slice(start, end);
        }

        getPokemon(id){
            const index = this.pokemonsArray.findIndex(pokemon => pokemon.id === id);
            const pokemon = this.pokemonsArray[index];
            console.log({pokemon});
            return pokemon;
        }
    };

    const Search = class{
        constructor(query){
            this.query = query;
        }

        async getResult(){
            const apiUri = 'https://pokeapi.co/api/v2/pokemon/';
            const pokemon = await axios.get(`${apiUri}${this.query}`).then(res => res.data);
            console.log({pokemon});
            const pokemonObj = new Pokemon(pokemon.id, pokemon.name, pokemon.types, pokemon.sprites, pokemon.height, pokemon.weight, pokemon.moves);
            this.pokemon = [];
            this.pokemon.push(pokemonObj);
        }
    }

    const formatNumber = num => Math.round( ( num + Number.EPSILON ) * 100 ) / 100;

    return {
        Pokedex,
        Search
    };
})();

const pokedexView = (() => {
    const elements = {
        buscador: document.getElementById('buscar'),
        buscadorInput: document.getElementById('buscarInput'),
        seccionPokemones: document.getElementById('pokemons'),
        seccionResultados: document.getElementById('resultado'),
        pokemonModal: document.getElementById('pokemon_modal'),
        pokemonModalHeader: document.querySelector('.modal-header'),
        pokemonModalPokemonName: document.getElementById('pokemon-name'),
        pokemonModalCloseButton: document.querySelector('[data-close-button]'),
        pokemonModalBody: document.querySelector('.modal-body'),
        pokemonModalFooter: document.querySelector('.modal-footer'),
        overlay: document.getElementById('overlay'),
        btnCargarPokemones: document.getElementById('cargar-pokemones'),
        btnRegresar: document.getElementById('regresar'),
        loader: document.getElementById('loader'),
        error: document.getElementById('error')
    };
    const createTypeBadges = (types) => {
        if(types.length > 1){
            return `
                <div class="nes-badge is-splited">
                    <span class="is-${types[0]}">${types[0].toUpperCase()}</span>
                    <span class="is-${types[1]}">${types[1].toUpperCase()}</span>
                </div>
            `;
        }else{
            return `
                <div class="nes-badge">
                    <span class="is-${types[0]}">${types[0].toUpperCase()}</span>
                </div>
            `;
        }
    };

    const createImageTag = (sprite, spriteName) => {
        return sprite == null ? '' : `
            <img src="${sprite}" alt="${spriteName}">
        `;
    };

    const self = this;
    return {
        getElements: () => elements,

        getInput: () => elements.buscadorInput.value.trim(),

        renderPokemons(pokemons, parent){
            const markup = pokemons.map(pokemon => `
                <div class="col mb-4">
                    <div class="card nes-container with-title is-rounded">
                    <p class="title">ID-${pokemon.id.toString().padStart(3, '0')}</p>
                    <img src="${pokemon.sprites.front_default}" class="card-img-top mx-auto" alt="${pokemon.name}">
                    <div class="card-body">
                        <h4 class="card-title">${pokemon.name}</h4>

                        ${createTypeBadges(pokemon.types)}

                        <button type="button" class="nes-btn is-${pokemon.types[0]} mt-3" data-id="${pokemon.id}">View stats</button>
                    </div>
                    </div>
                </div>
            `).join('');
            parent.insertAdjacentHTML('beforeend', markup);
        },

        openModal(pokemon){
            console.log({pokemon});
            const principalType = pokemon.types[0];
            let markup = `<hr class="hr-text" data-content="Images">`;

            if(pokemon.sprites.front_default){
                markup += `
                    <div class="nes-container with-title" id="masculino">
                        <p class="title">Male</p>
                        <div class="row">
                            <div class="col-12 col-md nes-container is-rounded with-title is-centered margin">
                            <p class="title">Normal</p>
                            ${createImageTag(pokemon.sprites.front_default, 'front_default')}
                            ${createImageTag(pokemon.sprites.back_default, 'back_default')}
                            </div>
                            <div class="col-12 col-md nes-container is-rounded with-title is-centered">
                            <p class="title">Shiny</p>
                            ${createImageTag(pokemon.sprites.front_shiny, 'front_shiny')}
                            ${createImageTag(pokemon.sprites.back_shiny, 'back_shiny')}
                            </div>
                        </div>
                    </div>
                `;
            }
            if(pokemon.sprites.front_female){
                markup += `
                <div class="nes-container with-title mt-3" id="femenino">
                    <p class="title">Female</p>
                    <div class="row">
                        <div class="col-12 col-md nes-container is-rounded with-title is-centered margin">
                        <p class="title">Normal</p>
                        ${createImageTag(pokemon.sprites.front_female, 'front_female')}
                        ${createImageTag(pokemon.sprites.back_female, 'back_female')}
                        </div>
                        <div class="col-12 col-md nes-container is-rounded with-title is-centered">
                        <p class="title">Shiny</p>
                        ${createImageTag(pokemon.sprites.front_shiny_female, 'front_shiny_female')}
                        ${createImageTag(pokemon.sprites.back_shiny_female, 'back_shiny_female')}
                        </div>
                    </div>
                </div>
                `;
            }
            markup += `
                <hr class="hr-text" data-content="Types">

                ${createTypeBadges(pokemon.types)}

                <hr class="hr-text" data-content="Size and Weight">
                <div class="row mt-3 d-flex justify-content-around">
                    <div class="nes-table-responsive">
                        <table class="nes-table is-bordered is-centered text-center is-${principalType} margin">
                            <thead>
                                <tr>
                                <th>Height</th>
                                <th>Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                </tr>
                                <tr>
                                <td>${pokemon.heightDm}</td>
                                <td>Dm</td>
                                </tr>
                                <tr>
                                <td>${pokemon.heightMetres}</td>
                                <td>M</td>
                                </tr>
                                <tr>
                                <td>${pokemon.heightFeets}</td>
                                <td>Ft</td>
                            </tbody>
                        </table>
                    </div>
                    <div class="nes-table-responsive">
                        <table class="nes-table is-bordered is-centered text-center is-${pokemon.types[1] ? pokemon.types[1] : principalType}">
                            <thead>
                                <tr>
                                <th>Weight</th>
                                <th>Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                <td>${pokemon.weightHg}</td>
                                <td>Hg</td>
                                </tr>
                                <tr>
                                <td>${pokemon.weightKg}</td>
                                <td>Kg</td>
                                </tr>
                                <tr>
                                <td>${pokemon.weightLb}</td>
                                <td>Lb</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <hr class="hr-text" data-content="Movements">
                <table class="table text-center">
                    <thead class="is-${principalType}">
                        <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Movement</th>
                        </tr>
                    </thead>
                    <tbody>
                    ${pokemon.moves.map((move, i) => `
                        <tr>
                        <th scope="row">${i}</th>
                        <td>${move}</td>
                        </tr>
                    `).join('')}
                    </tbody>
                </table>
            `;
            elements.pokemonModalFooter.innerHTML = `
                <button type="button" class="nes-btn is-${principalType} mt-3">Close</button>
            `;
            elements.pokemonModalHeader.style.background = `var(--${principalType})`;
            elements.pokemonModalPokemonName.textContent = pokemon.name;
            elements.pokemonModalBody.innerHTML = markup;
            elements.pokemonModalBody.scrollTop = 0;
            elements.pokemonModal.classList.add('active');
            elements.overlay.classList.add('active');
        },

        // This method closes the modal
        closeModal(){
            elements.pokemonModal.classList.remove('active');
            elements.overlay.classList.remove('active');
        },

        renderLoader(){
            const loader = `
                <div class="loader col-12 col-md-4 d-flex flex-column justify-content-center align-items-center bg-white nes-container is-rounded">
                    <i class="nes-pokeball mb-3"></i>
                    <h3>Loading...</h3>
                </div>
            `;
            elements.loader.insertAdjacentHTML('beforeend', loader);
        },

        clearLoader(){
            const loader = document.querySelector('.loader');
            if (loader) loader.parentElement.removeChild(loader);
        },

        hidePokemonSection(){
            elements.seccionPokemones.classList.add('d-none');
            elements.btnCargarPokemones.classList.add('d-none');
            elements.seccionResultados.classList.remove('d-none');
            elements.btnRegresar.classList.remove('d-none');
            elements.seccionResultados.innerHTML = '';
        },

        showPokemonSection(){
            elements.error.classList.add('d-none');
            elements.seccionResultados.classList.add('d-none');
            elements.btnRegresar.classList.add('d-none');
            elements.seccionPokemones.classList.remove('d-none');
            elements.btnCargarPokemones.classList.remove('d-none');
        },

        showError(){
            elements.error.classList.remove('d-none');
        },

        clearError(){
            elements.error.classList.add('d-none');
        }
    };
})();

const pokedexController = ((pModel, pView) => {
    const elements = pView.getElements();
    const Pokedex = new pModel.Pokedex();
    let search;

    const setupEventListeners = () => {

        elements.buscador.addEventListener('submit', e => {
            e.preventDefault();
            controlSearch();
        });

        elements.seccionPokemones.addEventListener('click', showModal);

        elements.seccionResultados.addEventListener('click', showModal);

        elements.btnCargarPokemones.addEventListener('click', loadPokemons);

        elements.btnRegresar.addEventListener('click', pView.showPokemonSection);

        elements.pokemonModalCloseButton.addEventListener('click', pView.closeModal);

        elements.pokemonModalFooter.addEventListener('click', e => {
            if(e.target.matches('.nes-btn')){
                pView.closeModal();
            }
        });

        elements.overlay.addEventListener('click', pView.closeModal);

    };

    const showModal = e => {
        if(e.target.matches('.nes-btn, .nes-btn i')){
            const id = parseInt(e.target.closest('.nes-btn').dataset.id, 10);
            const pokemon = Pokedex.getPokemon(id);
            if(pokemon == null){
                pView.openModal(search.pokemon[0])
            }else{
                pView.openModal(pokemon);
            }
        }
    };

    const controlSearch = async () => {
        const query = pView.getInput();
        console.log({query});
        search = new pModel.Search(query.toLowerCase());
        try {
            pView.clearError();
            pView.hidePokemonSection();
            pView.renderLoader();
            await search.getResult();
            pView.clearLoader();
            pView.renderPokemons(search.pokemon, elements.seccionResultados);
        } catch (error) {
            pView.clearLoader();
            pView.showError();
        }
    };

    const loadPokemons = async () => {
        try {
            pView.clearError();
            pView.renderLoader();
            window.scrollTo(0,document.body.scrollHeight);
            const pokemons = await Pokedex.requestPokemons();
            pView.clearLoader();
            pView.renderPokemons(pokemons, elements.seccionPokemones);
            // window.scrollTo(0,document.body.scrollHeight);
        } catch (error) {
            console.log('No se pudieron cargar los pokemones');
            pView.showError();
        }
    };
    return{
        init(){
            setupEventListeners();
            loadPokemons();
        }
    }
})(pokedexModel, pokedexView);

pokedexController.init();