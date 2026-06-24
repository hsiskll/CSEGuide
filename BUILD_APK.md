# CSEGuide — building the Android APK

This app is now a **100% static client-side app** (no Node server). The Gemini
calls run directly in the browser using the key you enter in **Settings**.
That makes it packageable as an APK and as an installable PWA.

## How the APK gets built (automatic, in GitHub)

A GitHub Actions workflow (`.github/workflows/build-apk.yml`) builds the APK for
you on every push to `main`:

1. Push these files to your repo.
2. Go to the **Actions** tab → watch the "Build Android APK" run.
3. When it finishes, grab the APK from either:
   - the run's **Artifacts** (`CSEGuide-debug-apk`), or
   - the auto-created **Release** (`build-<number>`).
4. Copy the `.apk` to your tablet and install it (allow "install from unknown sources").

You can also trigger a build manually: Actions tab → Build Android APK → **Run workflow**.

## Using the app

Open the app → **Settings** → paste your Gemini API key. It's stored locally on
the device (localStorage) and used directly for all AI features. No server needed.

## Alternative: install as a PWA (no APK at all)

`npm run build` produces a static `dist/` you can publish to GitHub Pages (like your
Scholar/Atlas apps). Open it in Chrome on your tablet → "Add to Home screen" → it
installs as a standalone app with offline caching. You can also feed the Pages URL
to https://www.pwabuilder.com to get a signed APK without any build server.

## Local commands

```
npm install        # install deps
npm run dev         # local dev server
npm run build       # produce static dist/
```
