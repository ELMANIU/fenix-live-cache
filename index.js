export default {
async fetch(request, env, ctx) {


const url = new URL(request.url);


// =======================
// CANALES
// =======================

const canales = {

history:
"https://cablered.iptvperu.tv:1936/cablered/history/chunks.m3u8",

space:
"https://cablered.iptvperu.tv:1936/cablered/space/chunks.m3u8"

};


// =======================
// PEDIR CANAL
// =======================

let canal = url.pathname.split("/")[1];


// =======================
// PLAYLIST M3U8
// =======================


if(url.pathname.endsWith(".m3u8")){


let origen = canales[canal];


if(!origen){

return new Response(
"Canal inexistente",
{status:404}
);

}



let respuesta = await fetch(origen,{
headers:{
"User-Agent":
"Mozilla/5.0"
}
});



let texto = await respuesta.text();




let base =
origen.substring(
0,
origen.lastIndexOf("/")
);



// Convertir segmentos
// sin romper HLS


texto = texto
.split("\n")
.map(linea=>{


if(
linea &&
!linea.startsWith("#")
){


if(linea.startsWith("http"))
return linea;



return base+"/"+linea;


}


return linea;


})
.join("\n");




return new Response(
texto,
{
headers:{


"Content-Type":
"application/vnd.apple.mpegurl",


"Access-Control-Allow-Origin":
"*",


"Cache-Control":
"no-cache,no-store"

}

}
);


}




// =======================
// SEGMENTOS TS
// =======================


if(url.pathname==="/segment"){



let destino =
url.searchParams.get("url");



if(!destino){

return new Response(
"missing url",
{status:400}
);

}



let cache =
caches.default;



let cacheKey =
new Request(destino);



let existe =
await cache.match(cacheKey);



if(existe){

return existe;

}



let origen =
await fetch(destino,{
headers:{
"User-Agent":
"Mozilla/5.0"
}
});



let nuevo =
new Response(
origen.body,
{
headers:{

"Content-Type":
"video/mp2t",

"Access-Control-Allow-Origin":
"*",

"Cache-Control":
"public,max-age=20"

}

}
);



ctx.waitUntil(
cache.put(
cacheKey,
nuevo.clone()
)
);



return nuevo;


}



return new Response(
"FENIX CACHE ONLINE"
);


}

};
