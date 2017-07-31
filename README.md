# Sepia Scripts

Useful scripts for working with multiple git repositories. All you need is a
configuration file called .sepia.json in the root folder of your project that
contains all your repositories.

This is an example of a configuration file.

```javascript

{
	"artifacts" : [
		"com.liferay.sepia.assets.api",
		"com.liferay.sepia.assets.service"
	],

	"dockerImages" : [
		"liferay/portal:latest"
	],

	"namespace" : "sepia",

	"nexus" : {
		"url" : "https://repository.liferay.com/nexus/service/local/artifact/maven/resolve",
		"username" : "my-name",
		"password" : "my-password",
		"repository" : "liferay-public-snapshots",
		"group" : "com.liferay"
	},

	"repositories" : [
		"liferay-portal",
		"liferay-plugins"
	]
}


```



