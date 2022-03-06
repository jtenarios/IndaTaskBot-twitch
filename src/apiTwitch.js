//import fetch from 'node-fetch'
const fetch = require('node-fetch');

async function getToken() {
    // Para obtener un token de la API de Twitch
    const body = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'client_credentials'
    };

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();

    console.log(data);
    console.log(data.access_token);

    return data.access_token
}

// Para avatar (Thumbnail) de un usuario Twitch a través de la API
//export async function getAvatar(profileName) {
/*     export async function getAvatar(profileName) {
    const apiToken = await getToken();
    const responseAvatar = await fetch('https://api.twitch.tv/helix/users?id=141981764', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + apiToken,
            'Client-ID': '2if94w92tsd1r9u4j08o8s1cn6kc24',

        }
    })
    const dataAvatar = await responseAvatar.json();

    console.log('dataAvatar', dataAvatar.data[0].profile_image_url);
    return dataAvatar.data[0].profile_image_url; 
}*/

// Search Channels by query
// https://dev.twitch.tv/docs/api/reference#search-channels
export async function getAvatar(profileName) {
    const apiToken = await getToken();
    // first= indica el nº de registros a extaer , máximo 100
    // Obteniendo 1 parece que busca por el nombre más parecido
    const getData = await fetch(`https://api.twitch.tv/helix/search/channels?query=${profileName}&first=1`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + apiToken,
            'Client-ID': '2if94w92tsd1r9u4j08o8s1cn6kc24',            

        }
    })
    const resultData = await getData.json();
    console.log('resultData', resultData);
    return resultData.data[0].thumbnail_url;

    // Aqui en resultData tenemos todos los nombres que empienzan por el nombre de usuario
    // el primero debe coincidir exactament con el que buscamos
    //console.log('resultData', resultData);

    //let miPerfil = resultData.data.find(x => x.display_name == profileName.toLowerCase());
    //console.log(miPerfil);
    //return miPerfil;
}

//getToken => getUserIdbyName => getAvatar
//getToken => getUserList (in the chat) => getAvatar (searching by name)