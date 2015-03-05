# ES6 Template v0.0.2

This project provides a build process for using ES6 code that will be transpiled down to ES5/ES3 compatible code so it can be run in most browsers even if they don't support ES6 yet.

The build process is set up to use the SystemJS module loader during development, when compiled to production the code is concatenated and minified into one file and removes the need for SystemJS to be included. Once ES6 and HTTP/2.0 have better support in browsers the need for concatenated and minified files should go away. Until then this concatenated code is here to stay.

## Commands

### `gulp build`
This is what you'll be using for most of development.
This command will gather up all of the app files and dependencies and toss them into the `build/` directory. It will also start the development server with livereload enabled as well as a file watcher.

#### Options

##### `--port`
Setting this will change the port the development server uses. Much easier than changing it manually in `gulpfile.js`.
`gulp build --port 9000`

### `gulp compile`
This command will first run the build command and then it will take all of the app files and dependencies and concatenate them into one file that will then be minified and annotated with `ngAnnotate` so you don't have to implement minified safe code yourself.

This command will change an option that the code is compiled with when running babel. It changes the modules option from whatever it is set to in config.js to `inline` which allows the app to actually work with a concatenated file.

In `index.html` the script block that bootstraps the app will be removed and replaced with a normal `ng-app` attribute since it's not needed anymore.

### `gulp test`
Runs all of the tests in a single run.

### `gulp tdd`
Runs all of the tests but runs the tests again if any changes occur.

## Tasks

### config
This task will take one of the .json files in `src/config/` and create a config angular module that can be imported into your app. The config file that it selects by default is the `dev.json` file. To change which one is used set the `NODE_ENV` environment variable to the name of the file you want to use, excluding the file type.

`NODE_ENV=production gulp compile`

#### Example
**dev.json**

```json
{
  "config": {
      "apiUrl": "http://myapi.com/"
  }
}
```

**config.js**

```javascript
angular
  .module("config", [])
  .constant("config", {
      "apiUrl": "http://myapi.com/"
  });
```

### buildHtml
This task will take all of the `*.tpl.html` files and put them into one angular module that will use angulars templateCache to store them. All you need to do is make sure the `htmlTemplates` module is included in your app somewhere preferably in `app.js`.

## Tests
Tests are a bit tricky to get running with ES6 code, but that's one of the main reasons why I made this template. All tests can run ES6 code and you will need to use `import` statements to import the module you are testing. Everything should work as expected, but you have the advantage of using ES6 in your tests. Yay!

Basically what I've done to make it work is delay the start of the karma test runner until all modules have been loaded. Once they are karma will continue like normal and everything should work.
