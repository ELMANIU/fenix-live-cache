export default {
  async fetch(request) {

    const url = new URL(request.url);

    // Permitir preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*"
        }
      });
    }


    const originURL = url.searchParams.get("url");


    if (!originURL) {
      return new Response(
        "Falta parametro url",
        { status: 400 }
      );
    }


    let target;

    try {
      target = decodeURIComponent(originURL);
    } catch {
      target = originURL;
    }



    let response;

    try {

      response = await fetch(target, {

        headers: {
          "User-Agent":
          "Mozilla/5.0",
          
          "Accept":
          "*/*",

          "Referer":
          ""
        }

      });


    } catch(e) {

      return new Response(
        "Error conectando origen",
        {status:502}
      );

    }



    const contentType =
    response.headers.get("content-type") || "";



    /*
       PLAYLIST HLS
    */

    if (
      target.includes(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("apple")
    ) {


      let playlist =
      await response.text();



      const base =
      target.substring(
        0,
        target.lastIndexOf("/")
      );



      playlist = playlist.replace(
        /(?!#)([^\s]+\.m3u8[^\s]*)/g,
        (match)=>{


          let full;


          if(match.startsWith("http")){
            full = match;
          }
          else{
            full =
            base + "/" + match;
          }


          return
          `/proxy?url=${encodeURIComponent(full)}`;

        }
      );




      playlist = playlist.replace(
        /(?!#)([^\s]+\.ts[^\s]*)/g,
        (match)=>{


          let full;


          if(match.startsWith("http")){
            full = match;
          }
          else{
            full =
            base + "/" + match;
          }


          return
          `/proxy?url=${encodeURIComponent(full)}`;


        }
      );



      return new Response(
        playlist,
        {

          headers: {

            "Content-Type":
            "application/vnd.apple.mpegurl",


            "Access-Control-Allow-Origin":
            "*",


            "Cache-Control":
            "no-store, no-cache, must-revalidate"


          }

        }

      );


    }



    /*
       SEGMENTOS TS
    */


    return new Response(
      response.body,
      {

        headers: {


          "Content-Type":
          contentType ||
          "video/mp2t",


          "Access-Control-Allow-Origin":
          "*",


          "Access-Control-Allow-Headers":
          "Range",


          "Accept-Ranges":
          "bytes",


          "Cache-Control":
          "public, max-age=120"



        }

      }

    );



  }
}
