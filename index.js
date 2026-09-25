export default {
async fetch(request, env) {

const url = new URL(request.url);

const channels = {

history:
"https://cablered.iptvperu.tv:1936/cablered/history/playlist.m3u8"

};


let key = url.pathname.replace("/","");

if(!channels[key]){
return new Response("Canal no encontrado",
{status:404});
}


let origin = channels[key];


let response = await fetch(origin,{
headers:{
"User-Agent":"Mozilla/5.0"
}
});


let type=response.headers.get("content-type") || "";


if(type.includes("mpegurl")){


let text = await response.text();


let base = origin.substring(
0,
origin.lastIndexOf("/") + 1
);


// convertir rutas relativas
text=text.replace(
/(?!#)([a-zA-Z0-9_\-]+\.m3u8[^\s]*)/g,
match=>{
return "/proxy?url="+
encodeURIComponent(base+match);
});


text=text.replace(
/(?!#)([a-zA-Z0-9_\-]+\.ts)/g,
match=>{
return "/proxy?url="+
encodeURIComponent(base+match);
});


return new Response(text,{
headers:{
"content-type":"application/vnd.apple.mpegurl",
"cache-control":"no-cache",
"access-control-allow-origin":"*"
}
});


}


// si es segmento


return response;

}
}
