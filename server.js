import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 3005;

app.get('/', async (req, res) => {
    const { width, player, timeset } = req.query;

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
            <html>
                <head>
                    <style>
                        html {
                            overflow-x: hidden;
                            overflow-y: auto;
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                            width: ${width}px;
                        }
                        html::-webkit-scrollbar {
                            display: none;
                        }
                    </style>
                    <script>
                        function sendHeight() {
                            var height = document.body.offsetHeight;
                            window.parent.postMessage({
                                'frameHeight': height
                            }, '*');
                        }
                        
                        window.onload = sendHeight;  // Send initial height
                        window.onresize = sendHeight;  // Update height on resize
                    </script>
                </head>
                ${richBio}
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
