export default {
async fetch(request) {

const url = new URL(request.url);

const canales = {

history:
"https://cablered.iptvperu.tv:1936/cablered/history/chunks.m3u8"

};


let canal = url.pathname.split("/")[1];


// PLAYLIST

if(url.pathname.endsWith(".m3u8")){


let origen = canales[canal];


if(!origen){
return new Response("Canal no existe",{status:404});
}



let respuesta = await fetch(origen);

let m3u8 = await respuesta.text();



let base = origen.substring(
0,
origen.lastIndexOf("/")
);



let lineas = m3u8.split("\n");



let salida = lineas.map(linea=>{


if(
linea &&
!linea.startsWith("#") &&
linea.includes(".ts")
){

return `/proxy?url=${encodeURIComponent(base+"/"+linea)}`;

}


return linea;


}).join("\n");



return new Response(
salida,
{
headers:{
"Content-Type":"application/vnd.apple.mpegurl",
"Access-Control-Allow-Origin":"*",
"Cache-Control":"no-store"
}
}
);


}



// SEGMENTOS TS

if(url.pathname==="/proxy"){


let destino=url.searchParams.get("url");


if(!destino)
return new Response("sin url",{status:400});



let ts=await fetch(destino);



return new Response(
ts.body,
{
headers:{
"Content-Type":"video/mp2t",
"Access-Control-Allow-Origin":"*",
"Cache-Control":"public,max-age=30"
}
}
);


}



return new Response("FENIX CACHE ONLINE");

}

};
