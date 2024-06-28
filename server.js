import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 3005;

app.get('/', async (req, res) => {
    const { width, player, timeset, theme, bgColor, headerColor, buttonColor, labelColor, ppColor, selectedColor } = req.query;

    if (!width || !player || !timeset) {
        return res.status(400).send('Width and bioFile query parameters are required');
    }

    try {
        const response = await fetch(`https://cdn.assets.beatleader.xyz/player-${player}-richbio-${parseInt(timeset)}.html`);
        if (!response.ok) {
            throw new Error('Failed to fetch bio file');
        }
        const richBio = await response.text();

        const htmlContent = `
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
                            backdrop-filter: blur(10px);
                            box-shadow: inset 0 0 7px 0px #00000029;
                            background-color: #0000000f;
                        }
                        body.ree-dark-theme {
                            background: #121212;
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

        res.send(htmlContent);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching the bio file');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
