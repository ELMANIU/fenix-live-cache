export default {
async fetch(request, env, ctx) {

const url = new URL(request.url);

const ORIGIN =
"https://cablered.iptvperu.tv:1936/cablered/history/playlist.m3u8";


// prueba

if(url.pathname === "/"){

return new Response(
"FENIX CACHE ONLINE",
{
headers:{
"content-type":"text/plain"
}
}
);

}


// playlist

if(url.pathname === "/history.m3u8"){


const response =
await fetch(
ORIGIN,
{
headers:{
"User-Agent":"Mozilla/5.0"
}
}
);


if(!response.ok){

return new Response(
"ERROR ORIGIN "+response.status,
{
status:500
}
);

}



let text =
await response.text();



return new Response(
text,
{
headers:{
"content-type":
"application/vnd.apple.mpegurl",

"Access-Control-Allow-Origin":"*"
}
}
);


}



return new Response(
"NOT FOUND",
{
status:404
}
);



}
}
