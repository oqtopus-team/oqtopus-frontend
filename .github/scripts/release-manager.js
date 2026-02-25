/**
 * Release PR Manager
 *
 * This script ensures that a single up-to-date release PR (develop → main)
 * always exists and reflects the latest merged changes.
 *
 * Responsibilities:
 * - Find an existing open release PR from develop to main, or create one if missing
 * - Generate release notes from PRs merged into develop
 * - Classify changes by labels (breaking changes / feature / fix / chore)
 * - Always update the release PR description (idempotent behavior)
 *
 * Assumptions:
 * - Conventional commit–based auto-labeling is already in place
 * - A release PR is uniquely identified by head=develop and base=main
 * - Workflow runs on PR merges into develop
 */
export default async function ({ github, context, core }) {
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const head = "develop";
  const base = "main";

  // ==================================================
  // 1. Find existing open release PR
  // ==================================================
  const { data: openPRs } = await github.rest.pulls.list({
    owner,
    repo,
    state: "open",
    base,
    head: `${owner}:${head}`,
    per_page: 10,
  });

  let releasePR = openPRs[0];

  // ==================================================
  // 2. Create PR if not exists (JST date)
  // ==================================================
  if (!releasePR) {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Tokyo",
    }); // YYYY-MM-DD

    const { data: created } = await github.rest.pulls.create({
      owner,
      repo,
      title: `Release ${today}`,
      head,
      base,
      body: "Auto-generated release PR. Release notes will be updated automatically.",
      maintainer_can_modify: true,
    });

    releasePR = created;

    core.info(`Created release PR #${releasePR.number}`);
  } else {
    core.info(`Found existing release PR #${releasePR.number}`);
  }

  // ==================================================
  // 3. Collect merged PRs into develop (since last main merge)
  // ==================================================
  const mergedPRs = await github.paginate(
    github.rest.pulls.list,
    {
      owner,
      repo,
      state: "closed",
      base: "develop",
      per_page: 100,
    }
  );

  const filtered = mergedPRs.filter(pr =>
    pr.merged_at &&
    pr.number !== releasePR.number
  );

  // ==================================================
  // 4. Classify PRs
  // ==================================================
  const breaking = [];
  const features = [];
  const fixes = [];
  const chores = [];

  for (const pr of filtered) {
    const labels = pr.labels.map(l => l.name);

    const line =
      `- ${pr.title} (#${pr.number}) @${pr.user.login}`;

    if (labels.includes("breaking changes")) {
      breaking.push(line);
    }
    if (labels.includes("feature")) {
      features.push(line);
    }
    if (labels.includes("bugfix")) {
      fixes.push(line);
    }
    if (labels.includes("chore")) {
      chores.push(line);
    }
  }

  // ==================================================
  // 5. Build release note body
  // ==================================================
  function section(title, items) {
    if (!items.length) return "";
    return `\n## ${title}\n${items.join("\n")}\n`;
  }

  let body =
    `Auto-generated release PR.\n` +
    `Release notes are generated from merged PRs into develop.\n`;

  body += section("⚠️ Breaking Changes", breaking);
  body += section("✨ Features", features);
  body += section("🐛 Fixes", fixes);
  body += section("🧹 Chores", chores);

  if (
    !breaking.length &&
    !features.length &&
    !fixes.length &&
    !chores.length
  ) {
    body += "\n_No user-facing changes in this release._\n";
  }

  // ==================================================
  // 6. ALWAYS update PR body
  // ==================================================
  await github.rest.pulls.update({
    owner,
    repo,
    pull_number: releasePR.number,
    body,
  });

  core.info("Release PR body updated.");
}