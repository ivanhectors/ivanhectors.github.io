# Ivan Hectors' personal website

This site is built with Jekyll, Liquid templates, SCSS, and Gulp.

## Local preview

Install Ruby 3.3 with DevKit and Node.js 24 or newer, then install the project
dependencies:

```sh
bundle install
npm install
```

Start the local preview:

```sh
npm start
```

Gulp builds the Jekyll site and serves it with BrowserSync. On Windows
PowerShell, use `npm.cmd` instead of `npm` if script execution is blocked:

```powershell
npm.cmd install
npm.cmd start
```

## Project content

Project cards and detail dialogs are driven by `_data/recent-projects.yml`.
Set each project's `client_id` to an `id` in `_data/clients.yml`; client names,
optional `logo_url` values, and industry badges come from that client record.
Set `platform` to `Web`, `Mobile`, or `Web & Mobile`, and `project_period` to
the month-and-year range shown on each card. Web projects use
`action_type: web_application` and `url`; mobile projects use
`action_type: mobile_app` and may define `app_store_url` and `play_store_url`.
Set `show_gallery: false` to omit the gallery from a project's detail dialog.
The home page shows up to six projects; View All includes search and filters.

## Experience content

Each company in `_data/experience.yml` can include a `location`, a
`tenure_start`/`tenure_end` month range, and one or more `roles`. Role entries
can include a `highlights` list of experience bullet points. Company tenure is
calculated automatically from the month fields; use `present` for a current
role. Leave `location` or `highlights` empty until their content is ready.

The Resume page renders the repository's `resume.pdf` with a custom PDF.js
viewer. Replace that file to update the document; the page provides print,
direct download, and zoom controls.
