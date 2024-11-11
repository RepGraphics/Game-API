# Guide
To get started ensure you have Pterodactyl Installed & Blueprint Framework!

## Installation Steps
- Pick you port and head to Line: 12 in /index.js (const port = 2010;)
- Create a Pterodactyl Node.JS/Nodemon Server using your chosen port.
- Extract & Upload the files in this Folder to the Directory.
- Install NPM Packages using ``npm i``
- Use a NGINX Proxy or Similar setup if using another method to forward the API & Port to a domain.
- Head into the ZIP/.blueprint for euphoriatheme or playerlisting with a code editor, navigate to /components/fetchPlayers.tsx.
- Go to Line: 122 (const BACKEND_API_URL = 'https://api.euphoriadevelopment.uk/api';).
- Enter your designated API URL with /api on the end.
- Save and Repack the .blueprint file.
- Install the .blueprint file using the guide in euphoriatheme.zip or playerlisting.zip