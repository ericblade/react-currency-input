# Publishing approved releases

The publish workflow remains triggered by Rolling Versions' `rollingversions_publish_approved` repository dispatch. It uses GitHub-hosted runners, Node24 and npm11 to publish through npm trusted publishing (OIDC), without an npm publishing token.

## One-time npm setup

An account with package settings access must configure the existing `@ericblade/react-currency-input` package on npmjs.com:

1. Open package Settings → Trusted publishing and add a GitHub Actions publisher.
2. Set organization/user to `ericblade`.
3. Set repository to `react-currency-input`.
4. Set workflow filename to `publish.yml` (filename only).
5. Leave the environment name empty; the workflow does not declare a GitHub environment.
6. Allow direct `npm publish` if the settings present an allowed-actions choice. Rolling Versions invokes `npm publish`, not staged publishing. Dist-tag-management permission is not needed for this workflow's normal publish-with-tag operation.

The fields must match exactly. npm does not verify the relationship when settings are saved; the first actual publish verifies it. Current npm documentation requires the first successful publish within two days of creating the trust entry, so configure it when ready to merge and release. If it expires, recreate it.

See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/). This workflow uses npm11, above the documented minimum11.5.1, and Node24, above the minimum22.14. GitHub's `id-token: write` permission supplies OIDC. `contents: write` permits release/tag operations performed by Rolling Versions with `GITHUB_TOKEN`.

## Release and validation

Merge the workflow change into the default branch before approving/retrying a Rolling Versions release. A fresh repository dispatch will use the updated default-branch workflow; rerunning an old failed workflow may use its old definition. Preserve the Rolling Versions approval process rather than running an independent manual publish with an uncoordinated version.

The workflow installs/builds the package and invokes the pinned, inspected Rolling Versions3.5.0. Its publish implementation spawns the runner's `npm publish`, inheriting the OIDC environment. Its `withNpmVersion` helper temporarily changes package versions; it does not downgrade the npm executable. The separate Playwright workflow continues to own browser/React-version tests.

The publish step checks that GitHub has supplied both OIDC request environment variables without printing their values. This checks availability, not npm authorization. `npm whoami` and `npm publish --dry-run` do not validate trusted publishing. Only an approved real release in the configured GitHub workflow completes end-to-end validation.

The workflow no longer uses `secrets.NPM_TOKEN` or setup-node's token-based registry configuration. Private dependencies would require separate read-only installation credentials; this package currently uses public dependencies. Once OIDC publishing succeeds, remove/revoke the unused automation publishing token as appropriate. Do not copy credentials into source or diagnostic logs.

If a publish fails, verify the runner npm version, exact trusted-publisher fields, `id-token: write`, GitHub-hosted runner, and package `repository.url`. An old Node20 workflow indicates that the retry is still using the previous workflow definition. Keep permission/configuration failures separate from package build failures.
