[Weeklong Challenge](https://cliffdotai.notion.site/Junior-Front-End-Engineer-ReactJS-eeb8540ecae04495be68c30cb10de37b)

## 🐳 Run With Docker

-   run `docker-compose up` in the root directory
-   an adminer instance runs at port 8080, use the credentials from `docker-compose.yml` to login

## 🏃‍♂️ Run Without Docker

-   run `npm i && npm start` in `/backend`
    -   change `PGHOST` in `.env` to `localhost`
-   run `npm i && npm start` in `/frontend`
    -   change `target` in `vite.config.ts` to `http://localhost:3000`

## notes

-   login/signup is handled by single route
-   frontend is served at `http://localhost:5173`
-   .env files 
    - [backend](https://pastebin.com/raw/ESzaGRKq) 
    - [frontend](https://pastebin.com/raw/pzG4HauE)
