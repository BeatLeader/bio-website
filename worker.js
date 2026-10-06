const CDN_BASE = "https://cdn.assets.beatleader.com";
const BIO_CACHE_TTL_SECONDS = 3600;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { allow: "GET, HEAD" },
      });
    }

    const q = url.searchParams;
    const width = q.get("width");
    const player = q.get("player");
    const timeset = q.get("timeset");

    if (!width || !player || !timeset) {
      return new Response("Width and bioFile query parameters are required", {
        status: 400,
      });
    }

    try {
      const bioUrl = `${CDN_BASE}/player-${player}-richbio-${parseInt(timeset)}.html`;
      const response = await fetch(bioUrl, {
        cf:
          BIO_CACHE_TTL_SECONDS > 0
            ? { cacheEverything: true, cacheTtl: BIO_CACHE_TTL_SECONDS }
            : undefined,
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch bio file (${response.status})`);
      }
      const richBio = await response.text();

      const html = renderPage({
        width,
        richBio,
        theme: q.get("theme") ?? "",
        bgColor: q.get("bgColor") ?? "",
        headerColor: q.get("headerColor") ?? "",
        buttonColor: q.get("buttonColor") ?? "",
        labelColor: q.get("labelColor") ?? "",
        ppColor: q.get("ppColor") ?? "",
        selectedColor: q.get("selectedColor") ?? "",
      });

      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch (err) {
      console.error(err);
      return new Response("Error fetching the bio file", { status: 500 });
    }
  },
};

function renderPage({
  width,
  richBio,
  theme,
  bgColor,
  headerColor,
  buttonColor,
  labelColor,
  ppColor,
  selectedColor,
}) {
  return `
            <!DOCTYPE html>
            <html data-overlayscrollbars-initialize>
                <head>
                    <style>
                        html {
                            width: ${width}px;
                        }
                        :root {
                            --bgColor: ${bgColor};
                            --headerColor: ${headerColor};
                            --buttonColor: ${buttonColor};
                            --labelColor: ${labelColor};
                            --ppColor: ${ppColor};
                            --selectedColor: ${selectedColor};
                        }
                        .os-theme-dark {
                            --os-handle-bg: rgb(183 183 183 / 44%) !important;
                            --os-handle-bg-hover: rgba(0,0,0,.55);
                            --os-handle-bg-active: rgba(0,0,0,.66);
                        }
                        body.default-theme {
                            background-color: #3d3d3d;
                        }
                        body.mirror-theme {
                            box-shadow: inset 0 0 7px 0px #00000029;
                            background-color: rgba(0, 0, 0, 0.2);
                        }
                        body.mirror-low-theme {
                            background-color: rgba(0, 0, 0, 0.2);
                        }
                        body.ree-dark-theme {
                            background: #121212;
                        }
                        body.flylight-theme {
                            background-color: rgba(0, 0, 0, 0.1);
                        }
                        
                    </style>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/overlayscrollbars/2.3.0/styles/overlayscrollbars.min.css" integrity="sha512-MMVRaRR0pB97w1tzt6+29McVwX+YsQcSlIehGCGqFsC+KisK3d2F/xRxFaGMN7126EeC3A6iYRhdkr5nY8fz3Q==" crossorigin="anonymous" referrerpolicy="no-referrer" />
                    
                </head>
                <body data-overlayscrollbars-initialize class="${theme}-theme">
                    ${richBio}
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/overlayscrollbars/2.3.0/browser/overlayscrollbars.browser.es6.min.js" integrity="sha512-tu2VesH7qQi/IX4MN47Zw0SCia4hgBgu4xY/fP/gV2XcqdZsIh1B5wbSy4Mk5AhkkfTj/XMDQt86wzsZIsxPSA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
                    <script>
                        function sendHeight() {
                            var height = document.body?.offsetHeight;
                            window.parent.postMessage({
                                'frameHeight': height
                            }, '*');
                        }
                        
                        window.onload = sendHeight;
                        window.onresize = sendHeight;
                        document.onreadystatechange = sendHeight;

                        const scrollbars = OverlayScrollbarsGlobal.OverlayScrollbars(document.body, {overflow: {x: "hidden"}, scrollbars: { theme: 'os-theme-dark', autoHide: "scroll", dragScroll: true }});
                    </script>
                </body>
            </html>`;
}
