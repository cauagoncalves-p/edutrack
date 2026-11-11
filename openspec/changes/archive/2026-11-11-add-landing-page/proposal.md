# Change: add-landing-page

## Why
Visitors who are not logged in need to understand what EduTrack AI offers
before creating an account. Until now, the root address sent everyone
straight into the login flow.

## What Changes
- Add a public landing page at `/` with a hero, feature overview, "how it works" steps and calls to action
- Route all calls to action to the login page
- Redirect authenticated users from `/` to `/dashboard`
- Keep the landing page in the light theme regardless of the app theme
- Clear an expired or invalid session automatically and send the user to the login page

## Impact
- New `Landing` page and stylesheet in `edutrack-front`
- `/` no longer redirects directly to `/dashboard`
- Axios response interceptor added in `edutrack-front/src/api/axios.js`
- No backend or database changes