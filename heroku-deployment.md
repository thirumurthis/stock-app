
### Tips to deploying node.js application to heroku.

#### update the package.json, with appropriately
 - Add the scripts section
 - Add the engine section (at this time the 16+ was the nodejs version used)
    - Failing to add, will cause starting issues in Deployment.
```
"engines": {
    "node": "16.x"
  },  
"scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

#### Use port `process.env.PORT || 5000`, initially faced time-out exception fetching the port 
