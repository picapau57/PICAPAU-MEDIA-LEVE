import { PlaylistSource } from "../types";

export function generate15SampleMovieLists(): PlaylistSource[] {
  const listsData = [
    {
      num: 1,
      name: "Lista 1: Filmes - Lançamentos",
      group: "FILMES | LANÇAMENTOS",
      movies: [
        { title: "Sintel (Filme Completo 4K)", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sintel_poster.jpg/400px-Sintel_poster.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "Big Buck Bunny HD", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/400px-Big_buck_bunny_poster_big.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "Tears of Steel 1080p", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Tears_of_Steel_poster.jpg/400px-Tears_of_Steel_poster.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "Elephants Dream Sci-Fi", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Elephants_Dream_poster.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
        { title: "For Bigger Blazes (Ação)", logo: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "For Bigger Escapes", logo: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { title: "For Bigger Fun", logo: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
        { title: "For Bigger Joyrides", logo: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
      ]
    },
    {
      num: 2,
      name: "Lista 2: Filmes - Ação & Aventura",
      group: "FILMES | AÇÃO",
      movies: [
        { title: "Operação Resgate Ação 1", logo: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "Caçadores da Tempestade", logo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "Missão Velocidade Total", logo: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" },
        { title: "Guerreiros do Amanhã", logo: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "Comando de Elite HD", logo: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { title: "Emboscada Selvagem", logo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
        { title: "A Árvore da Vida Ação", logo: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      ]
    },
    {
      num: 3,
      name: "Lista 3: Filmes - Comédia",
      group: "FILMES | COMÉDIA",
      movies: [
        { title: "Um Dia de Loucuras", logo: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "Procura-se um Amigo", logo: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
        { title: "Férias Malucas na Praia", logo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
        { title: "O Vizinho Misterioso Comédia", logo: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },
        { title: "Casamento Surpresa", logo: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "A Grande Aposta Cômica", logo: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
      ]
    },
    {
      num: 4,
      name: "Lista 4: Filmes - Animação & Família",
      group: "FILMES | ANIMAÇÃO",
      movies: [
        { title: "O Grande Coelho Animação", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/400px-Big_buck_bunny_poster_big.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "A Lenda da Dragão Sintel", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sintel_poster.jpg/400px-Sintel_poster.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "Mundo dos Insetos 3D", logo: "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
        { title: "As Aventuras no Oceano", logo: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { title: "O Mistério do Castelo Mágico", logo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
        { title: "Amigos da Floresta Encantada", logo: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "Reino dos Brinquedos 4K", logo: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "Pequenos Heróis da Galáxia", logo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
      ]
    },
    {
      num: 5,
      name: "Lista 5: Filmes - Ficção Científica",
      group: "FILMES | FICÇÃO CIENTÍFICA",
      movies: [
        { title: "Tears of Steel (Cyborgs HD)", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Tears_of_Steel_poster.jpg/400px-Tears_of_Steel_poster.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "Elephants Dream (Mundo Surreal)", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Elephants_Dream_poster.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
        { title: "Estação Espacial Alpha", logo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "O Código do Universo", logo: "https://images.unsplash.com/photo-1507499739999-097706ad8914?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { title: "Viagem à Segunda Terra", logo: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "Inteligência Sintética 2050", logo: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },
        { title: "A Fronteira Final Sci-Fi", logo: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      ]
    },
    {
      num: 6,
      name: "Lista 6: Filmes - Drama & Romance",
      group: "FILMES | DRAMA",
      movies: [
        { title: "Promessas ao Pôr do Sol", logo: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "Cartas para o Passado", logo: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "A Melodia do Coração", logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "Caminhos Cruzados Drama", logo: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
        { title: "O Silêncio da Neve", logo: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { title: "Retratos de Uma Vida", logo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
      ]
    },
    {
      num: 7,
      name: "Lista 7: Filmes - Suspense & Terror",
      group: "FILMES | SUSPENSE",
      movies: [
        { title: "A Casa no Fim da Estrada", logo: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "Noite de Névoa Suspense", logo: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },
        { title: "O Enigma do Quarto 13", logo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "Vozes na Escuridão", logo: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
        { title: "Perseguição Cega", logo: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "Sombra Espetral", logo: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      ]
    },
    {
      num: 8,
      name: "Lista 8: Filmes - Documentários",
      group: "FILMES | DOCUMENTÁRIO",
      movies: [
        { title: "Planeta Azul: Profundezas", logo: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "Segredos da Natureza Selvagem", logo: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { title: "Cosmos & As Estrelas", logo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "A Era do Esporte Extremo", logo: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" },
        { title: "História das Grandes Civilizações", logo: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
      ]
    },
    {
      num: 9,
      name: "Lista 9: Filmes - Clássicos do Cinema",
      group: "FILMES | CLÁSSICOS",
      movies: [
        { title: "Luzes da Cidade Clássico", logo: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "A Grande Ilusão 1950", logo: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "O Tesouro Perdido Clássico", logo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "Noites de Ouro Cinema", logo: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
        { title: "O Grande Ditador Clássico", logo: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "Viagem à Lua 1902 HD", logo: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
        { title: "A Odisséia Clássica", logo: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
      ]
    },
    {
      num: 10,
      name: "Lista 10: Filmes - 4K & Especial VIP",
      group: "FILMES | 4K ESPECIAL",
      movies: [
        { title: "Sintel Ultra HD 4K Remaster", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sintel_poster.jpg/400px-Sintel_poster.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "Tears of Steel Sci-Fi 4K", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Tears_of_Steel_poster.jpg/400px-Tears_of_Steel_poster.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "Big Buck Bunny 4K 60fps", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/400px-Big_buck_bunny_poster_big.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "Elephants Dream Cinema 4K", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Elephants_Dream_poster.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
        { title: "For Bigger Blazes 4K HDR", logo: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "For Bigger Escapes 4K Atmos", logo: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { title: "For Bigger Joyrides 4K", logo: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
        { title: "Subaru Motorsport 4K Ultra", logo: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" },
      ]
    },
    {
      num: 11,
      name: "Lista 11: Filmes - Heróis & Quadrinhos",
      group: "FILMES | HERÓIS",
      movies: [
        { title: "O Guardião da Cidade 4K", logo: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "Liga do Amanhã Heróis", logo: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "O Cavaleiro das Sombras", logo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "Desafio Cósmico Heróis", logo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "A Força Suprema 1080p", logo: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { title: "Multiverso em Chamas", logo: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
      ]
    },
    {
      num: 12,
      name: "Lista 12: Filmes - Policial & Crime",
      group: "FILMES | POLICIAL",
      movies: [
        { title: "Dossiê Confidencial Crime", logo: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "Invasão no Distrito 9", logo: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },
        { title: "Negociação de Risco", logo: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "Perseguição Policial Noturna", logo: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "Máfia & Vingança VIP", logo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "Operação Subterrânea", logo: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
        { title: "O Investigador Final", logo: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
      ]
    },
    {
      num: 13,
      name: "Lista 13: Filmes - Fantasia & Magia",
      group: "FILMES | FANTASIA",
      movies: [
        { title: "O Reino dos Dragões", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sintel_poster.jpg/400px-Sintel_poster.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "A Floresta dos Feitiços", logo: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
        { title: "O Portal das Estrelas Magia", logo: "https://images.unsplash.com/photo-1507499739999-097706ad8914?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "A Lenda da Espada Dourada", logo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "Guardiões do Templo Perdido", logo: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "O elixir da Imortalidade", logo: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
      ]
    },
    {
      num: 14,
      name: "Lista 14: Filmes - Música & Shows",
      group: "FILMES | MÚSICA",
      movies: [
        { title: "O Ritmo das Ruas Musical", logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "Sinfonia do Espaço Show 4K", logo: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
        { title: "A Estrela do Rock Filme", logo: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
        { title: "Jazz ao Pôr do Sol", logo: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
        { title: "Nossa Canção Filme Drama", logo: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
      ]
    },
    {
      num: 15,
      name: "Lista 15: Filmes - Velozes & Esportes",
      group: "FILMES | ESPORTES",
      movies: [
        { title: "Subaru Offroad Rally Extreme 4K", logo: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" },
        { title: "Velocidade Máxima Asfalto", logo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
        { title: "Desafio na Montanha Esporte", logo: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        { title: "A Grande Final Campeões", logo: "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
        { title: "Lendas do Surf 4K", logo: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
        { title: "A Corrida do Século", logo: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
      ]
    }
  ];

  return listsData.map((list) => {
    let rawM3U = "#EXTM3U\n";
    list.movies.forEach((m) => {
      rawM3U += `#EXTINF:-1 tvg-logo="${m.logo}" group-title="${list.group}", ${m.title}\n${m.url}\n`;
    });

    return {
      id: `src_list_${list.num}_${Math.random().toString(36).substring(2, 7)}`,
      name: list.name,
      type: "raw",
      content: rawM3U,
      updatedAt: new Date().toISOString(),
      itemCount: list.movies.length,
      active: true,
    };
  });
}

// Backwards compatibility alias
export const generate10SampleMovieLists = generate15SampleMovieLists;

