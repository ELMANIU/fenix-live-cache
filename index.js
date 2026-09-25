export default {
async fetch(request) {

const url = new URL(request.url);

const origin = url.searchParams.get("url");

if(!origin){
return new Response("Falta URL",{status:400});
}


const target = decodeURIComponent(origin);


let response;

try{

response = await fetch(target,{
headers:{
"User-Agent":
"Mozilla/5.0",
"Accept":
"*/*"
}
});

}catch(e){

return new Response(
"Error origen",
{status:502}
);

}



let type =
response.headers.get("content-type") || "";


// HLS MASTER / PLAYLIST

if(
target.includes(".m3u8") ||
type.includes("mpegurl")
){

let text = await response.text();


// convertir rutas relativas

let base =
target.substring(
0,
target.lastIndexOf("/")
);


text=text.replace(
/(?!#)([^"\n]+\.m3u8[^"\n]*)/g,
match=>{

if(match.startsWith("http"))
return `/proxy?url=${encodeURIComponent(match)}`;

return `/proxy?url=${encodeURIComponent(base+"/"+match)}`;

}
);


text=text.replace(
/(?!#)([^"\n]+\.ts[^"\n]*)/g,
match=>{

if(match.startsWith("http"))
return `/proxy?url=${encodeURIComponent(match)}`;

return `/proxy?url=${encodeURIComponent(base+"/"+match)}`;

}
);


return new Response(text,{

headers:{

"content-type":
"application/vnd.apple.mpegurl",

"Access-Control-Allow-Origin":"*",

"Cache-Control":
"no-store"

}

});

}


// SEGMENTOS TS


return new Response(
response.body,
{

headers:{

"content-type":
type || "video/mp2t",

"Access-Control-Allow-Origin":"*",

"Cache-Control":
"public,max-age=60"

}

});


}
}
