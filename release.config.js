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

    // Create GitHub Release
    "@semantic-release/github",

    // Commit CHANGELOG.md back to main
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
