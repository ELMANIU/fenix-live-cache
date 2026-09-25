export default {
async fetch(request, env, ctx) {

const requestURL = new URL(request.url);


// ===============================
// CONFIGURA TUS CANALES AQUÍ
// ===============================

const CHANNELS = {

history:
"https://cablered.iptvperu.tv:1936/cablered/history/playlist.m3u8",

};


// ===============================
// CORS
// ===============================

function cors(response){

response.headers.set(
"Access-Control-Allow-Origin",
"*"
);

response.headers.set(
"Access-Control-Allow-Headers",
"*"
);

return response;

}


// ===============================
// TEST
// ===============================

if(requestURL.pathname === "/"){

return new Response(
"FENIX CACHE ONLINE",
{
status:200
}
);

}


// ===============================
// PLAYLIST
// ejemplo:
// /history.m3u8
// ===============================


let match =
requestURL.pathname.match(
/\/([^\/]+)\.m3u8$/
);


if(match){

let channel = match[1];


if(!CHANNELS[channel]){

return new Response(
"CHANNEL NOT FOUND",
{
status:404
}
);

}


let cache =
caches.default;


let cacheKey =
new Request(request.url);



let cached =
await cache.match(cacheKey);



if(cached){

return cors(cached);

}



let origin =
await fetch(
CHANNELS[channel],
{
headers:{
"User-Agent":
"Mozilla/5.0"
}
}
);



if(!origin.ok){

return new Response(
"ORIGIN ERROR",
{
status:502
}
);

}



let playlist =
await origin.text();



// convertir segmentos relativos

let base =
CHANNELS[channel]
.substring(
0,
CHANNELS[channel].lastIndexOf("/")
+1
);



playlist =
playlist
.split("\n")
.map(line=>{


if(
line &&
!line.startsWith("#")
){

let segment =
line.startsWith("http")
?
line
:
base+line;



return "/segment.ts?url="
+
encodeURIComponent(segment);

}


return line;


})
.join("\n");



let response =
new Response(
playlist,
{
headers:{
"Content-Type":
"application/vnd.apple.mpegurl",

"Cache-Control":
"public,max-age=5"
}
}
);



ctx.waitUntil(
cache.put(
cacheKey,
response.clone()
)
);



return cors(response);



}



// ===============================
// SEGMENTOS TS
// ===============================


if(
requestURL.pathname === "/segment.ts"
){


let source =
requestURL.searchParams.get(
"url"
);



if(!source){

return new Response(
"NO SOURCE",
{
status:400
}
);

}



let ts =
await fetch(
source,
{
headers:{
"User-Agent":
"Mozilla/5.0"
}
}
);



return cors(
new Response(
ts.body,
{
headers:{
"Content-Type":
"video/mp2t",

"Cache-Control":
"no-store"
}
}
)
);


}



return new Response(
"NOT FOUND",
{
status:404
}
);



}
};
