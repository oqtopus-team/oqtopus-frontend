/**
 * Release PR Notes Generator
 *
 * Updates the body of the release PR (develop → main) by generating
 * release notes from PRs included in the main...develop diff.
 *
 * Responsibilities:
 * - Compare commits between main and develop
 * - Resolve associated PRs for each commit
 * - Deduplicate PRs
 * - Classify by labels:
 *     breaking changes > feat > fix > chore > other
 * - Overwrite the release PR description
 *
 * Assumptions:
 * - Runs only on release PRs
 * - Labels are already auto-assigned
 * - GitHub Actions provides github/context/core
 */
export default async function ({ github, context, core }) {
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const prNumber = context.payload.pull_request.number;

  // ==================================================
  // 1. Compare main...develop
  // ==================================================
  const compare = await github.rest.repos.compareCommits({
    owner,
    repo,
    base: "main",
    head: "develop",
  });

  const commits = compare.data.commits || [];

  const seen = new Set();

  const buckets = {
    breaking: [],
    feat: [],
    fix: [],
    chore: [],
    other: [],
  };

  // ==================================================
  // 2. Resolve PRs from commits
  // ==================================================
  for (const commit of commits) {
    const sha = commit.sha;

    const prs = await github.rest.repos.listPullRequestsAssociatedWithCommit({
      owner,
      repo,
      commit_sha: sha,
    });

    const pr = prs.data?.[0];
    if (!pr) continue;
    if (!pr.merged_at) continue;
    if (seen.has(pr.number)) continue;

    seen.add(pr.number);

    const labels = pr.labels.map(l => l.name.toLowerCase());

    const line = `- [#${pr.number}](${pr.html_url}) ${pr.title} (@${pr.user.login})`;

    // Classification priority
    if (labels.includes("breaking changes")) {
      buckets.breaking.push(line);
    } else if (labels.includes("feat") || labels.includes("feature")) {
      buckets.feat.push(line);
    } else if (labels.includes("fix")) {
      buckets.fix.push(line);
    } else if (labels.includes("chore")) {
      buckets.chore.push(line);
    } else {
      buckets.other.push(line);
    }
  }

  // ==================================================
  // 3. Build body
  // ==================================================
  function section(title, items) {
    if (!items.length) return "";
    return `\n## ${title}\n\n${[...new Set(items)].sort().join("\n")}\n`;
  }

  let body = "# Release Notes\n";

  body += section("⚠️ Breaking Changes", buckets.breaking);
  body += section("✨ Features", buckets.feat);
  body += section("🐛 Bug Fixes", buckets.fix);
  body += section("🧹 Chores", buckets.chore);
  body += section("Other Changes", buckets.other);

  if (
    !buckets.breaking.length &&
    !buckets.feat.length &&
    !buckets.fix.length &&
    !buckets.chore.length &&
    !buckets.other.length
  ) {
    body += "\n_No user-facing changes in this release._\n";
  }

  // ==================================================
  // 4. Update PR body
  // ==================================================
  await github.rest.pulls.update({
    owner,
    repo,
    pull_number: prNumber,
    body,
  });

  core.info("Release notes updated.");
};