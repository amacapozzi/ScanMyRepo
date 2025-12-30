import { Elysia, t } from "elysia";

import { GithubService } from "@modules/github/infra/github.service";
import { GITHUB_CONSTS } from "@shared/constants/github";

const github = new GithubService({
  token: GITHUB_CONSTS.secret
});

export const githubRoutes = new Elysia({ prefix: "/github" })
  .get(
    "/user/:username/repos",
    async ({ params }) => {
      return github.listUserRepos(params.username);
    },
    { params: t.Object({ username: t.String() }) }
  )
  .get(
    "/repo/:owner/:repo/tree",
    async ({ params, query }) => {
      const tree = await github.getRepoTree(params.owner, params.repo, query.ref);
      return tree;
    },
    {
      params: t.Object({ owner: t.String(), repo: t.String() }),
      query: t.Object({ ref: t.Optional(t.String()) })
    }
  );
