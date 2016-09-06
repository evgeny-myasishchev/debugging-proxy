module.exports = {
    "globals": {
      "DEVTOOLS_ENABLED": true
    },
    "env": {
      "browser": true
    },
    "extends": ["eslint:recommended", "plugin:react/recommended"],
    "plugins": [ "react" ],
    "rules" : {
      "import/no-extraneous-dependencies": ["error", {"devDependencies": true}]
    }
};
