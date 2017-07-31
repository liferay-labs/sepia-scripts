#!/usr/bin/env bash

PROVIDED_NAMES=(
"com.liferay.osb.faro.site.assets.api"
"com.liferay.osb.faro.site.assets.service"
"com.liferay.osb.faro.site.assets.web"
"com.liferay.osb.faro.site.campaigns.api"
"com.liferay.osb.faro.site.campaigns.service"
"com.liferay.osb.faro.site.campaigns.web"
"com.liferay.osb.faro.site.contacts.api"
"com.liferay.osb.faro.site.contacts.demo"
"com.liferay.osb.faro.site.contacts.engine.client"
"com.liferay.osb.faro.site.contacts.service"
"com.liferay.osb.faro.site.contacts.web"
"com.liferay.osb.faro.site.settings.web"
"com.liferay.osb.faro.site.touchpoints.api"
"com.liferay.osb.faro.site.touchpoints.demo"
"com.liferay.osb.faro.site.touchpoints.proxy.client"
"com.liferay.osb.faro.site.touchpoints.service"
"com.liferay.osb.faro.site.touchpoints.shared.components"
"com.liferay.osb.faro.site.touchpoints.web"
);

TEST_INTEGRATION_COMPILE_NAMES=(
"com.liferay.osb.faro.site.functional.test.util"
);

for NAME in ${PROVIDED_NAMES[@]}
do
    VERSION=$(curl -s -X GET -u private:0GgG9J3X42k677H -H "Accept: application/json" -H "Content-Type: application/json"  "https://repository.liferay.com/nexus/service/local/artifact/maven/resolve?g=com.liferay.osb.faro&a=${NAME}&v=LATEST&r=liferay-private-snapshots"|jq '.data.version')

    DEPENDENCY="provided group: \"com.liferay.osb.faro\", name: \"${NAME}\", version: ${VERSION}"

    echo ${DEPENDENCY} >> result.txt
done

for NAME in ${TEST_INTEGRATION_COMPILE_NAMES[@]}
do
    VERSION=$(curl -s -X GET -u private:0GgG9J3X42k677H -H "Accept: application/json" -H "Content-Type: application/json"  "https://repository.liferay.com/nexus/service/local/artifact/maven/resolve?g=com.liferay.osb.faro&a=${NAME}&v=LATEST&r=liferay-private-snapshots"|jq '.data.version')

    DEPENDENCY="testIntegrationCompile group: \"com.liferay.osb.faro\", name: \"${NAME}\", version: ${VERSION}"

    echo ${DEPENDENCY} >> result.txt
done

