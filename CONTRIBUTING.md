# Contributing

Thank you for your interest in contributing! Please feel free to put up a PR for any issue or feature request.
Even if you have little to no experience with Angular, I'll be more than happy to help. :)

## Setup

1. Fork the repo
2. Clone your fork
3. Make a branch for your feature or bug fix
4. Ensure you have a supported Node.js version installed (`^20.19 || ^22.12 || ^24`)
5. `npm install` to install dependencies (this includes the Angular CLI locally — no global install needed; run it via `npx ng ...`)
6. Run `npm start` and open `localhost:4200` in a browser
7. Work your magic
8. Run `npm run lint`, `npm test`, and `npm run e2e` to make sure nothing is broken (for e2e, run `npx playwright install chromium` once first)
9. Run `npm run build` to make sure the production build succeeds
10. To test service worker changes, run `npm run build` and serve the `dist/angular-hnpwa` output over HTTP (e.g. `npx http-server dist/angular-hnpwa -p 8080`) — the service worker is disabled in the dev server
11. Add yourself to the [contributor's list](https://github.com/hdjirdeh/angular2-hn#contributors) in the README!
12. Commit your changes and reference the issue you're addressing (for example: `git commit -am 'Commit message. Closes #5'`)
13. Push your branch to your fork
14. Create a pull request from your branch on your fork to `master` on this repo
15. Have your branch get merged in! :star2:

If you experience a problem at any point, please don't hesitate to file an issue or send me a message!
