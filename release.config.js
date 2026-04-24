// Place this file in the application repo root as: release.config.js
// Conventional Commits → SemVer mapping for semantic-release

module.exports = {
  branches: ["main"],
  plugins: [
    // Analyze commits using Conventional Commits spec
    "@semantic-release/commit-analyzer",

    // Generate release notes from commits
    "@semantic-release/release-notes-generator",

    // Update CHANGELOG.md
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],

    // Bump version in package.json (publishConfig.access=restricted keeps it private)
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],

    // Create GitHub Release
    "@semantic-release/github",

    // Commit CHANGELOG.md + package.json back to main
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
