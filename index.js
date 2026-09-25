export default {
async fetch(request, env, ctx) {

const url = new URL(request.url);

const ORIGIN =
"https://cablered.iptvperu.tv:1936/cablered/history/";


function cors(response){
response.headers.set("Access-Control-Allow-Origin","*");
response.headers.set("Access-Control-Allow-Headers","*");
return response;
}


// HOME TEST

if(url.pathname === "/"){
return new Response(
"FENIX CACHE ONLINE",
{status:200}
);
}


// PLAYLIST PRINCIPAL

if(url.pathname === "/history.m3u8"){

const cacheKey = new Request(request.url);

let cached = await caches.default.match(cacheKey);

if(cached){
return cors(cached);
}


let playlist = await fetch(
ORIGIN+"playlist.m3u8",
{
headers:{
"User-Agent":"Mozilla/5.0"
}
}
);


if(!playlist.ok){
return new Response(
"ORIGIN ERROR",
{status:500}
);
}


let text = await playlist.text();


// cambiar segmentos

text=text.replace(
/(?!#)(.*\.ts.*)/g,
match=>{

if(match.startsWith("http")){
return "/history.ts?url="+encodeURIComponent(match);
}

return "/history.ts?url="+encodeURIComponent(
ORIGIN+match
);

}
);


let response=new Response(
text,
{
headers:{
"Content-Type":"application/vnd.apple.mpegurl",
"Cache-Control":"public,max-age=5"
}
}
);


ctx.waitUntil(
caches.default.put(
cacheKey,
response.clone()
)
);


return cors(response);

}



// SEGMENTOS TS


if(url.pathname === "/history.ts"){

const source=url.searchParams.get("url");


if(!source){
return new Response(
"NO URL",
{status:400}
);
}


let response=await fetch(
source,
{
headers:{
"User-Agent":"Mozilla/5.0",
"Referer":""
}
}
);


return cors(
new Response(
response.body,
{
headers:{
"Content-Type":"video/mp2t",
"Cache-Control":"no-store"
}
}
)
);

}



return new Response(
"NOT FOUND",
{status:404}
);


}
};
