export default {
async fetch(request) {

const url = new URL(request.url);


const canales = {

history:
"https://cablered.iptvperu.tv:1936/cablered/history/playlist.m3u8"

};


//
// PROXY GENERAL
//
if(url.pathname === "/proxy"){

let target = url.searchParams.get("url");

if(!target){
return new Response("Sin URL",
{status:400});
}


let cache = caches.default;

let cacheKey = new Request(target);


let cached = await cache.match(cacheKey);


if(cached){
return cached;
}


let res = await fetch(target,{
headers:{
"User-Agent":"Mozilla/5.0"
}
});


let headers = new Headers(res.headers);


headers.set(
"Access-Control-Allow-Origin",
"*"
);



let type=headers.get("content-type") || "";


if(type.includes("mpegurl")){


let text = await res.text();


let base =
target.substring(
0,
target.lastIndexOf("/") + 1
);



text=text.replace(
/(?!#)([^\s]+\.m3u8[^\s]*)/g,
m=>{
return "/proxy?url="+
encodeURIComponent(base+m);
}
);


text=text.replace(
/(?!#)([^\s]+\.ts)/g,
m=>{
return "/proxy?url="+
encodeURIComponent(base+m);
}
);


headers.set(
"cache-control",
"no-cache"
);


let response=new Response(
text,
{
status:200,
headers
}
);


await cache.put(
cacheKey,
response.clone()
);


return response;


}


//
// SEGMENTOS TS
//

headers.set(
"cache-control",
"public,max-age=120"
);


let response=new Response(
res.body,
{
status:res.status,
headers
}
);


await cache.put(
cacheKey,
response.clone()
);


return response;


}



//
// CANALES
//

let canal=url.pathname.replace("/","");


if(canales[canal]){


let res=await fetch(
canales[canal],
{
headers:{
"User-Agent":"Mozilla/5.0"
}
}
);


let text=await res.text();


let base=
canales[canal].substring(
0,
canales[canal].lastIndexOf("/") + 1
);



text=text.replace(
/(?!#)([^\s]+\.m3u8[^\s]*)/g,
m=>{
return "/proxy?url="+
encodeURIComponent(base+m);
}
);



return new Response(
text,
{
headers:{
"content-type":
"application/vnd.apple.mpegurl",
"Access-Control-Allow-Origin":"*",
"cache-control":"no-cache"
}
}
);


}


return new Response(
"Fenix Cache Worker OK"
);

}

}
