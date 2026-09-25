const CHANNELS = {

history:
"https://cablered.iptvperu.tv:1936/cablered/history/playlist.m3u8",

cinepremium:
"URL_CINEPREMIUM",

hboplus:
"URL_HBOPLUS",

fxfenix:
"URL_FXFENIX",

space:
"URL_SPACE",

tntseries:
"URL_TNTSERIES",

tntnovelas:
"URL_TNTNOVELAS",

cartoonnetwork:
"URL_CARTOON",

discoveryfenix:
"URL_DISCOVERY",

disneychannel:
"URL_DISNEY",

goldenedgefenix:
"URL_GOLDEN",

hbofamilyhd:
"URL_HBOFAMILY",

venus:
"URL_VENUS"

};



function cors(headers){

headers.set(
"Access-Control-Allow-Origin",
"*"
);

headers.set(
"Access-Control-Allow-Headers",
"*"
);

return headers;

}



export default {

async fetch(request, env, ctx){


const url = new URL(request.url);


let parts=url.pathname
.split("/")
.filter(Boolean);


if(parts.length < 2){

return new Response(
"FENIX LIVE CACHE OK"
);

}


let channel=parts[0];


if(!CHANNELS[channel]){

return new Response(
"Canal no configurado",
{status:404}
);

}



let originURL;



// playlist principal

if(parts[1]=="playlist.m3u8"){


originURL=CHANNELS[channel];


}



// segmentos

else {


let playlistURL=new URL(
CHANNELS[channel]
);


originURL=
playlistURL.origin+
playlistURL.pathname
.replace(
"playlist.m3u8",
parts[1]
);


}



let cache=caches.default;


let cacheKey=new Request(
request.url,
request
);



let cached=await cache.match(cacheKey);


if(cached){

return cached;

}



let response=await fetch(
originURL,
{
headers:{
"User-Agent":
request.headers.get("User-Agent") || "Mozilla/5.0"
}
}
);



let headers=new Headers(
response.headers
);


cors(headers);



if(originURL.includes(".m3u8")){


let text=await response.text();


// convertir segmentos relativos al Worker


text=text.replace(
/(?!#)([^\s]+\.ts)/g,
`/${channel}/$1`
);



headers.set(
"Content-Type",
"application/vnd.apple.mpegurl"
);


headers.set(
"Cache-Control",
"public,max-age=5"
);


response=new Response(
text,
{
status:response.status,
headers
}
);



}else{


headers.set(
"Cache-Control",
"public,max-age=3600"
);


response=new Response(
response.body,
{
status:response.status,
headers
}
);


}



ctx.waitUntil(
cache.put(
cacheKey,
response.clone()
)
);



return response;


}

};
