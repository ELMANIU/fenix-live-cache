export default {
async fetch(request) {

const url = new URL(request.url);


/*
===========================
 CANALES
===========================
*/

const canales = {

history:
"https://cablered.iptvperu.tv:1936/cablered/history/playlist.m3u8"

};


/*
===========================
 PROXY
===========================
*/

if(url.pathname === "/proxy") {


let target = url.searchParams.get("url");


if(!target){

return new Response(
"URL faltante",
{
status:400
}
);

}



let cache = caches.default;

let cacheKey = new Request(target);



/*
 CACHE SEGMENTOS
*/

let cached = await cache.match(cacheKey);


if(cached){

return cached;

}




let response = await fetch(target,{

headers:{

"User-Agent":
"Mozilla/5.0",

"Referer":
"https://cablered.iptvperu.tv/"

}

});




let headers = new Headers(response.headers);



headers.set(
"Access-Control-Allow-Origin",
"*"
);





let type =
headers.get("content-type") || "";





/*
===========================
 PLAYLIST M3U8
===========================
*/


if(type.includes("mpegurl")
|| target.includes(".m3u8")){


let text =
await response.text();



let base =
target.substring(
0,
target.lastIndexOf("/") + 1
);





text =
text.replace(
/(?!#)([^\s]+\.m3u8[^\s]*)/g,

(match)=>{


let full =
match.startsWith("http")
?
match
:
base + match;



return "/proxy?url=" +
encodeURIComponent(full);


}

);





text =
text.replace(
/(?!#)([^\s]+\.ts[^\s]*)/g,

(match)=>{


let full =
match.startsWith("http")
?
match
:
base + match;



return "/proxy?url=" +
encodeURIComponent(full);


}

);





headers.set(
"content-type",
"application/vnd.apple.mpegurl"
);


headers.set(
"cache-control",
"no-cache,no-store"
);




return new Response(
text,
{
status:200,
headers
}
);



}





/*
===========================
 SEGMENTOS TS
===========================
*/



headers.set(
"content-type",
"video/mp2t"
);


headers.set(
"cache-control",
"public,max-age=60,s-maxage=60"
);



headers.delete(
"content-length"
);




let tsResponse =
new Response(
response.body,
{
status:response.status,
headers
}
);



await cache.put(
cacheKey,
tsResponse.clone()
);



return tsResponse;



}




/*
===========================
 CANAL DIRECTO
===========================
*/


let canal =
url.pathname
.replace("/","");



if(canales[canal]){


let response =
await fetch(
canales[canal],
{

headers:{

"User-Agent":
"Mozilla/5.0",

"Referer":
"https://cablered.iptvperu.tv/"

}

}
);



let text =
await response.text();




let base =
canales[canal]
.substring(
0,
canales[canal].lastIndexOf("/") + 1
);




text =
text.replace(
/(?!#)([^\s]+\.m3u8[^\s]*)/g,

(match)=>{


let full =
match.startsWith("http")
?
match
:
base + match;



return "/proxy?url=" +
encodeURIComponent(full);


}

);





return new Response(
text,
{

headers:{

"content-type":
"application/vnd.apple.mpegurl",

"Access-Control-Allow-Origin":
"*",

"cache-control":
"no-cache"

}

}
);



}





return new Response(
"Fenix Live Cache OK"
);


}

}
