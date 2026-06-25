#!/usr/bin/env bash

set -e

DOCKER_IMAGE="${DOCKER_IMAGE:-qaguru/selenoid-ui}"

if [ -z "${DOCKER_USERNAME:-}" ] || [ -z "${DOCKER_PASSWORD:-}" ]; then
	echo "ERROR: Docker push for ${DOCKER_IMAGE} requires DOCKER_USERNAME and DOCKER_PASSWORD repository secrets" >&2
	exit 1
fi

docker build --pull -t "${DOCKER_IMAGE}" .
docker tag "${DOCKER_IMAGE}" "${DOCKER_IMAGE}:${1}"
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker push "${DOCKER_IMAGE}"
docker push "${DOCKER_IMAGE}:${1}"

if [ -n "${QUAY_USERNAME:-}" ] && [ -n "${QUAY_PASSWORD:-}" ]; then
	docker build --pull -f quay/Dockerfile -t "quay.io/${GITHUB_REPOSITORY}" .
	docker tag "quay.io/${GITHUB_REPOSITORY}" "quay.io/${GITHUB_REPOSITORY}:${1}"
	docker login -u="$QUAY_USERNAME" -p="$QUAY_PASSWORD" quay.io
	docker push "quay.io/${GITHUB_REPOSITORY}"
	docker push "quay.io/${GITHUB_REPOSITORY}:${1}"
else
	echo "Skipping Quay push: QUAY_USERNAME/QUAY_PASSWORD not set"
fi
