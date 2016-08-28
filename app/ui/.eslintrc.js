module.exports = {
    "env": {
      "browser": true
    },
    "extends": ["eslint:recommended", "plugin:react/recommended"],
    "plugins": [ "react" ],
    "rules" : {
      "import/no-extraneous-dependencies": ["error", {"devDependencies": true}]
    }
};
