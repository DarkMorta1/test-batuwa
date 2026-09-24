Server README

1) Install dependencies

  cd server
  npm install

2) Copy .env.example to .env and fill values

  MONGO_URI=mongodb://localhost:27017/batwa_trip
  JWT_SECRET=replace_with_a_strong_secret
  PORT=4000

3) Seed the admin user (creates username `admin` with the provided password)

  npm run seed-admin

4) Run server in dev

  npm run dev

Notes:
- Admin credentials: username: admin, password: B@twaTr@vels_20/05_pass
- Frontend expects backend base URL in Vite env `VITE_API_URL` (defaults to http://localhost:4000)
- Uploaded images are stored in the project's `images/` folder and served from `/images/<filename>`
