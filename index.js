export default {
async fetch(request, env) {

const url = new URL(request.url);

const canales = {

history:
"https://cablered.iptvperu.tv:1936/cablered/history/chunks.m3u8",

space:
"https://cablered.iptvperu.tv:1936/cablered/space/chunks.m3u8",

tnt:
"https://cablered.iptvperu.tv:1936/cablered/tnt/chunks.m3u8",

cinecanal:
"https://cablered.iptvperu.tv:1936/cablered/cinecanal/chunks.m3u8"

};


let canal=url.pathname.split("/")[1];


// =====================
// PLAYLIST PRINCIPAL
// =====================

if(url.pathname.includes(".m3u8")){


let origen = canales[canal];


if(!origen){

return new Response(
"Canal no encontrado",
{status:404}
);

}



let r=await fetch(origen,{
headers:{
"User-Agent":"Mozilla/5.0"
}
});


let texto=await r.text();



// Reescribir TS

let base=origen.substring(
0,
origen.lastIndexOf("/")
);



texto=texto.replace(
/^(?!#)(.*\.ts.*)$/gm,
line=>{

if(line.startsWith("#"))
return line;


return `/proxy?url=${encodeURIComponent(base+"/"+line)}`;

});



return new Response(texto,{
headers:{
"Content-Type":"application/vnd.apple.mpegurl",
"Access-Control-Allow-Origin":"*",
"Cache-Control":"no-cache"
}
});


}


// =====================
// SEGMENTOS TS
// =====================


if(url.pathname.includes("/proxy")){


let destino=url.searchParams.get("url");


if(!destino)
return new Response("no url",{status:400});



let r=await fetch(destino,{
headers:{
"User-Agent":"Mozilla/5.0"
}
});



return new Response(r.body,{
headers:{
"Content-Type":"video/mp2t",
"Access-Control-Allow-Origin":"*",

// CACHE IMPORTANTE
"Cache-Control":
"public,max-age=20"
}

});


}



return new Response(
"Fenix Live Cache OK"
);


}

};
