export default {
  async fetch(request) {

    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers:{
          "Access-Control-Allow-Origin":"*",
          "Access-Control-Allow-Methods":"GET, OPTIONS",
          "Access-Control-Allow-Headers":"*"
        }
      });
    }


    const originURL = url.searchParams.get("url");

    if(!originURL){
      return new Response("Falta url",{status:400});
    }


    const target = decodeURIComponent(originURL);


    let response;

    try{

      response = await fetch(target,{
        headers:{
          "User-Agent":"Mozilla/5.0",
          "Accept":"*/*"
        }
      });

    }catch(e){

      return new Response(
        "Error origen",
        {status:502}
      );

    }


    const type =
    response.headers.get("content-type") || "";


    // PLAYLIST

    if(
      target.includes(".m3u8") ||
      type.includes("mpegurl")
    ){

      let text = await response.text();


      const base =
      target.substring(
        0,
        target.lastIndexOf("/")
      );



      text = text.replace(
        /(?!#)([^\s]+\.m3u8[^\s]*)/g,
        function(match){

          let full = match.startsWith("http")
          ? match
          : base + "/" + match;


          return "/proxy?url=" + encodeURIComponent(full);

        }
      );



      text = text.replace(
        /(?!#)([^\s]+\.ts[^\s]*)/g,
        function(match){

          let full = match.startsWith("http")
          ? match
          : base + "/" + match;


          return "/proxy?url=" + encodeURIComponent(full);

        }
      );



      return new Response(
        text,
        {
          headers:{
            "Content-Type":
            "application/vnd.apple.mpegurl",

            "Access-Control-Allow-Origin":"*",

            "Cache-Control":
            "no-store"
          }
        }
      );

    }



    // SEGMENTOS TS


    return new Response(
      response.body,
      {
        headers:{

          "Content-Type":
          type || "video/mp2t",

          "Access-Control-Allow-Origin":"*",

          "Accept-Ranges":"bytes",

          "Cache-Control":
          "public,max-age=120"

        }
      }
    );

  }
}
